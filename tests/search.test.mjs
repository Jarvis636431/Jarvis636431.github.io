import assert from "node:assert/strict";
import test from "node:test";
import { createSearch, getSearchExcerpt } from "../src/lib/search.ts";
import { getSearchText } from "../src/lib/markdown.mjs";

const item = (changes = {}) => ({
  title: "A practical guide",
  description: "An introduction to model evaluation.",
  body: "The main article text.",
  tags: ["learning"],
  category: "rec",
  collection: "blog",
  slug: "/blogs/guide",
  date: "2026-10-17T00:00:00.000Z",
  ...changes,
});

test("full-text search finds Chinese and code identifiers far into an article", () => {
  const body = `${"Background material. ".repeat(200)}曝光偏差 optimizer.zero_grad() ${"Further discussion. ".repeat(40)}`;
  const search = createSearch([
    item({ body }),
    item({ title: "Unrelated", slug: "/blogs/other" }),
  ]);
  for (const query of ["曝光偏差", "optimizer.zero_grad"]) {
    const results = search.search(query);
    assert.equal(results[0].item.slug, "/blogs/guide");
    const excerpt = getSearchExcerpt(results[0], query);
    assert.ok(excerpt.text.includes(query));
    assert.ok(excerpt.text.startsWith("…"));
    assert.ok(excerpt.text.length <= 162);
    assert.equal(
      excerpt.text.slice(excerpt.ranges[0][0], excerpt.ranges[0][1] + 1),
      query,
    );
  }
});

test("exact title matches outrank body-only matches and metadata remains searchable", () => {
  const search = createSearch([
    item({ title: "Training notes", body: "About calibration", slug: "/body" }),
    item({
      title: "Calibration",
      body: "A mathematical explanation",
      slug: "/title",
    }),
    item({
      title: "Release notes",
      tags: ["cross-platform"],
      category: "frontend",
      slug: "/tags",
    }),
  ]);
  assert.equal(search.search("calibration")[0].item.slug, "/title");
  assert.equal(search.search("cross-platform")[0].item.slug, "/tags");
  assert.equal(search.search("frontend")[0].item.slug, "/tags");
  assert.equal(search.search("完全不存在的检索内容").length, 0);
});

test("summary matches highlight their context and title-only matches use the summary", () => {
  const search = createSearch([
    item({
      title: "Sigmoid",
      description: "Probability estimation in production.",
    }),
  ]);
  const summary = getSearchExcerpt(
    search.search("estimation")[0],
    "estimation",
  );
  assert.match(summary.text, /Probability estimation/);
  assert.equal(
    summary.text.slice(summary.ranges[0][0], summary.ranges[0][1] + 1),
    "estimation",
  );
  const title = getSearchExcerpt(search.search("sigmoid")[0], "sigmoid");
  assert.equal(title.text, "Probability estimation in production.");
  assert.deepEqual(title.ranges, []);
});

test("fuzzy matches have bounded highlight ranges and long snippets preserve emoji", () => {
  const body =
    "Intro ".repeat(35) +
    "🚀 calibration in the model. " +
    "More detail. ".repeat(30);
  const result = createSearch([item({ body })]).search("calibraton")[0];
  const excerpt = getSearchExcerpt(result, "calibraton", 80);
  assert.match(excerpt.text, /calibration/);
  assert.ok(excerpt.ranges.length);
  for (const [from, to] of excerpt.ranges) {
    assert.ok(from >= 0 && to >= from && to < excerpt.text.length);
  }
  assert.equal(excerpt.text.isWellFormed(), true);
});

test("index extraction preserves prose, headings, code, and image descriptions without Markdown markup", () => {
  const source = [
    "---",
    "title: Hidden metadata",
    "---",
    "## Evaluation",
    "> [!NOTE]",
    "> Test **calibration** and [AUC](https://example.com/private-path).",
    "",
    "- Positive samples",
    "- Negative samples",
    "",
    "```python",
    "optimizer.zero_grad()",
    "```",
    "",
    "![Precision curve](/assets/curve.png)",
    "",
    "<script>unsearchable_script()</script>",
  ].join("\n");
  const text = getSearchText(source);
  assert.match(text, /Evaluation/);
  assert.match(text, /calibration and AUC/);
  assert.match(text, /optimizer\.zero_grad\(\)/);
  assert.match(text, /Precision curve/);
  assert.doesNotMatch(
    text,
    /Hidden metadata|\[!NOTE\]|\*\*|```|private-path|assets\/curve|unsearchable_script/,
  );
});
