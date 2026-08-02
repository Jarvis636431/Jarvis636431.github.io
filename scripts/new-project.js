import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const PROJECTS_DIR = path.join(process.cwd(), "src", "content", "projects");

const slugify = (value) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "project";

const formatDate = (date = new Date()) => date.toISOString().split("T")[0];

const getArgValue = (flag) => {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
};

const createProject = async ({ title, slug, template = "md" }) => {
  const fileName = `${slug}.${template}`;
  const filePath = path.join(PROJECTS_DIR, fileName);

  try {
    await fs.access(filePath);
    console.error(`Project already exists: ${fileName}`);
    process.exit(1);
  } catch {
    // Continue when file does not exist.
  }

  const publishDate = formatDate();

  const content = `---
title: "${title.replace(/"/g, '\\"')}"
summary: "Project summary (min 10 chars)."
language: "zh-CN"
status: "in-progress"
roles: []
stack: []
featured: false
publishDate: "${publishDate}"
updatedDate: "${publishDate}"
externalUrl: ""
coverImage: ""
---

Describe your project here.
`;

  await fs.writeFile(filePath, content, "utf8");
  console.log(`Created ${fileName}`);
};

const run = async () => {
  // Ensure directory exists
  try {
    await fs.access(PROJECTS_DIR);
  } catch {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
  }

  const titleArg = getArgValue("--title");
  const slugArg = getArgValue("--slug");
  const templateArg = getArgValue("--template");
  const template = templateArg === "mdx" ? "mdx" : "md";

  if (titleArg) {
    const slug = slugArg || slugify(titleArg);
    await createProject({ title: titleArg, slug, template });
    return;
  }

  input.setEncoding("utf8");
  output.setDefaultEncoding("utf8");
  const rl = readline.createInterface({ input, output });
  const title = (await rl.question("Project title: ")).trim();
  const suggestedSlug = slugify(title);
  const slugInput = (await rl.question(`Slug (${suggestedSlug}): `)).trim();
  const slug = slugInput || suggestedSlug;
  const templateInput = (
    await rl.question("Template (md/mdx, default md): ")
  ).trim();
  rl.close();

  await createProject({
    title: title || "Untitled Project",
    slug,
    template: templateInput === "mdx" ? "mdx" : "md",
  });
};

run();
