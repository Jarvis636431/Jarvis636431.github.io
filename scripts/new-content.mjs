import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import { parseArgs } from "node:util";
import { siteConfig } from "../src/config/site.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const collections = { post: "blog", project: "projects" };

const slugify = (value) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "untitled";

export function formatContentDate(
  date = new Date(),
  timeZone = siteConfig.timeZone,
) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

/** Create content relative to this repository, not the caller's working directory. */
export async function createContent(
  options,
  { root = repositoryRoot, now = new Date() } = {},
) {
  const { kind, template = "md" } = options;
  if (!Object.hasOwn(collections, kind))
    throw new Error("Choose post or project.");
  if (typeof options.title !== "string" || !options.title.trim())
    throw new Error("A non-empty title is required.");
  if (!["md", "mdx"].includes(template))
    throw new Error("Template must be md or mdx.");
  const title = options.title.trim();
  const slug = options.slug ?? slugify(title);
  if (
    typeof slug !== "string" ||
    !/^[\p{L}\p{N}][\p{L}\p{N}_-]*(?:\/[\p{L}\p{N}][\p{L}\p{N}_-]*)*$/u.test(
      slug,
    )
  ) {
    throw new Error(
      "Slug must contain letters, numbers, hyphens or underscores, with / between folders; omit the file extension.",
    );
  }
  const series = options.series?.trim();
  const seriesOrder = options.seriesOrder ?? 1;
  if ((series || options.seriesOrder !== undefined) && kind !== "post")
    throw new Error("Series options apply only to posts.");
  if (options.seriesOrder !== undefined && !series)
    throw new Error("Specify --series with --series-order.");
  if (!Number.isSafeInteger(seriesOrder) || seriesOrder < 1)
    throw new Error("Series order must be a positive integer.");

  const base = path.join(root, "src", "content", collections[kind], slug);
  for (const extension of ["md", "mdx"]) {
    try {
      await fs.access(`${base}.${extension}`);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    throw new Error(`Content already exists: ${slug}.${extension}`);
  }
  const date = formatContentDate(now);
  const fields =
    kind === "post"
      ? {
          title,
          description: "Write a short summary (min 10 chars).",
          aliases: [],
          commentId: `blog-${slug}`,
          language: "zh-CN",
          publishDate: date,
          updatedDate: date,
          tags: [],
          ...(series ? { series, seriesOrder } : {}),
          draft: true,
        }
      : {
          title,
          summary: "Project summary (min 10 chars).",
          aliases: [],
          language: "zh-CN",
          status: "in-progress",
          roles: [],
          stack: [],
          featured: false,
          publishDate: date,
          updatedDate: date,
          externalUrl: "",
          githubUrl: "",
          coverImage: "",
        };
  // JSON-quoted scalar values are valid YAML, including quotes, backslashes and newlines.
  const frontmatter = Object.entries(fields)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
  const content = `---\n${frontmatter}\n---\n\n${kind === "post" ? "Start writing here." : "Describe your project here."}\n`;
  const filePath = `${base}.${template}`;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, { encoding: "utf8", flag: "wx" });
  return filePath;
}

async function run() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      title: { type: "string" },
      slug: { type: "string" },
      template: { type: "string" },
      series: { type: "string" },
      "series-order": { type: "string" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    console.log(`Usage:
  pnpm new:post --title "My Post" [--slug rec/my-post] [--template md|mdx]
                [--series "My Series" --series-order 1]
  pnpm new:project --title "My Project" [--slug my-project] [--template md|mdx]

Without --title, interactive terminals prompt for the fields.
Files are created in this repository; dates use siteConfig.timeZone.
New content defaults to zh-CN. Posts are drafts; projects are in-progress.`);
    return;
  }
  const [kind] = positionals;
  if (positionals.length !== 1 || !Object.hasOwn(collections, kind))
    throw new Error("Choose post or project. Use --help for usage.");
  const options = {
    kind,
    title: values.title,
    slug: values.slug,
    template: values.template,
    series: values.series,
    seriesOrder:
      values["series-order"] === undefined
        ? undefined
        : Number(values["series-order"]),
  };
  if (options.title === undefined) {
    if (!input.isTTY)
      throw new Error(
        "Provide --title when running without an interactive terminal.",
      );
    const rl = readline.createInterface({ input, output });
    try {
      options.title =
        (
          await rl.question(`${kind === "post" ? "Post" : "Project"} title: `)
        ).trim() || `Untitled ${kind === "post" ? "Post" : "Project"}`;
      options.slug ??=
        (
          await rl.question(
            `Slug, optionally with folders (${slugify(options.title)}): `,
          )
        ).trim() || undefined;
      options.template ??=
        (await rl.question("Template (md/mdx, default md): ")).trim() || "md";
      if (kind === "post") {
        options.series ??= (await rl.question("Series (optional): ")).trim();
        if (options.series && options.seriesOrder === undefined)
          options.seriesOrder = Number(
            (await rl.question("Series order (default 1): ")).trim() || 1,
          );
      }
    } finally {
      rl.close();
    }
  }
  const filePath = await createContent(options);
  console.log(`Created ${path.relative(repositoryRoot, filePath)}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
