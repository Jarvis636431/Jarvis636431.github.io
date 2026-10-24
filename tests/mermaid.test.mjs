import assert from "node:assert/strict";
import test from "node:test";
import { createArticleProcessor } from "./fixtures/markdown.mjs";
import { renderMermaid } from "../src/scripts/mermaid.ts";
import { renderExternalMarkdown } from "../src/lib/markdown/render.mjs";

for (const [name, render] of [
  [
    "Astro",
    async (source) => {
      const processor = await createArticleProcessor();
      return (await processor.render(source)).code;
    },
  ],
  ["sanitized Markdown", renderExternalMarkdown],
]) {
  test(`${name} preserves Mermaid source while regular code keeps its renderer`, async () => {
    const html = await render(
      '```mermaid\nflowchart LR\n A["Input"] --> B["Output"]\n```\n\n```js\nconst x = 1;\n```',
    );
    assert.match(html, /<pre class="mermaid">flowchart LR/);
    assert.match(html, /A\["Input"\] --> B\["Output"\]/);
    assert.match(html, name === "Astro" ? /expressive-code/ : /language-js/);
  });
}

function createBlock(source) {
  const classes = new Set();
  const pre = {
    dataset: {},
    innerHTML: "",
    textContent: source,
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
  return pre;
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
    defaultView: {
      getComputedStyle: () => ({ getPropertyValue: (name) => `theme:${name}` }),
    },
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
  processed.dataset.mermaidState = "rendered";
  assert.equal((await runClient([processed])).imports, 0);
});

test("a broken diagram keeps its source and does not block later diagrams", async () => {
  const broken = createBlock("invalid");
  const valid = createBlock("flowchart LR\n A --> B");
  const result = await runClient([broken, valid]);
  assert.equal(result.options.securityLevel, "strict");
  assert.equal(result.options.htmlLabels, false);
  assert.equal(
    result.options.themeVariables.primaryColor,
    "theme:--color-diagram-fill",
  );
  assert.equal(result.options.fontFamily, "theme:--font-prose");
  assert.equal(broken.dataset.mermaidState, "error");
  assert.equal(broken.textContent, "invalid");
  assert.equal(broken.innerHTML, "");
  assert.equal(broken.statuses.length, 1);
  assert.equal(valid.dataset.mermaidState, "rendered");
  assert.equal(valid.innerHTML, "<svg></svg>");
  assert.equal(valid.tabIndex, 0);
  assert.notEqual(result.rendered[0].id, result.rendered[1].id);
});

test("an unavailable renderer leaves every source block readable", async () => {
  const blocks = [createBlock("first"), createBlock("second")];
  await runClient(blocks, { failLoad: true });
  for (const block of blocks) {
    assert.equal(block.dataset.mermaidState, "error");
    assert.equal(block.innerHTML, "");
  }
});
