import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import process from "node:process";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import test from "node:test";
import { createContent, formatContentDate } from "../scripts/new-content.mjs";

const requireFromAstro = createRequire(import.meta.resolve("astro"));
const { parse } = await import(requireFromAstro.resolve("yaml"));
const scriptPath = fileURLToPath(
  new URL("../scripts/new-content.mjs", import.meta.url),
);

async function temporaryRoot(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "jarvis-content-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}

async function readFrontmatter(file) {
  const source = await fs.readFile(file, "utf8");
  return parse(source.match(/^---\n([\s\S]*?)\n---\n/)[1]);
}

test("new nested posts preserve YAML text and start as drafts with unique comment IDs", async (t) => {
  const root = await temporaryRoot(t);
  const title = 'Quotes "and" backslashes \\ with\na new line';
  const series = 'Series "one"\nnext line';
  const file = await createContent(
    {
      kind: "post",
      title,
      slug: "rec/new-post",
      template: "mdx",
      series,
      seriesOrder: 2,
    },
    { root },
  );
  assert.equal(file, path.join(root, "src/content/blog/rec/new-post.mdx"));
  const data = await readFrontmatter(file);
  assert.equal(data.title, title);
  assert.equal(data.series, series);
  assert.equal(data.seriesOrder, 2);
  assert.equal(data.commentId, "blog-rec/new-post");
  assert.equal(data.draft, true);
  assert.equal(data.language, "zh-CN");
});

test("new projects use the current content fields and create missing directories", async (t) => {
  const root = await temporaryRoot(t);
  const file = await createContent(
    { kind: "project", title: "Example Project" },
    { root },
  );
  const data = await readFrontmatter(file);
  assert.equal(
    file,
    path.join(root, "src/content/projects/example-project.md"),
  );
  assert.equal(data.status, "in-progress");
  assert.equal(data.featured, false);
  assert.equal(data.githubUrl, "");
  assert.equal(data.externalUrl, "");
  assert.deepEqual(data.aliases, []);
});

test("duplicate slugs across Markdown and MDX never overwrite existing content", async (t) => {
  const root = await temporaryRoot(t);
  const file = await createContent(
    { kind: "post", title: "Original", slug: "same" },
    { root },
  );
  const original = await fs.readFile(file, "utf8");
  for (const template of ["md", "mdx"]) {
    await assert.rejects(
      createContent(
        { kind: "post", title: "Replacement", slug: "same", template },
        { root },
      ),
      /already exists/,
    );
  }
  assert.equal(await fs.readFile(file, "utf8"), original);
});

test("invalid paths and options fail before creating content", async (t) => {
  const root = await temporaryRoot(t);
  for (const slug of [
    "../outside",
    "/absolute",
    "rec/../outside",
    "rec//post",
    "rec\\post",
    "post.md",
  ]) {
    await assert.rejects(
      createContent({ kind: "post", title: "Example", slug }, { root }),
      /Slug/,
    );
  }
  for (const options of [
    { title: " " },
    { template: "html" },
    { series: "Example", seriesOrder: -1 },
    { series: "Example", seriesOrder: 1.5 },
    { seriesOrder: 2 },
    { kind: "project", series: "Example" },
  ]) {
    await assert.rejects(
      createContent({ kind: "post", title: "Example", ...options }, { root }),
    );
  }
  assert.deepEqual(await fs.readdir(root), []);
});

test("content dates follow the configured timezone rather than UTC", () => {
  const date = new Date("2026-10-23T16:30:00Z");
  assert.equal(formatContentDate(date, "Asia/Shanghai"), "2026-10-24");
  assert.equal(formatContentDate(date, "UTC"), "2026-10-23");
});

test("CLI help and argument errors work without prompts or writes from another directory", async (t) => {
  const cwd = await temporaryRoot(t);
  const help = spawnSync(process.execPath, [scriptPath, "post", "--help"], {
    cwd,
    encoding: "utf8",
  });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /rec\/my-post/);
  const missing = spawnSync(process.execPath, [scriptPath, "post"], {
    cwd,
    encoding: "utf8",
  });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Provide --title/);
  const unknown = spawnSync(
    process.execPath,
    [scriptPath, "post", "--unknown"],
    { cwd, encoding: "utf8" },
  );
  assert.equal(unknown.status, 1);
  assert.deepEqual(await fs.readdir(cwd), []);
});
