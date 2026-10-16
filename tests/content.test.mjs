import assert from "node:assert/strict";
import test from "node:test";
import { selectPosts, selectProjects } from "../src/lib/content.ts";
import {
  getAdjacentPosts,
  getBlogCategory,
  getRelatedPosts,
  scoreRelatedPost,
} from "../src/lib/blog.ts";

const post = (slug, date, data = {}) => ({
  id: `${slug}.md`,
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

test("blog categories follow source folders, including new names and deeper subfolders", () => {
  assert.equal(getBlogCategory({ id: "rec/example.md" }), "rec");
  assert.equal(
    getBlogCategory({ id: "Frontend/React/example.mdx" }),
    "Frontend",
  );
  assert.equal(getBlogCategory({ id: "学习记录/example.md" }), "学习记录");
  assert.equal(getBlogCategory({ id: "all/example.md" }), "all");
  assert.equal(getBlogCategory({ id: "root-post.md" }), null);
});

test("categories follow the source ID rather than tags or a custom URL slug", () => {
  const entry = post("custom-url", "2026-01-01", { tags: ["SQL", "前端"] });
  entry.id = "Machine Learning/original-title.md";
  assert.equal(getBlogCategory(entry), "Machine Learning");
});

test("related posts prefer a shared folder without treating all root posts as a topic", () => {
  const current = post("rec/current", "2026-01-01");
  const sibling = post("rec/sibling", "2026-01-01");
  const otherFolder = post("frontend/other", "2026-01-01");
  assert.deepEqual(slugs(getRelatedPosts(current, [otherFolder, sibling])), [
    "rec/sibling",
    "frontend/other",
  ]);
  const root = post("root", "2026-01-01");
  const unrelatedRoot = post("unrelated", "2026-01-01");
  assert.equal(
    scoreRelatedPost(root, unrelatedRoot),
    scoreRelatedPost(root, otherFolder),
  );
});
