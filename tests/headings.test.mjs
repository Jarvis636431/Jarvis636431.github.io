import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";

const parser = unified().use(remarkParse);

async function articlesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const articles = [];
  for (const entry of entries) {
    const url = new URL(entry.name, directory);
    if (entry.isDirectory()) {
      articles.push(
        ...(await articlesIn(new URL(`${entry.name}/`, directory))),
      );
    } else if (/\.mdx?$/.test(entry.name)) {
      articles.push(url);
    }
  }
  return articles;
}

test("blog bodies reserve h1 for the page title and use consecutive section levels", async () => {
  const articles = await articlesIn(
    new URL("../src/content/blog/", import.meta.url),
  );
  assert.ok(articles.length > 0);
  for (const article of articles) {
    const source = await readFile(article, "utf8");
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
    // Markdown parsing excludes heading-like examples inside fenced code blocks.
    const headings = parser
      .parse(body)
      .children.filter((node) => node.type === "heading");
    let previousDepth = 1;
    for (const heading of headings) {
      const location = `${article.pathname}:${heading.position.start.line}`;
      assert.ok(
        heading.depth >= 2,
        `${location}: body headings must start at h2`,
      );
      assert.ok(
        heading.depth <= previousDepth + 1,
        `${location}: heading levels must not skip`,
      );
      previousDepth = heading.depth;
    }
  }
});
