import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import config from "../astro.config.mjs";
import { renderMermaid } from "../src/scripts/mermaid.ts";
import { renderMarkdown } from "../src/lib/markdown.mjs";

const requireFromAstro = createRequire(import.meta.resolve("astro"));
const { createMarkdownProcessor } = await import(
  requireFromAstro.resolve("@astrojs/markdown-remark")
);

for (const [name, render] of [
  [
    "Astro",
    async (source) => {
      const processor = await createMarkdownProcessor(config.markdown);
      return (await processor.render(source)).code;
    },
  ],
  ["sanitized Markdown", renderMarkdown],
]) {
  test(`${name} preserves Mermaid source while regular code keeps its renderer`, async () => {
    const html = await render(
      '```mermaid\nflowchart LR\n A["Input"] --> B["Output"]\n```\n\n```js\nconst x = 1;\n```',
    );
    assert.match(html, /<pre><code class="language-mermaid">flowchart LR/);
    assert.match(html, /A\["Input"\] --> B\["Output"\]/);
    assert.match(html, name === "Astro" ? /astro-code/ : /language-js/);
  });
}

function createBlock(source) {
  const classes = new Set();
  const pre = {
    dataset: {},
    innerHTML: "",
    attrs: {},
    statuses: [],
    classList: { add: (value) => classes.add(value) },
    setAttribute(key, value) {
      this.attrs[key] = value;
    },
    prepend(status) {
      this.statuses.push(status);
    },
    querySelector() {
      return { viewBox: { baseVal: { width: 800 } }, style: {} };
    },
  };
  return { textContent: source, parentElement: pre };
}

async function runClient(
  blocks,
  { failLoad = false, invalid = "invalid" } = {},
) {
  let imports = 0;
  const rendered = [];
  let options;
  const loadMermaid = async () => {
    imports += 1;
    if (failLoad) throw new Error("Chunk unavailable");
    return {
      default: {
        initialize(value) {
          options = value;
        },
        async render(id, source) {
          rendered.push({ id, source });
          if (source === invalid) throw new Error("Syntax error");
          return { svg: "<svg></svg>" };
        },
      },
    };
  };
  const document = {
    querySelectorAll: () => blocks,
    fonts: { ready: Promise.resolve() },
    createElement: () => ({ setAttribute() {} }),
  };
  await renderMermaid(document, loadMermaid);
  return { imports, rendered, options };
}

test("pages without diagrams do not load Mermaid", async () => {
  assert.equal((await runClient([])).imports, 0);
  const processed = createBlock("done");
  processed.parentElement.dataset.mermaidState = "rendered";
  assert.equal((await runClient([processed])).imports, 0);
});

test("a broken diagram keeps its source and does not block later diagrams", async () => {
  const broken = createBlock("invalid");
  const valid = createBlock("flowchart LR\n A --> B");
  const result = await runClient([broken, valid]);
  assert.equal(result.options.securityLevel, "strict");
  assert.equal(result.options.htmlLabels, false);
  assert.equal(broken.parentElement.dataset.mermaidState, "error");
  assert.equal(broken.textContent, "invalid");
  assert.equal(broken.parentElement.innerHTML, "");
  assert.equal(broken.parentElement.statuses.length, 1);
  assert.equal(valid.parentElement.dataset.mermaidState, "rendered");
  assert.equal(valid.parentElement.innerHTML, "<svg></svg>");
  assert.equal(valid.parentElement.tabIndex, 0);
  assert.notEqual(result.rendered[0].id, result.rendered[1].id);
});

test("an unavailable renderer leaves every source block readable", async () => {
  const blocks = [createBlock("first"), createBlock("second")];
  await runClient(blocks, { failLoad: true });
  for (const block of blocks) {
    assert.equal(block.parentElement.dataset.mermaidState, "error");
    assert.equal(block.parentElement.innerHTML, "");
  }
});
