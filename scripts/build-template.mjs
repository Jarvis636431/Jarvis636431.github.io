import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import { format } from "prettier";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const manifestName = ".template-manifest.json";
const sharedFiles = [
  "astro.config.mjs",
  "ec.config.mjs",
  "tailwind.config.mjs",
  "postcss.config.mjs",
  "tsconfig.json",
  "eslint.config.mjs",
  ".prettierrc.mjs",
  ".prettierignore",
  ".gitignore",
  ".env.example",
  "package.json",
  "pnpm-lock.yaml",
  "src/config/types.ts",
  "src/config/validate.mjs",
  "src/content/config.ts",
  "scripts/new-content.mjs",
  "scripts/sync-contributions.mjs",
  "docs/personalization.md",
  "docs/personalization.zh-CN.md",
  ".github/workflows/verify.yml",
  ".github/workflows/deploy.yml",
];
const sharedDirectories = [
  "src/components",
  "src/layouts",
  "src/lib",
  "src/pages",
  "src/scripts",
  "src/styles",
  "tests",
];

function assertManagedPath(file) {
  if (
    typeof file !== "string" ||
    !file ||
    path.posix.isAbsolute(file) ||
    file.includes("\\")
  ) {
    throw new Error("Invalid managed template path.");
  }
  const parts = file.split("/");
  if (
    parts.some((part) =>
      ["", ".", "..", ".git", "node_modules", "dist", ".astro"].includes(part),
    ) ||
    parts.some(
      (part) =>
        part === ".env" ||
        (part.startsWith(".env.") && part !== ".env.example"),
    ) ||
    file === manifestName
  ) {
    throw new Error(`Refusing to manage protected template path: ${file}`);
  }
}

async function statIfPresent(file) {
  try {
    return await fs.lstat(file);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

// Never follow an output symlink, including one in a parent directory.
async function checkDestination(output, file) {
  let current = output;
  const parts = file ? file.split("/") : [];
  for (let index = -1; index < parts.length; index++) {
    if (index >= 0) current = path.join(current, parts[index]);
    const stat = await statIfPresent(current);
    if (!stat) continue;
    if (stat.isSymbolicLink())
      throw new Error(`Template output contains a symlink: ${current}`);
    const directory = index === -1 || index < parts.length - 1;
    if (directory ? !stat.isDirectory() : !stat.isFile()) {
      throw new Error(`Unexpected template output entry: ${current}`);
    }
  }
}

async function collectDirectory(root, directory, files) {
  const stat = await fs.lstat(path.join(root, directory));
  if (!stat.isDirectory() || stat.isSymbolicLink())
    throw new Error(`Expected a regular source directory: ${directory}`);
  const entries = await fs.readdir(path.join(root, directory), {
    withFileTypes: true,
  });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === ".DS_Store") continue;
    const file = `${directory}/${entry.name}`;
    if (file === "tests/template.test.mjs") continue;
    assertManagedPath(file);
    if (entry.isSymbolicLink())
      throw new Error(`Refusing to copy a source symlink: ${file}`);
    if (entry.isDirectory()) await collectDirectory(root, file, files);
    else if (entry.isFile())
      files.set(file, await fs.readFile(path.join(root, file)));
    else throw new Error(`Unsupported source entry: ${file}`);
  }
}

function starterReadme(chinese) {
  return chinese
    ? `# Developer Hub

[English](README.md) | 简体中文

一个基于 Astro 的个人作品集、博客与可打印简历起点。页面和交互来自维护仓库，个人数据已替换为默认值。

## 开始使用

使用 Node.js 22 和 pnpm 10.14.0：

\`\`\`bash
pnpm install --frozen-lockfile
pnpm dev
\`\`\`

打开 http://localhost:4321。无需配置环境变量。

## 修改配置与内容

- 在 \`src/config/profile.mjs\` 填写姓名、简介、联系方式、经历和技能。
- 在 \`src/config/site.mjs\` 修改站点名称、实际域名、语言、时区和 Logo。
- \`src/config/integrations.mjs\` 中的评论、浏览量和 GitHub 贡献默认关闭，按需配置后启用。
- 文章和项目目录默认留空。使用 \`pnpm new:post --title "My Post"\` 或 \`pnpm new:project --title "My Project"\` 创建内容。
- 新文章默认为草稿，默认语言为 zh-CN；项目会以 in-progress 状态进入生产构建。发布前检查 frontmatter。

详细说明见[配置指南](docs/personalization.zh-CN.md)。

## 验证与部署

执行 \`pnpm verify\`，再用 \`pnpm build\` 生成网站静态文件到 \`dist/\`。当前支持域名根路径部署，子目录部署尚未适配。

GitHub Actions 自动执行检查。Pages 部署仅支持手动触发：先设置真实域名、启用仓库 Pages 的 GitHub Actions 发布源，再运行部署工作流。模板不包含定时贡献同步工作流，CLI 同步命令仍可在配置后使用。

本仓库的源码、配置和内容可以正常通过 Git 管理。维护者应在主仓库修改通用实现，再生成和更新本仓库；这里不包含生成器自身。

## 发布说明

请替换默认资料并检查所有链接。发布模板前还需要明确代码和素材的许可证；当前生成器不会替作者选择或声明许可证。
`
    : `# Developer Hub

English | [简体中文](README.zh-CN.md)

An Astro portfolio, blog, and printable resume starter. Shared implementation comes from the maintainer repository; personal data is replaced with defaults.

## Getting started

Use Node.js 22 and pnpm 10.14.0:

\`\`\`bash
pnpm install --frozen-lockfile
pnpm dev
\`\`\`

Open http://localhost:4321. No environment variables are required.

## Personalize and write

- Edit \`src/config/profile.mjs\` for your name, biography, contacts, experience, and skills.
- Edit \`src/config/site.mjs\` for branding, your real domain, language, timezone, and logo.
- Comments, views, and GitHub contributions default to disabled in \`src/config/integrations.mjs\`.
- Blog and project directories start empty. Run \`pnpm new:post --title "My Post"\` or \`pnpm new:project --title "My Project"\`.
- New posts are drafts with language zh-CN; new projects enter production as in-progress. Review frontmatter before publishing.

See the [configuration guide](docs/personalization.md) for details.

## Verify and deploy

Run \`pnpm verify\`, then \`pnpm build\` to produce static files in \`dist/\`. Domain-root hosting is supported; subdirectory hosting is not yet supported.

GitHub Actions runs checks automatically. Pages deployment is manual: set your real domain, enable the repository's GitHub Actions publishing source in Pages settings, then run the deployment workflow. No scheduled contribution workflow is included; the configured CLI sync remains available.

Manage this source, configuration, and content with Git normally. The maintainer updates shared implementation in the source repository and regenerates this one. Generator tools are not included here.

## Publishing

Replace defaults and review links. A code and asset license must still be chosen before distributing a template; the generator does not choose or declare one on the author's behalf.
`;
}

async function defaultFiles() {
  const profile = {
    name: "Your Name",
    role: "Developer",
    title: "Software Developer",
    organization: "",
    location: "",
    email: "",
    githubUsername: "",
    summary: "A short introduction to your work and interests.",
    focus: [],
    home: {
      introduction: "Building useful things and sharing what I learn.",
      description: "Projects and writing by Your Name.",
    },
    about: {
      description: "About the author of this site.",
      lead: "Introduce yourself here.",
      paragraphs: [],
    },
    experiences: [],
    skills: [],
    education: { institution: "", description: "" },
  };
  const integrations = {
    comments: {
      enabled: false,
      repository: "",
      category: "Announcements",
      theme: "light",
      language: "en",
    },
    viewCounter: { enabled: false },
    contributions: { enabled: false, heatmap: false, sync: false, pageSize: 6 },
  };
  const typedConfig = (name, value, type, validator) =>
    `// @ts-check\nimport { ${validator} } from "./validate.mjs";\n/** @type {import("./types.ts").${type}} */\nexport const ${name} = ${JSON.stringify(value)};\n${validator}(${name});\n`;
  const site = [
    "// @ts-check",
    'import { profile } from "./profile.mjs";',
    'import { validateSiteSettings } from "./validate.mjs";',
    'const name = "Developer Hub";',
    "const username = profile.githubUsername.trim();",
    "export const siteConfig = { name, title: `${name} — Portfolio and Writing`, description: `Projects and writing by ${profile.name}.`,",
    'url: "https://example.com", language: "en", timeZone: "UTC", email: profile.email,',
    "github: { username, url: username ? `https://github.com/${username}` : undefined },",
    'image: { src: "/logo.svg", alt: `${name} logo` }, favicon: { src: "/logo.svg", type: "image/svg+xml" },',
    'navLinks: [{href:"/projects",label:"Projects"},{href:"/blogs",label:"Blogs"},{href:"/resume",label:"Resume"},{href:"/about",label:"About Me"}],',
    'rss: { title: `${name} Writing`, description: "Notes on software and building useful things.", language: "en" } };',
    "validateSiteSettings(siteConfig);",
  ].join("\n");
  const files = new Map([
    [
      ".env.example",
      "# Optional integrations are disabled by default.\nPUBLIC_SUPABASE_URL=\nPUBLIC_SUPABASE_ANON_KEY=\nPUBLIC_GISCUS_REPO_ID=\nPUBLIC_GISCUS_CATEGORY_ID=\n",
    ],
    [
      "src/config/profile.mjs",
      typedConfig("profile", profile, "Profile", "validateProfile"),
    ],
    [
      "src/config/integrations.mjs",
      typedConfig(
        "integrationConfig",
        integrations,
        "IntegrationConfig",
        "validateIntegrationConfig",
      ),
    ],
    ["src/config/site.mjs", site],
    [
      "src/data/contributions.generated.json",
      JSON.stringify({ author: "", pullRequests: [] }),
    ],
    ["src/content/blog/.gitkeep", ""],
    ["src/content/projects/.gitkeep", ""],
    ["README.md", starterReadme(false)],
    ["README.zh-CN.md", starterReadme(true)],
    [
      "public/logo.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="#2f6f6d"/><path d="M48 38 24 64l24 26M80 38l24 26-24 26M72 32 56 96" fill="none" stroke="#f6f4ef" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>\n',
    ],
  ]);
  for (const [file, source] of files) {
    if (/\.(mjs|json|md)$/.test(file))
      files.set(file, await format(source, { filepath: file }));
  }
  return files;
}

export async function buildTemplate({ root = repositoryRoot } = {}) {
  const output = path.join(root, "template");
  const files = new Map();
  for (const file of sharedFiles) {
    const source = path.join(root, file);
    const stat = await fs.lstat(source);
    if (!stat.isFile() || stat.isSymbolicLink())
      throw new Error(`Expected a regular source file: ${file}`);
    files.set(file, await fs.readFile(source));
  }
  for (const directory of sharedDirectories)
    await collectDirectory(root, directory, files);
  for (const [file, source] of await defaultFiles())
    files.set(file, Buffer.from(source));

  const pkg = JSON.parse(files.get("package.json").toString());
  pkg.name = "astro-developer-hub";
  pkg.version = "0.1.0";
  pkg.private = true;
  pkg.description = "An Astro portfolio, blog, and printable resume starter.";
  delete pkg.scripts["template:build"];
  delete pkg.scripts["template:verify"];
  files.set(
    "package.json",
    Buffer.from(
      await format(JSON.stringify(pkg), { filepath: "package.json" }),
    ),
  );
  // Consumers get CI on pushes, but no automatic publishing or scheduled writes.
  const verify = files.get(".github/workflows/verify.yml").toString();
  files.set(
    ".github/workflows/verify.yml",
    Buffer.from(
      /^ {2}push:/m.test(verify)
        ? verify
        : verify.replace("on:\n", "on:\n  push:\n"),
    ),
  );
  files.set(
    ".github/workflows/deploy.yml",
    Buffer.from(
      files
        .get(".github/workflows/deploy.yml")
        .toString()
        .replace(/^ {2}push:\n {4}branches: \[main\]\n/m, ""),
    ),
  );

  await checkDestination(output, "");
  await checkDestination(output, manifestName);
  let previous = [];
  const manifest = path.join(output, manifestName);
  if (await statIfPresent(manifest)) {
    const saved = JSON.parse(await fs.readFile(manifest, "utf8"));
    if (saved.version !== 1 || !Array.isArray(saved.files))
      throw new Error("Invalid template manifest.");
    previous = saved.files;
  }
  for (const file of [...previous, ...files.keys()]) {
    assertManagedPath(file);
    await checkDestination(output, file);
  }
  // Source collection and path checks finish before any destination file changes.
  for (const [file, bytes] of files) {
    const destination = path.join(output, file);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    const existing = await statIfPresent(destination);
    if (!existing || !(await fs.readFile(destination)).equals(bytes))
      await fs.writeFile(destination, bytes);
  }
  for (const file of previous) {
    if (!files.has(file) && (await statIfPresent(path.join(output, file))))
      await fs.unlink(path.join(output, file));
  }
  await fs.writeFile(
    manifest,
    `${JSON.stringify({ version: 1, files: [...files.keys()].sort() }, null, 2)}\n`,
  );
  return { output, files: files.size };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  buildTemplate()
    .then(({ output, files }) => {
      console.log(
        `Generated ${files} files in ${output}. Existing .git, local environment files and unmanaged files are preserved.`,
      );
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
