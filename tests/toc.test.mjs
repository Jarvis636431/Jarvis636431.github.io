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

function renderToc(ids) {
  const headings = ids.map((id, index) => ({
    id,
    textContent: `Section ${index + 1}`,
    tagName: index === 0 ? "H2" : "H3",
  }));
  const links = [];
  const toggle = { addEventListener() {} };
  const toc = {
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
  const article = { querySelectorAll: () => headings };
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
      const classes = new Set();
      const attributes = new Map();
      return {
        dataset: {},
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
