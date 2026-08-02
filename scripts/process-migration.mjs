/**
 * Batch-process migration files from content-migration/organized/
 * into src/content/blog/ with proper Astro frontmatter.
 *
 * Usage: node scripts/process-migration.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, relative, basename } from "path";

const ORGANIZED_DIR = join(
  import.meta.dirname,
  "..",
  "content-migration",
  "organized",
);
const BLOG_DIR = join(import.meta.dirname, "..", "src", "content", "blog");
const DRY_RUN = process.argv.includes("--dry-run");

// Files to skip (empty, near-empty, or not blog material)
const SKIP_LIST = new Set([
  // Empty or near-empty files
  "设计模式.md",
  "Agent 开发.md",
  "RAG 概念及基本原理.md",
  "PPO.md",
  "249..md",
  "字节——抖音本地生活.md",
  "腾讯——中台业务.md",
  "淘天——阿里妈妈 MUX.md",
  // Already exists as blog post
  "京东——创新零售.md",
  // Not blog material
  "logs.md",
  "未命名-root.md",
]);

// Tag mappings based on folder path segments
// Use a relative path (not absolute) to avoid matching "GitHub", etc.
function getTags(relativePath) {
  const tags = new Set();
  const path = relativePath.toLowerCase();

  if (path.includes("前端") || path.includes("frontend")) tags.add("前端");
  if (path.includes("/react") || path.includes("react ")) tags.add("React");
  if (path.includes("/vue") || path.includes("vue ")) tags.add("Vue");
  if (
    path.includes("html") ||
    path.includes("css") ||
    path.includes("javascript") ||
    path.includes("typescript")
  )
    tags.add("HTML/CSS/JS");
  if (path.includes("工程化")) tags.add("工程化");
  if (path.includes("性能优化")) tags.add("性能优化");
  if (path.includes("安全")) tags.add("安全");
  if (path.includes("网络")) tags.add("计算机网络");
  if (path.includes("浏览器")) tags.add("浏览器");
  if (
    path.includes("web api") ||
    path.includes("webrtc") ||
    path.includes("sse") ||
    path.includes("webworker")
  )
    tags.add("Web API");
  if (path.includes("事件循环") || path.includes("event loop"))
    tags.add("Event Loop");
  if (path.includes("缓存")) tags.add("缓存");
  if (path.includes("手写")) tags.add("手写题");
  if (path.includes("场景")) tags.add("场景题");
  if (path.includes("架构")) tags.add("架构设计");
  if (path.includes("设计模式")) tags.add("设计模式");
  if (path.includes("/git ") || path.includes("-git") || path.includes("git "))
    tags.add("Git");
  if (
    path.includes("跨平台") ||
    path.includes("electron") ||
    path.includes("reactnative")
  )
    tags.add("跨平台");
  if (path.includes("ssr")) tags.add("SSR");
  if (path.includes("微前端")) tags.add("微前端");
  if (path.includes("promise")) tags.add("Promise");
  if (
    path.includes("面试") ||
    path.includes("面经") ||
    path.includes("interview")
  )
    tags.add("面经");
  if (path.includes("产品")) tags.add("产品");
  if (path.includes("实习")) tags.add("实习");
  if (
    path.includes("算法") ||
    path.includes("leetcode") ||
    path.includes("两数之和") ||
    path.includes("字母异位")
  )
    tags.add("算法");
  if (path.includes("强化学习") || path.includes("-rl")) tags.add("强化学习");
  if (path.includes("/rag") || path.includes("rag ")) tags.add("RAG");
  if (path.includes("语音")) tags.add("语音信息处理");
  if (path.includes("搜广推") || path.includes("推荐")) tags.add("搜广推");
  if (path.includes("roadmap") || path.includes("学习路线"))
    tags.add("学习路线");
  if (path.includes("论文")) tags.add("论文导读");
  if (path.includes("sql")) tags.add("SQL");
  if (path.includes("周报")) tags.add("周报");
  if (path.includes("swanlab")) tags.add("Swanlab");
  if (path.includes("idesign")) tags.add("iDesignLab");
  if (path.includes("美食") || path.includes("天津")) tags.add("生活");
  if (path.includes("个人网站") || path.includes("小巧思")) tags.add("博客");
  if (path.includes("售后") || path.includes("h5")) tags.add("项目实践");

  // Add parent category tag
  if (path.includes("interview-notes")) tags.add("面经");
  if (path.includes("blog-candidates")) tags.add("技术笔记");
  if (path.includes("ai-and-algorithm")) tags.add("AI/算法");
  if (path.includes("weekly-reports")) tags.add("周报");
  if (path.includes("leetcode")) tags.add("算法");
  if (path.includes("project-docs")) tags.add("项目文档");
  if (path.includes("life-notes")) tags.add("生活");

  return Array.from(tags).sort();
}

// Generate a URL-friendly filename
function generateFilename(filePath) {
  const relativePath = relative(ORGANIZED_DIR, filePath);

  // Strip category prefix (e.g., "blog-candidates/" -> "")
  const parts = relativePath.split("/");
  // Remove the top-level category folder
  const meaningfulParts = parts.slice(1);

  let name = meaningfulParts
    .join("-")
    .replace(/\.md$/, "")
    .replace(/\s+/g, "-")
    .replace(/[()（）,，]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");

  // Limit filename length
  if (name.length > 80) {
    name = name.substring(0, 80).replace(/-[^-]*$/, "");
  }

  return name + ".md";
}

// Generate commentId from filename
function generateCommentId(filename) {
  let base = filename
    .replace(/\.md$/, "")
    .replace(/[^a-zA-Z0-9一-鿿-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  // If the result is empty after stripping (Chinese-only name),
  // use a hash-like suffix from the original filename
  if (!base || base.length < 3) {
    // Use the original filename chars as fallback
    const hash = filename
      .replace(/\.md$/, "")
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0).toString(36), "")
      .substring(0, 12);
    base = "post-" + hash;
  }

  return "blog-" + base;
}

// Estimate reading time based on content length
function estimateReadingTime(content) {
  // Remove code blocks and frontmatter for estimation
  const text = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/[#*\->|`]/g, "");
  // Chinese characters ~300/min, English words ~200/min
  const chineseChars = (text.match(/[一-鿿]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const minutes = Math.max(
    1,
    Math.ceil(chineseChars / 300 + englishWords / 200),
  );
  return minutes;
}

// Generate a description from content (first meaningful paragraph)
function generateDescription(content, filePath) {
  // Remove frontmatter if exists
  const bodyContent = content.replace(/^---[\s\S]*?---\n*/m, "").trim();

  // Try to get the first non-heading, non-empty, non-table line
  const lines = bodyContent.split("\n");
  let description = "";
  for (const line of lines) {
    const cleaned = line
      .replace(/^#+\s*/, "")
      .replace(/^\*\*/, "")
      .replace(/\*\*$/, "")
      .replace(/[#*>|`[\]]/g, "")
      .trim();
    // Skip table rows, separator lines, image embeds, and very short lines
    const isTableRow = /^\|/.test(line.trim());
    const isSeparator = /^[\s\-|:=]+$/.test(line.trim());
    const isImageEmbed = line.includes("![") || line.includes("Pasted image");
    if (cleaned.length >= 10 && !isTableRow && !isSeparator && !isImageEmbed) {
      description = cleaned;
      break;
    }
  }

  // Truncate to reasonable length
  if (description.length > 120) {
    description = description.substring(0, 117) + "...";
  }

  // Fallback: use filename as basis
  if (!description || description.length < 10) {
    const name = basename(filePath, ".md").trim();
    description = `${name} — 技术笔记，待补充描述。`;
    if (description.length > 120) {
      description = description.substring(0, 117) + "...";
    }
  }

  return description;
}

// Generate title from filename
function generateTitle(filePath) {
  let name = basename(filePath, ".md").trim();

  // If the name is too generic, use parent folder info
  if (name === "未命名" || name === "未命名-root") {
    const parts = relative(ORGANIZED_DIR, filePath).split("/");
    if (parts.length >= 2) {
      name = parts[parts.length - 2] + "-" + name;
    }
  }

  // Clean up common prefixes in notes
  return name;
}

// Clean up Obsidian-specific formatting
function cleanContent(content) {
  let cleaned = content;

  // Remove Obsidian image embeds (MDX-safe: just remove them silently)
  cleaned = cleaned.replace(/!\[\[Pasted image \d+\.png\]\]/g, "");

  // Fix Obsidian callouts (basic conversion)
  // > [!note] -> > **Note:**
  cleaned = cleaned.replace(/^>\s*\[!(\w+)\]\s*(.*)$/gm, "> **$1:** $2");

  // Fix heading formatting: "# **1.  Title**" -> "## 1. Title"
  cleaned = cleaned.replace(/^#\s+\*\*(\d+)\.\s+(.+?)\*\*$/gm, "## $1. $2");
  cleaned = cleaned.replace(/^#\s+\*\*##\*\*$/gm, "");

  // Fix bold headings without spaces
  cleaned = cleaned.replace(/^#\s*\*\*([^*]+)\*\*$/gm, "## $1");

  // Remove consecutive blank lines (more than 2)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Ensure proper spacing around code blocks
  cleaned = cleaned.replace(/([^\n])\n```/g, "$1\n\n```");
  cleaned = cleaned.replace(/```\n([^\n])/g, "```\n\n$1");

  return cleaned;
}

// Build the frontmatter string
function buildFrontmatter(title, description, commentId, tags, readingTime) {
  // Use the file's original date from git, or default to migration date
  const publishDate = "2025-06-01";

  const tagStr =
    tags.length > 0 ? `\n  ${tags.map((t) => `"${t}"`).join(", ")}\n` : "";

  return `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
commentId: "${commentId}"
language: "zh-CN"
publishDate: "${publishDate}"
tags: [${tagStr}]
draft: true
readingTime: ${readingTime}
---`;
}

function processFile(filePath) {
  const filename = basename(filePath);
  const relativePath = relative(ORGANIZED_DIR, filePath);

  // Check skip list
  if (SKIP_LIST.has(filename)) {
    const reason =
      filename === "京东——创新零售.md"
        ? "already exists in blog"
        : filename === "logs.md" || filename === "未命名-root.md"
          ? "not blog material"
          : "empty or near-empty file";
    console.log(`  SKIP: ${relativePath} (${reason})`);
    return null;
  }

  // Read file
  let rawContent;
  try {
    rawContent = readFileSync(filePath, "utf-8");
  } catch (err) {
    console.error(`  ERROR reading ${relativePath}: ${err.message}`);
    return null;
  }

  // Skip files with extremely little content
  const strippedContent = rawContent.replace(/\s/g, "");
  if (strippedContent.length < 5) {
    console.log(`  SKIP: ${relativePath} (no meaningful content)`);
    return null;
  }

  // Clean content
  let bodyContent = rawContent;

  // Remove existing frontmatter if present (some files might have it)
  if (bodyContent.startsWith("---")) {
    const endIdx = bodyContent.indexOf("---", 3);
    if (endIdx !== -1) {
      bodyContent = bodyContent.substring(endIdx + 3).trim();
    }
  }

  bodyContent = cleanContent(bodyContent);

  // Generate metadata
  const title = generateTitle(filePath);
  const description = generateDescription(rawContent, filePath);
  const newFilename = generateFilename(filePath);
  const commentId = generateCommentId(newFilename);
  const tags = getTags(relativePath);
  const readingTime = estimateReadingTime(rawContent);

  // Build final content
  const frontmatter = buildFrontmatter(
    title,
    description,
    commentId,
    tags,
    readingTime,
  );
  const finalContent = frontmatter + "\n\n" + bodyContent + "\n";

  // Determine output path
  const outputPath = join(BLOG_DIR, newFilename);

  // Check for conflicts (file already exists)
  if (existsSync(outputPath)) {
    console.log(`  WARN: ${newFilename} already exists, skipping`);
    return null;
  }

  return { outputPath, finalContent, relativePath, title, tags };
}

// Recursively find all .md files
function findMdFiles(dir) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMdFiles(fullPath));
    } else if (entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files;
}

// === Main ===
console.log("🔍 Scanning migration files...");
const allFiles = findMdFiles(ORGANIZED_DIR);
console.log(`   Found ${allFiles.length} .md files\n`);

const results = [];
let skipped = 0;

for (const filePath of allFiles) {
  const result = processFile(filePath);
  if (result) {
    results.push(result);
  } else {
    skipped++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Total: ${allFiles.length} files`);
console.log(`   To publish: ${results.length} files`);
console.log(`   Skipped: ${skipped} files\n`);

if (DRY_RUN) {
  console.log("🏃 DRY RUN — no files written\n");
  for (const r of results) {
    console.log(`   📝 ${r.relativePath}`);
    console.log(`      → ${basename(r.outputPath)}`);
    console.log(`      Title: "${r.title}"`);
    console.log(`      Tags: [${r.tags.join(", ")}]`);
    console.log();
  }
} else {
  console.log("✍️  Writing files...\n");
  let written = 0;
  for (const r of results) {
    try {
      writeFileSync(r.outputPath, r.finalContent, "utf-8");
      written++;
      console.log(`   ✅ ${r.relativePath} → ${basename(r.outputPath)}`);
    } catch (err) {
      console.error(
        `   ❌ Failed to write ${basename(r.outputPath)}: ${err.message}`,
      );
    }
  }
  console.log(
    `\n✅ Written ${written}/${results.length} files to src/content/blog/`,
  );
}
