import assert from "node:assert/strict";
import test from "node:test";
import { createArticleProcessor } from "./fixtures/markdown.mjs";

const processor = await createArticleProcessor();

test("article code blocks render official titles, copy controls, line numbers and markers", async () => {
  const { code } = await processor.render(
    '```ts title="example.ts" showLineNumbers {2} collapse={3-4}\nconst a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\n```',
  );
  assert.match(code, /class="expressive-code"/);
  assert.match(code, /example\.ts/);
  assert.match(code, /data-code="const a = 1;/);
  assert.match(code, /class="[^"]*highlight/);
  assert.match(code, /class="[^"]*gutter/);
  assert.match(code, /<details/);
  assert.match(code, /2 collapsed lines/);
});

test("long code folds after 24 lines while explicit ranges take priority", async () => {
  const source = Array.from(
    { length: 30 },
    (_, i) => `const line${i + 1} = ${i};`,
  ).join("\n");
  const automatic = await processor.render(`\`\`\`js\n${source}\n\`\`\``);
  assert.match(automatic.code, /6 collapsed lines/);
  const explicit = await processor.render(
    `\`\`\`js collapse={2-3}\n${source}\n\`\`\``,
  );
  assert.match(explicit.code, /2 collapsed lines/);
  assert.doesNotMatch(explicit.code, /6 collapsed lines/);
});

test("long diagrams preserve exact source without folding or copy controls", async () => {
  const source = `flowchart LR\n${Array.from({ length: 30 }, (_, i) => `A${i} --> A${i + 1}`).join("\n")}`;
  const { code } = await processor.render(`\`\`\`mermaid\n${source}\n\`\`\``);
  assert.match(code, /<pre class="mermaid">flowchart LR\n/);
  assert.doesNotMatch(
    code,
    /<details|data-code=|expressive-code|_assets\/ec\./,
  );
  assert.equal(code.match(/A\d+ --(?:&gt;|>) A\d+/g)?.length, 30);
});
