import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import katex from "katex";
import { createArticleProcessor } from "./fixtures/markdown.mjs";
import { renderExternalMarkdown } from "../src/lib/markdown/render.mjs";

const sample = String.raw`Inline $p = \sigma(z)$.

$$
p = \frac{1}{1+e^{-z}}
$$

\`\`\`js
const price = "$5";
\`\`\`
`.replaceAll("\\`", "`");

for (const [name, render] of [
  [
    "Astro articles",
    async (source) => {
      const processor = await createArticleProcessor();
      return (await processor.render(source)).code;
    },
  ],
  ["sanitized Markdown", renderExternalMarkdown],
]) {
  test(`${name} renders inline and display math while preserving code`, async () => {
    const html = await render(sample);
    assert.match(html, /class="katex"/);
    assert.match(html, /class="katex-display"/);
    assert.match(html, /<math xmlns=/);
    assert.doesNotMatch(html, /katex-error/);
    assert.match(html, /<pre[^>]*>[\s\S]*?const/);
    assert.match(html, /\$5/);
  });
}

test("sanitized Markdown still removes unsafe HTML and math links", async () => {
  const html = await renderExternalMarkdown(String.raw`<script>alert(1)</script>
<img src="x" onerror="alert(1)">

$\href{javascript:alert(1)}{x}$`);
  assert.doesNotMatch(html, /<script|onerror=|href="javascript:/);
});

test("every math expression in the recommendation series is valid KaTeX", () => {
  const directory = new URL("../src/content/blog/rec/", import.meta.url);
  const parser = unified().use(remarkParse).use(remarkMath);
  let blockCount = 0;
  let inlineCount = 0;
  for (const name of readdirSync(directory).filter((name) =>
    name.endsWith(".md"),
  )) {
    const source = readFileSync(new URL(name, directory), "utf8");
    // Frontmatter has no math; start at the body to avoid interpreting YAML.
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
    const visit = (node) => {
      if (node.type === "math" || node.type === "inlineMath") {
        assert.doesNotThrow(
          () => katex.renderToString(node.value, { throwOnError: true }),
          `${name}:${node.position.start.line}: ${node.value}`,
        );
        if (node.type === "math") blockCount += 1;
        else inlineCount += 1;
      }
      node.children?.forEach(visit);
    };
    visit(parser.parse(body));
  }
  assert.ok(blockCount >= 59, "reviewed formula blocks should parse as math");
  assert.ok(inlineCount > 0, "prose variables should parse as inline math");
});
