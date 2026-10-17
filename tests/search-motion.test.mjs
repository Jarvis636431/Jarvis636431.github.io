import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const component = readFileSync(
  new URL("../src/components/Search.astro", import.meta.url),
  "utf8",
);
const source = ts
  .transpileModule(component.match(/<script>([\s\S]*?)<\/script>/)[1], {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  })
  .outputText.replace(/^import .*;\s*$/gm, "");

function setup(reduced = false) {
  let document;
  class Element {
    style = {
      overflow: "",
      paddingRight: "",
      opacity: "",
      pointerEvents: "",
      transitionDelay: "",
    };
    dataset = {};
    attrs = {};
    listeners = new Map();
    open = false;
    addEventListener(event, handler) {
      this.listeners.set(event, handler);
    }
    setAttribute(key, value) {
      this.attrs[key] = value;
    }
    removeAttribute(key) {
      delete this.attrs[key];
    }
    replaceChildren() {}
    querySelectorAll() {
      return [];
    }
    focus() {
      document.activeElement = this;
    }
    showModal() {
      this.open = true;
    }
    close() {
      this.open = false;
      this.listeners.get("close")?.();
    }
  }
  const elements = new Map(
    [
      "search-dialog",
      "search-input",
      "search-results",
      "search-status",
      "search-close",
      "main-header",
    ].map((id) => [id, new Element()]),
  );
  const trigger = new Element();
  const body = new Element();
  body.style.overflow = "auto";
  body.style.paddingRight = "3px";
  document = {
    activeElement: trigger,
    body,
    documentElement: { clientWidth: 980 },
    getElementById: (id) => elements.get(id),
    querySelectorAll: () => [trigger],
    createElement: () => new Element(),
  };
  const timers = new Map();
  const frames = new Map();
  let counter = 0;
  const frame = (fn) => {
    const id = ++counter;
    frames.set(id, fn);
    return id;
  };
  const window = {
    innerWidth: 1000,
    matchMedia: () => ({ matches: reduced }),
    addEventListener() {},
    setTimeout(fn) {
      const id = ++counter;
      timers.set(id, fn);
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const api = runInNewContext(`${source}; ({openSearch, closeSearch});`, {
    document,
    window,
    HTMLElement: Element,
    requestAnimationFrame: frame,
    fetch: async () => ({ ok: true, json: async () => [] }),
    createSearch: () => ({ search: () => [] }),
    getSearchExcerpt() {},
  });
  const flush = (queue) => {
    while (queue.size) {
      const [id, fn] = queue.entries().next().value;
      queue.delete(id);
      fn();
    }
  };
  return {
    ...api,
    dialog: elements.get("search-dialog"),
    trigger,
    body,
    document,
    timers,
    frames,
    animate: () => flush(frames),
    finish: () => flush(timers),
  };
}

test("search paints a compact bar before expanding and waits for the closing animation", () => {
  const ui = setup();
  ui.openSearch();
  assert.equal(ui.dialog.dataset.state, "opening");
  assert.equal(ui.dialog.open, true);
  ui.animate();
  assert.equal(ui.dialog.dataset.state, "open");
  ui.closeSearch();
  assert.equal(ui.dialog.dataset.state, "closing");
  assert.equal(ui.dialog.open, true);
  assert.equal(ui.timers.size, 1);
  ui.finish();
  assert.equal(ui.dialog.open, false);
  assert.equal(ui.body.style.overflow, "auto");
  assert.equal(ui.body.style.paddingRight, "3px");
  assert.equal(ui.document.activeElement, ui.trigger);
});

test("reopening cancels a pending close and preserves the original focus target", () => {
  const ui = setup();
  ui.openSearch();
  ui.animate();
  ui.closeSearch();
  ui.openSearch();
  ui.animate();
  ui.finish();
  assert.equal(ui.dialog.open, true);
  assert.equal(ui.dialog.dataset.state, "open");
  assert.equal(ui.timers.size, 0);
  ui.closeSearch();
  ui.finish();
  assert.equal(ui.document.activeElement, ui.trigger);
});

test("closing before the first paint cancels pending animation frames", () => {
  const ui = setup();
  ui.openSearch();
  ui.closeSearch();
  assert.equal(ui.frames.size, 0);
  ui.animate();
  assert.equal(ui.dialog.dataset.state, "closing");
  ui.finish();
  assert.equal(ui.dialog.open, false);
});

test("reduced motion opens and closes immediately without timers", () => {
  const ui = setup(true);
  ui.openSearch();
  assert.equal(ui.dialog.dataset.state, "open");
  assert.equal(ui.frames.size, 0);
  ui.closeSearch();
  assert.equal(ui.dialog.open, false);
  assert.equal(ui.timers.size, 0);
});
