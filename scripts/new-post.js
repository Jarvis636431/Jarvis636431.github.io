import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

const slugify = (value) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "post";

const formatDate = (date = new Date()) => date.toISOString().split("T")[0];

const getArgValue = (flag) => {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
};

const createPost = async ({ title, slug, template = "md" }) => {
  const fileName = `${slug}.${template}`;
  const filePath = path.join(BLOG_DIR, fileName);

  await fs.mkdir(BLOG_DIR, { recursive: true });

  try {
    await fs.access(filePath);
    console.error(`Post already exists: ${fileName}`);
    process.exit(1);
  } catch {
    // Continue when file does not exist.
  }

  const publishDate = formatDate();
  const commentId = `blog-${slug}`;

  const content = `---
title: "${title.replace(/"/g, '\\"')}"
description: "Write a short summary (min 10 chars)."
commentId: "${commentId}"
language: "zh-CN"
publishDate: "${publishDate}"
updatedDate: "${publishDate}"
heroImage: ""
tags: []
draft: true
readingTime: 6
---

Start writing here.
`;

  await fs.writeFile(filePath, content, "utf8");
  console.log(`Created ${fileName}`);
};

const run = async () => {
  const titleArg = getArgValue("--title");
  const slugArg = getArgValue("--slug");
  const templateArg = getArgValue("--template");
  const template = templateArg === "mdx" ? "mdx" : "md";

  if (titleArg) {
    const slug = slugArg || slugify(titleArg);
    await createPost({ title: titleArg, slug, template });
    return;
  }

  input.setEncoding("utf8");
  output.setDefaultEncoding("utf8");
  const rl = readline.createInterface({ input, output });
  const title = (await rl.question("Post title: ")).trim();
  const suggestedSlug = slugify(title);
  const slugInput = (await rl.question(`Slug (${suggestedSlug}): `)).trim();
  const slug = slugInput || suggestedSlug;
  const templateInput = (
    await rl.question("Template (md/mdx, default md): ")
  ).trim();
  rl.close();

  await createPost({
    title: title || "Untitled Post",
    slug,
    template: templateInput === "mdx" ? "mdx" : "md",
  });
};

run();
