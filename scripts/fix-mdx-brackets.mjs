/**
 * Fix MDX-incompatible angle bracket patterns in blog files.
 * Any <word> or <word ...> outside of code blocks is interpreted as JSX by MDX.
 * We wrap these in backticks to prevent MDX parsing.
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, basename } from "path";

const BLOG_DIR = join(import.meta.dirname, "..", "src", "content", "blog");
const DRY_RUN = process.argv.includes("--dry-run");

function fixFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  let inCodeBlock = false;
  let inFrontmatter = false;
  let frontmatterCount = 0;
  let modified = false;
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track frontmatter
    if (line.trim() === "---") {
      frontmatterCount++;
      inFrontmatter = frontmatterCount < 2;
      fixedLines.push(line);
      continue;
    }

    // Skip frontmatter content
    if (inFrontmatter) {
      fixedLines.push(line);
      continue;
    }

    // Track code blocks
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      fixedLines.push(line);
      continue;
    }

    // Skip lines in code blocks
    if (inCodeBlock) {
      fixedLines.push(line);
      continue;
    }

    // Skip lines that already have backtick-wrapped content
    // (simple heuristic: if line has `...`, assume it's already handled)

    // Fix patterns: <word> or <word attr> that aren't inside backticks
    let modifiedLine = line;

    // Match all <...> patterns that aren't already inside backticks
    // This regex finds angle-bracket content not inside backticks
    // We look for `<` not preceded by `` ` `` and replace with `` `<...>` ``
    // But this is hard with regex alone...

    // Simpler approach: find specific patterns that cause issues
    // 1. <tagname attr="value"> without closing tag
    // 2. <tagname> without closing tag
    // 3. HTML-like elements

    // Fix: <word> that looks like an HTML/XML tag
    // Match pattern: < followed by letters, possibly with attributes, then >
    // But NOT math expressions like a < b
    const tagPattern =
      /(<[a-zA-Z][a-zA-Z0-9]*(?:\s+[a-zA-Z-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\}))?)*\s*\/?>)/g;

    // Only fix if not already in backticks
    if (tagPattern.test(modifiedLine)) {
      // Reset regex state
      tagPattern.lastIndex = 0;

      // Split by backtick regions and only replace outside backticks
      const parts = [];
      let inBacktick = false;
      let current = "";
      for (let j = 0; j < modifiedLine.length; j++) {
        if (modifiedLine[j] === "`") {
          // Push current part
          parts.push({ text: current, inBacktick });
          current = "";
          inBacktick = !inBacktick;
        } else {
          current += modifiedLine[j];
        }
      }
      parts.push({ text: current, inBacktick });

      // Rebuild line, fixing only non-backtick parts
      const rebuilt = parts
        .map((p) => {
          if (p.inBacktick) return p.text;
          return p.text.replace(tagPattern, (match) => {
            // Don't wrap if it looks like a math expression (number after <)
            if (/<\d/.test(match)) return match;
            // Don't wrap if it's already escaped
            if (match.startsWith("&lt;")) return match;
            return "`" + match + "`";
          });
        })
        .join("`");

      if (rebuilt !== modifiedLine) {
        modifiedLine = rebuilt;
        modified = true;
      }
    }

    fixedLines.push(modifiedLine);
  }

  if (modified) {
    if (DRY_RUN) {
      console.log(`  WOULD FIX: ${basename(filePath)}`);
    } else {
      writeFileSync(filePath, fixedLines.join("\n"), "utf-8");
      console.log(`  FIXED: ${basename(filePath)}`);
    }
  }

  return modified;
}

// === Main ===
const files = readdirSync(BLOG_DIR).filter(
  (f) => f.endsWith(".mdx") && f !== "京东-创新零售-前端.mdx",
);

console.log(`Processing ${files.length} files...\n`);

let fixedCount = 0;
for (const file of files) {
  if (fixFile(join(BLOG_DIR, file))) {
    fixedCount++;
  }
}

console.log(`\n${DRY_RUN ? "Would fix" : "Fixed"} ${fixedCount} file(s)`);
