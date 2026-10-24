import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import config from "../astro.config.mjs";
import { renderExternalMarkdown } from "../src/lib/markdown/render.mjs";

const requireFromAstro = createRequire(import.meta.resolve("astro"));
const { createMarkdownProcessor } = await import(
  requireFromAstro.resolve("@astrojs/markdown-remark")
);
const processor = await createMarkdownProcessor(config.markdown);

for (const [name, render] of [
  ["Astro", async (source) => (await processor.render(source)).code],
  ["sanitized Markdown", renderExternalMarkdown],
]) {
  test(`${name} renders all five GitHub callouts with readable titles and icons`, async () => {
    for (const type of ["NOTE", "TIP", "WARNING", "IMPORTANT", "CAUTION"]) {
      const html = await render(
        `> [!${type}]\n> Keep **important details** visible.`,
      );
      assert.match(
        html,
        new RegExp(
          `class="markdown-alert markdown-alert-${type.toLowerCase()}"`,
        ),
      );
      assert.match(html, /class="markdown-alert-title"/);
      assert.match(html, /<svg[^>]*aria-hidden="true"/);
      assert.match(html, /<strong>important details<\/strong>/);
      assert.doesNotMatch(html, new RegExp(`\\[!${type}\\]`));
    }
  });

  test(`${name} preserves ordinary quotes, unknown markers and fenced examples`, async () => {
    const quote = await render("> A normal quotation.");
    assert.match(quote, /<blockquote>/);
    assert.doesNotMatch(quote, /markdown-alert/);
    const unknown = await render("> [!CUSTOM]\n> Keep this text.");
    assert.match(unknown, /<blockquote>/);
    assert.match(unknown, /\[!CUSTOM\]/);
    const code = await render(
      "```markdown\n> [!NOTE]\n> This is a writing example.\n```",
    );
    assert.match(code, /<pre/);
    assert.doesNotMatch(code, /class="markdown-alert /);
  });

  test(`${name} keeps paragraphs, lists, links, math and Mermaid inside callouts`, async () => {
    const html = await render(
      String.raw`> [!TIP]
> Use $p = \sigma(z)$ with [the documentation](https://example.com).
>
> A second paragraph.
>
> - First step
> - Second step
>
> $$
> p = \frac{1}{1+e^{-z}}
> $$
>
> ` + "```mermaid\n> flowchart LR\n> A --> B\n> ```",
    );
    assert.match(html, /markdown-alert-tip/);
    assert.match(html, /<p>A second paragraph\.<\/p>/);
    assert.match(html, /<li>First step<\/li>/);
    assert.match(html, /href="https:\/\/example.com"/);
    assert.match(html, /class="katex"/);
    assert.match(html, /class="katex-display"/);
    assert.match(html, /code class="language-mermaid"/);
    assert.doesNotMatch(html, /katex-error/);
  });
}

test("sanitized callouts remove unsafe author HTML while retaining plugin icons", async () => {
  const html = await renderExternalMarkdown(
    '> [!WARNING]\n> <img src="x" onerror="alert(1)">\n> <script>alert(1)</script>\n> [unsafe](javascript:alert%281%29)',
  );
  assert.match(html, /markdown-alert-warning/);
  assert.match(html, /<svg/);
  assert.doesNotMatch(html, /<script|onerror=|href="javascript:/);
});
