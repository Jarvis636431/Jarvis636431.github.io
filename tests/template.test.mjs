import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import test from "node:test";
import { buildTemplate } from "../scripts/build-template.mjs";

const sourceRoot = fileURLToPath(new URL("../", import.meta.url));

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "jarvis-template-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  for (const entry of await fs.readdir(sourceRoot, { withFileTypes: true })) {
    if (entry.isFile() && !entry.name.startsWith(".env"))
      await fs.copyFile(
        path.join(sourceRoot, entry.name),
        path.join(root, entry.name),
      );
  }
  await fs.copyFile(
    path.join(sourceRoot, ".env.example"),
    path.join(root, ".env.example"),
  );
  for (const directory of [
    "src",
    "scripts",
    "tests",
    "docs",
    ".github",
    "public",
  ]) {
    await fs.cp(path.join(sourceRoot, directory), path.join(root, directory), {
      recursive: true,
    });
  }
  return root;
}

test("the template uses shared implementation, empty content, defaults and safe CI", async (t) => {
  const root = await fixture(t);
  await fs.writeFile(
    path.join(root, ".env"),
    "PRIVATE_TEST_VALUE=do-not-copy\n",
  );
  await fs.writeFile(
    path.join(root, ".env.example"),
    "PUBLIC_GISCUS_REPO_ID=personal-id\n",
  );
  const { output } = await buildTemplate({ root });
  const { profile } = await import(
    pathToFileURL(path.join(output, "src/config/profile.mjs"))
  );
  const { integrationConfig } = await import(
    pathToFileURL(path.join(output, "src/config/integrations.mjs"))
  );
  assert.equal(profile.name, "Your Name");
  assert.equal(profile.githubUsername, "");
  assert.deepEqual(profile.experiences, []);
  assert.equal(integrationConfig.comments.enabled, false);
  assert.equal(integrationConfig.viewCounter.enabled, false);
  assert.equal(integrationConfig.contributions.sync, false);
  assert.doesNotMatch(
    await fs.readFile(path.join(output, ".env.example"), "utf8"),
    /personal-id/,
  );
  for (const collection of ["blog", "projects"])
    assert.deepEqual(
      await fs.readdir(path.join(output, "src/content", collection)),
      [".gitkeep"],
    );
  assert.deepEqual(
    JSON.parse(
      await fs.readFile(
        path.join(output, "src/data/contributions.generated.json"),
      ),
    ),
    { author: "", pullRequests: [] },
  );
  const pkg = JSON.parse(await fs.readFile(path.join(output, "package.json")));
  assert.equal(pkg.name, "astro-template");
  assert.equal(pkg.scripts["template:build"], undefined);
  for (const file of [
    ".git",
    ".env",
    "public/logo.png",
    "scripts/build-template.mjs",
    "tests/template.test.mjs",
    ".github/workflows/sync-contributions.yml",
  ]) {
    await assert.rejects(fs.access(path.join(output, file)), {
      code: "ENOENT",
    });
  }
  assert.match(
    await fs.readFile(
      path.join(output, ".github/workflows/verify.yml"),
      "utf8",
    ),
    /^ {2}push:/m,
  );
  assert.doesNotMatch(
    await fs.readFile(
      path.join(output, ".github/workflows/deploy.yml"),
      "utf8",
    ),
    /^ {2}push:/m,
  );
  assert.equal(
    await fs.readFile(
      path.join(output, "src/lib/markdown/plugins.mjs"),
      "utf8",
    ),
    await fs.readFile(path.join(root, "src/lib/markdown/plugins.mjs"), "utf8"),
  );
});

test("regeneration updates managed files but preserves Git, local files and dependencies", async (t) => {
  const root = await fixture(t);
  await fs.writeFile(
    path.join(root, "src/lib/obsolete.ts"),
    "export const old = true;\n",
  );
  const { output } = await buildTemplate({ root });
  await fs.mkdir(path.join(output, ".git"));
  await fs.writeFile(path.join(output, ".git/config"), "keep Git metadata\n");
  await fs.writeFile(path.join(output, ".env"), "keep local environment\n");
  await fs.writeFile(path.join(output, "notes.txt"), "keep unmanaged file\n");
  await fs.mkdir(path.join(output, "node_modules"));
  await fs.writeFile(
    path.join(output, "node_modules/keep.txt"),
    "keep dependencies\n",
  );
  await fs.unlink(path.join(root, "src/lib/obsolete.ts"));
  await fs.appendFile(
    path.join(root, "src/pages/index.astro"),
    "\n<!-- updated -->\n",
  );
  await buildTemplate({ root });
  assert.match(
    await fs.readFile(path.join(output, "src/pages/index.astro"), "utf8"),
    /updated/,
  );
  await assert.rejects(fs.access(path.join(output, "src/lib/obsolete.ts")), {
    code: "ENOENT",
  });
  for (const [file, expected] of [
    [".git/config", "keep Git metadata\n"],
    [".env", "keep local environment\n"],
    ["notes.txt", "keep unmanaged file\n"],
    ["node_modules/keep.txt", "keep dependencies\n"],
  ]) {
    assert.equal(await fs.readFile(path.join(output, file), "utf8"), expected);
  }
  const before = await fs.readFile(
    path.join(output, ".template-manifest.json"),
    "utf8",
  );
  await buildTemplate({ root });
  assert.equal(
    await fs.readFile(path.join(output, ".template-manifest.json"), "utf8"),
    before,
  );
});

test("a corrupt manifest cannot delete files outside the template or Git metadata", async (t) => {
  const root = await fixture(t);
  const { output } = await buildTemplate({ root });
  await fs.mkdir(path.join(output, ".git"));
  await fs.writeFile(path.join(output, ".git/config"), "preserve\n");
  await fs.writeFile(path.join(root, "outside.txt"), "preserve\n");
  for (const file of [
    "../outside.txt",
    ".git/config",
    ".env",
    "node_modules/keep.txt",
  ]) {
    await fs.writeFile(
      path.join(output, ".template-manifest.json"),
      JSON.stringify({ version: 1, files: [file] }),
    );
    await assert.rejects(buildTemplate({ root }), /protected|Invalid managed/);
  }
  assert.equal(
    await fs.readFile(path.join(output, ".git/config"), "utf8"),
    "preserve\n",
  );
  assert.equal(
    await fs.readFile(path.join(root, "outside.txt"), "utf8"),
    "preserve\n",
  );
});

test("generation refuses destination symlinks instead of writing through them", async (t) => {
  const root = await fixture(t);
  const outside = path.join(root, "outside");
  await fs.mkdir(outside);
  await fs.symlink(outside, path.join(root, "template"), "dir");
  await assert.rejects(buildTemplate({ root }), /symlink/);
  assert.deepEqual(await fs.readdir(outside), []);
});

test("source errors are detected before changing an existing generated project", async (t) => {
  const root = await fixture(t);
  const { output } = await buildTemplate({ root });
  const previous = await fs.readFile(path.join(output, "README.md"), "utf8");
  await fs.unlink(path.join(root, "pnpm-lock.yaml"));
  await assert.rejects(buildTemplate({ root }), { code: "ENOENT" });
  assert.equal(
    await fs.readFile(path.join(output, "README.md"), "utf8"),
    previous,
  );
});
