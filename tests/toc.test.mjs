import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";

// Execute the actual component script with the DOM operations it uses.
const component = readFileSync(
  new URL("../src/components/Toc.astro", import.meta.url),
  "utf8",
);
const script = component.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];

function renderToc(ids, { height = 200, scrollHeight = ids.length * 30 } = {}) {
  const headings = ids.map((entry, index) => {
    const heading = {
      id: typeof entry === "string" ? entry : entry.id,
      textContent: `Section ${index + 1}`,
      tagName: index === 0 ? "H2" : "H3",
      ...(typeof entry === "string" ? {} : entry),
    };
    if (heading.parts)
      heading.textContent = heading.parts.map((part) => part.text).join("");
    heading.cloneNode = () => {
      const children = (heading.parts ?? [{ text: heading.textContent }]).map(
        (part) => ({ ...part }),
      );
      return {
        get textContent() {
          return children.map((part) => part.text).join("");
        },
        querySelectorAll(selector) {
          if (selector !== ".heading-anchor") return [];
          return children
            .filter((part) => part.anchor)
            .map((part) => ({
              remove() {
                children.splice(children.indexOf(part), 1);
              },
            }));
        },
      };
    };
    return heading;
  });
  const links = [];
  const scrollRequests = [];
  let linkIndex = 0;
  const toggle = { addEventListener() {} };
  const toc = {
    clientHeight: height,
    clientTop: 0,
    scrollHeight,
    scrollTop: 0,
    getBoundingClientRect: () => ({ top: 100 }),
    scrollTo(options) {
      scrollRequests.push(options);
      this.scrollTop = Math.max(
        0,
        Math.min(options.top, this.scrollHeight - this.clientHeight),
      );
    },
    replaceChildren(fragment) {
      links.push(...fragment.children);
    },
    // The old multi-class selector cannot match any generated links.
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
    },
  };
  const attributes = {
    "data-article-id": "article",
    "data-toc-id": "toc",
    "data-item-class": "article__toc-item detail__toc-item",
  };
  const root = {
    getAttribute: (name) => attributes[name],
    querySelector: () => toggle,
    setAttribute() {},
  };
  const article = {
    querySelectorAll(selector) {
      const tags = selector.split(",").map((tag) => tag.trim().toUpperCase());
      return headings.filter((heading) => tags.includes(heading.tagName));
    },
  };
  const document = {
    readyState: "complete",
    querySelectorAll: () => [root],
    getElementById: (id) => (id === "article" ? article : toc),
    createDocumentFragment: () => ({
      children: [],
      append(link) {
        this.children.push(link);
      },
    }),
    createElement: () => {
      const index = linkIndex++;
      const classes = new Set();
      const attributes = new Map();
      return {
        dataset: {},
        getBoundingClientRect() {
          const top = 100 + index * 30 - toc.scrollTop;
          return { top, bottom: top + 30 };
        },
        scrollIntoView() {
          throw new Error("TOC tracking must not scroll the outer page");
        },
        classList: {
          add: (name) => classes.add(name),
          remove: (name) => classes.delete(name),
          contains: (name) => classes.has(name),
        },
        setAttribute: (name, value) => attributes.set(name, value),
        removeAttribute: (name) => attributes.delete(name),
        getAttribute: (name) => attributes.get(name),
      };
    },
  };
  let onIntersection;
  runInNewContext(script, {
    document,
    IntersectionObserver: class {
      constructor(callback) {
        onIntersection = callback;
      }
      observe() {}
    },
  });
  return {
    headings,
    links,
    scrollRequests,
    container: toc,
    enter(index) {
      onIntersection([{ target: headings[index], isIntersecting: true }]);
    },
  };
}

test("scrolling highlights the matching heading and clears the previous selection", () => {
  const toc = renderToc(["intro", 'quoted"[section]', "conclusion"]);
  toc.enter(0);
  assert.equal(toc.links[0].classList.contains("active"), true);
  assert.equal(toc.links[0].getAttribute("aria-current"), "true");
  toc.enter(1);
  assert.equal(toc.links[0].classList.contains("active"), false);
  assert.equal(toc.links[0].getAttribute("aria-current"), undefined);
  assert.equal(toc.links[1].classList.contains("active"), true);
  assert.equal(toc.links[1].getAttribute("aria-current"), "true");
  assert.equal(toc.links[2].classList.contains("active"), false);
});

test("duplicate headings get unique anchors without taking an existing suffixed ID", () => {
  const toc = renderToc(["section", "section", "section-2"]);
  assert.equal(new Set(toc.headings.map((heading) => heading.id)).size, 3);
  assert.equal(toc.headings[2].id, "section-2");
  toc.headings.forEach((heading, index) => {
    assert.equal(toc.links[index].href, `#${heading.id}`);
    toc.enter(index);
    assert.equal(toc.links[index].classList.contains("active"), true);
    assert.equal(
      toc.links.filter((link) => link.classList.contains("active")).length,
      1,
    );
  });
});

test("legacy h1 interview rounds and their subsections are all included and highlighted", () => {
  const toc = renderToc([
    { id: "round-one", tagName: "H1", textContent: "一面" },
    { id: "coding", tagName: "H3", textContent: "手撕" },
    { id: "round-two", tagName: "H1", textContent: "二面" },
    { id: "project", tagName: "H3", textContent: "项目" },
    { id: "round-three", tagName: "H1", textContent: "三面" },
  ]);
  assert.equal(toc.links.length, 5);
  assert.equal(toc.links[0].textContent, "一面");
  assert.match(toc.links[0].className, /toc-depth-1/);
  assert.match(toc.links[1].className, /toc-depth-3/);
  for (const index of [0, 2, 4]) {
    toc.enter(index);
    assert.equal(toc.links[index].getAttribute("aria-current"), "true");
    assert.equal(
      toc.links.filter((link) => link.classList.contains("active")).length,
      1,
    );
  }
});

test("h2-based articles start at the first visual TOC level", () => {
  const toc = renderToc([
    { id: "round", tagName: "H2" },
    { id: "coding", tagName: "H3" },
  ]);
  assert.match(toc.links[0].className, /toc-depth-1/);
  assert.match(toc.links[1].className, /toc-depth-2/);
});

test("TOC labels exclude permalink controls without stripping literal hash characters", () => {
  const toc = renderToc([
    {
      id: "csharp",
      parts: [{ text: "C# 基础" }, { text: " #", anchor: true }],
    },
    { id: "literal", textContent: "标题里保留 #" },
  ]);
  assert.equal(toc.links[0].textContent, "C# 基础");
  assert.equal(toc.links[1].textContent, "标题里保留 #");
  assert.equal(toc.headings[0].textContent, "C# 基础 #");
  assert.equal(toc.links[0].href, "#csharp");
  toc.enter(0);
  assert.equal(toc.links[0].getAttribute("aria-current"), "true");
});

test("a long TOC follows off-screen selections in both directions without moving the page", () => {
  const toc = renderToc(
    Array.from({ length: 10 }, (_, index) => `section-${index}`),
    { height: 90 },
  );
  toc.enter(0);
  assert.equal(toc.scrollRequests.length, 0);
  toc.enter(6);
  assert.equal(toc.scrollRequests.length, 1);
  assert.ok(toc.container.scrollTop > 0);
  const bounds = toc.links[6].getBoundingClientRect();
  assert.ok(bounds.top >= 100 && bounds.bottom <= 190);
  assert.equal(toc.links[6].getAttribute("aria-current"), "true");
  toc.enter(6);
  assert.equal(
    toc.scrollRequests.length,
    1,
    "visible selections should not cause extra scrolling",
  );
  toc.enter(0);
  assert.equal(toc.scrollRequests.length, 2);
  assert.equal(toc.container.scrollTop, 0);
  assert.equal(toc.links[0].getAttribute("aria-current"), "true");
});

test("collapsed and non-overflowing TOCs do not scroll", () => {
  for (const height of [0, 300]) {
    const toc = renderToc(["intro", "middle", "end"], { height });
    toc.enter(2);
    assert.equal(toc.links[2].getAttribute("aria-current"), "true");
    assert.equal(toc.scrollRequests.length, 0);
  }
});
