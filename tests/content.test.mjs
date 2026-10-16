import assert from "node:assert/strict";
import test from "node:test";
import { selectPosts, selectProjects } from "../src/lib/content.ts";
import { getAdjacentPosts, getRelatedPosts } from "../src/lib/blog.ts";

const post = (slug, date, data = {}) => ({
  slug,
  data: { publishDate: new Date(date), draft: false, tags: [], ...data },
});
const project = (slug, date, data = {}) => ({
  slug,
  data: {
    publishDate: new Date(date),
    status: "launched",
    featured: false,
    ...data,
  },
});
const slugs = (entries) => entries.map((entry) => entry.slug);

test("public post selection excludes drafts and keeps newest first without changing its input", () => {
  const posts = [
    post("older", "2025-01-01"),
    post("draft", "2026-01-01", { draft: true }),
    post("newer", "2025-06-01"),
  ];
  assert.deepEqual(slugs(selectPosts(posts)), ["newer", "older"]);
  assert.deepEqual(slugs(posts), ["older", "draft", "newer"]);
  assert.deepEqual(slugs(selectPosts(posts, { includeDrafts: true })), [
    "draft",
    "newer",
    "older",
  ]);
});

test("archive previews are explicit; featured selections do not expose archived projects", () => {
  const projects = [
    project("archived-feature", "2026-01-01", {
      status: "archived",
      featured: true,
    }),
    project("launched-feature", "2025-01-01", { featured: true }),
    project("in-progress", "2025-06-01", { status: "in-progress" }),
  ];
  assert.deepEqual(slugs(selectProjects(projects)), [
    "in-progress",
    "launched-feature",
  ]);
  assert.deepEqual(slugs(selectProjects(projects, { includeArchived: true })), [
    "archived-feature",
    "in-progress",
    "launched-feature",
  ]);
  assert.deepEqual(slugs(selectProjects(projects, { featuredOnly: true })), [
    "launched-feature",
  ]);
  assert.deepEqual(slugs(projects), [
    "archived-feature",
    "launched-feature",
    "in-progress",
  ]);
});

test("related articles exclude self, prefer topic overlap, and break equal scores by date", () => {
  const current = post("current", "2025-06-01", { tags: ["React"] });
  const before = post("before", "2025-05-31", { tags: ["React"] });
  const after = post("after", "2025-06-02", { tags: ["React"] });
  const unrelated = post("unrelated", "2025-06-01", { tags: ["SQL"] });
  const posts = [current, before, unrelated, after];
  assert.deepEqual(slugs(getRelatedPosts(current, posts, 2)), [
    "after",
    "before",
  ]);
  assert.deepEqual(slugs(posts), ["current", "before", "unrelated", "after"]);
});

test("series navigation uses series order instead of publication date", () => {
  const first = post("first", "2025-06-03", {
    series: "Guide",
    seriesOrder: 1,
  });
  const current = post("second", "2025-06-01", {
    series: "Guide",
    seriesOrder: 2,
  });
  const last = post("third", "2025-06-02", { series: "Guide", seriesOrder: 3 });
  const adjacent = getAdjacentPosts(current, [last, current, first]);
  assert.equal(adjacent.previous.slug, "first");
  assert.equal(adjacent.next.slug, "third");
  assert.equal(adjacent.isSeries, true);
});

test("empty collections have no recommendations or neighbours", () => {
  const current = post("current", "2025-01-01");
  assert.deepEqual(selectPosts([]), []);
  assert.deepEqual(selectProjects([]), []);
  assert.deepEqual(getRelatedPosts(current, []), []);
  assert.deepEqual(getAdjacentPosts(current, []), {
    previous: undefined,
    next: undefined,
    isSeries: false,
  });
});
