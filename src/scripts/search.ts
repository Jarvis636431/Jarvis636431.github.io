import {
  createSearch,
  getSearchExcerpt,
  type SearchItem,
} from "../lib/search/index.ts";
import type { FuseResult, RangeTuple } from "fuse.js";

/** Bind the search dialog; browser dependencies are injectable for tests. */
export function initSearch(
  document: Document = globalThis.document,
  window: Window & typeof globalThis = globalThis.window,
) {
  let fuse: ReturnType<typeof createSearch> | null = null;
  let indexPromise: Promise<boolean> | null = null;
  let selectedResultIndex = -1;
  let composing = false;
  let lastFocusedElement: HTMLElement | null = null;
  let previousOverflow = "";
  let previousPadding = "";
  let closeTimer: number | undefined;
  let openingFrame: number | undefined;
  let closing = false;
  let headerStyles = { opacity: "", pointerEvents: "", transitionDelay: "" };
  const header = document.getElementById("main-header");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dialog = document.getElementById("search-dialog") as HTMLDialogElement;
  const input = document.getElementById("search-input") as HTMLInputElement;
  const resultsContainer = document.getElementById("search-results")!;
  const searchStatus = document.getElementById("search-status")!;

  function renderMessage(message: string) {
    const paragraph = document.createElement("p");
    paragraph.className = "search-message";
    paragraph.textContent = message;
    resultsContainer.replaceChildren(paragraph);
    selectedResultIndex = -1;
    input.removeAttribute("aria-activedescendant");
  }

  function getResultLinks() {
    return Array.from(
      resultsContainer.querySelectorAll<HTMLAnchorElement>(
        "[data-search-result]",
      ),
    );
  }

  function updateSelectedResult(nextIndex: number, scroll = true) {
    const links = getResultLinks();
    if (!links.length) return;
    selectedResultIndex = (nextIndex + links.length) % links.length;
    links.forEach((link, index) =>
      link.setAttribute("aria-selected", String(index === selectedResultIndex)),
    );
    const selected = links[selectedResultIndex];
    input.setAttribute("aria-activedescendant", selected.id);
    if (scroll) selected.scrollIntoView({ block: "nearest" });
  }

  // Build highlights with DOM text nodes so article text can never inject HTML.
  function appendHighlighted(
    target: HTMLElement,
    text: string,
    ranges: readonly RangeTuple[] = [],
  ) {
    let cursor = 0;
    for (const [from, to] of [...ranges].sort((a, b) => a[0] - b[0])) {
      const start = Math.max(cursor, from);
      const end = Math.min(text.length, to + 1);
      if (start >= end) continue;
      target.append(document.createTextNode(text.slice(cursor, start)));
      const mark = document.createElement("mark");
      mark.textContent = text.slice(start, end);
      target.append(mark);
      cursor = end;
    }
    target.append(document.createTextNode(text.slice(cursor)));
  }

  function createResultLink(
    result: FuseResult<SearchItem>,
    index: number,
    query: string,
  ) {
    const { item, matches } = result;
    const link = document.createElement("a");
    link.href = item.slug;
    link.id = `search-result-${index}`;
    link.dataset.searchResult = "true";
    link.className = "search-result";
    link.setAttribute("role", "option");
    link.setAttribute("aria-selected", "false");

    const meta = document.createElement("div");
    meta.className = "search-result-meta";
    const type = document.createElement("span");
    type.textContent = item.collection === "blog" ? "Article" : "Project";
    meta.append(type);
    if (item.category) {
      const category = document.createElement("span");
      appendHighlighted(
        category,
        item.category,
        matches?.find((match) => match.key === "category")?.indices,
      );
      meta.append(category);
    }
    const date = document.createElement("time");
    date.dateTime = item.date;
    date.textContent = item.date.slice(0, 10);
    meta.append(date);

    const title = document.createElement("h3");
    title.className = "search-result-title";
    appendHighlighted(
      title,
      item.title,
      matches?.find((match) => match.key === "title")?.indices,
    );
    const excerpt = document.createElement("p");
    excerpt.className = "search-result-excerpt";
    const passage = getSearchExcerpt(result, query);
    appendHighlighted(excerpt, passage.text, passage.ranges);
    link.append(meta, title);
    const alternateName = matches?.find(
      (match) =>
        (match.key === "alternateTitles" || match.key === "aliases") &&
        match.value &&
        match.value !== item.title,
    );
    if (alternateName?.value) {
      const alias = document.createElement("p");
      alias.className = "search-result-alias";
      alias.append(document.createTextNode("Also known as: "));
      const name = document.createElement("span");
      appendHighlighted(name, alternateName.value, alternateName.indices);
      alias.append(name);
      link.append(alias);
    }
    link.append(excerpt);

    if (item.tags.length) {
      const tags = document.createElement("div");
      tags.className = "search-result-tags";
      const tagMatches = matches?.filter((match) => match.key === "tags") ?? [];
      const orderedTags = [...item.tags].sort(
        (a, b) =>
          Number(tagMatches.some((match) => match.value === b)) -
          Number(tagMatches.some((match) => match.value === a)),
      );
      for (const value of orderedTags.slice(0, 3)) {
        const tag = document.createElement("span");
        tag.append(document.createTextNode("#"));
        appendHighlighted(
          tag,
          value,
          tagMatches.find((match) => match.value === value)?.indices,
        );
        tags.append(tag);
      }
      link.append(tags);
    }
    link.addEventListener("pointermove", () =>
      updateSelectedResult(index, false),
    );
    link.addEventListener("focus", () => updateSelectedResult(index, false));
    return link;
  }

  async function loadIndex() {
    if (fuse) return true;
    if (indexPromise) return indexPromise;
    searchStatus.textContent = "Loading…";
    indexPromise = (async () => {
      try {
        const response = await window.fetch("/search-index.json");
        if (!response.ok) throw new Error("Search unavailable");
        const items = (await response.json()) as SearchItem[];
        fuse = createSearch(items);
        searchStatus.textContent = "";
        return true;
      } catch {
        searchStatus.textContent = "Unavailable";
        renderMessage("Search could not load. Type again or reopen to retry.");
        return false;
      } finally {
        indexPromise = null;
      }
    })();
    return indexPromise;
  }

  async function runSearch() {
    const query = input.value.trim();
    if (!query) {
      renderMessage("Search titles, topics, or article text.");
      searchStatus.textContent = "";
      return;
    }
    if (!fuse) {
      renderMessage("Loading search index…");
      if (!(await loadIndex())) return;
      if (!dialog.open || input.value.trim() !== query) return;
    }
    const results = fuse!.search(query, { limit: 20 });
    searchStatus.textContent =
      results.length === 20
        ? "Top 20 results"
        : `${results.length} ${results.length === 1 ? "result" : "results"}`;
    if (!results.length) {
      renderMessage("No results found. Try a different keyword.");
      return;
    }
    const fragment = document.createDocumentFragment();
    results.forEach((result, index) =>
      fragment.append(createResultLink(result, index, query)),
    );
    resultsContainer.replaceChildren(fragment);
    resultsContainer.scrollTop = 0;
    updateSelectedResult(0, false);
  }

  function clearMotion() {
    window.clearTimeout(closeTimer);
    if (openingFrame !== undefined) window.cancelAnimationFrame(openingFrame);
    closeTimer = undefined;
    openingFrame = undefined;
  }

  function openSearch() {
    if (dialog.open && !closing) return;
    clearMotion();
    closing = false;
    if (!dialog.open) {
      // Mobile triggers become inert when their menu closes; restore a visible control.
      const focused = document.activeElement;
      lastFocusedElement =
        focused === document.getElementById("mobile-search-btn")
          ? document.getElementById("menu-btn")
          : focused instanceof window.HTMLElement
            ? focused
            : null;
      previousOverflow = document.body.style.overflow;
      previousPadding = document.body.style.paddingRight;
      if (header)
        headerStyles = {
          opacity: header.style.opacity,
          pointerEvents: header.style.pointerEvents,
          transitionDelay: header.style.transitionDelay,
        };
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth)
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      dialog.dataset.state = "opening";
      dialog.showModal();
      renderMessage("Search titles, topics, or article text.");
    }
    if (header) {
      header.style.transitionDelay = "0s";
      header.style.opacity = "0";
      header.style.pointerEvents = "none";
    }
    input.setAttribute("aria-expanded", "true");
    input.focus();
    if (reduceMotion.matches) {
      dialog.dataset.state = "open";
    } else {
      // Paint the compact search bar before expanding, matching the original motion.
      openingFrame = window.requestAnimationFrame(() => {
        openingFrame = window.requestAnimationFrame(() => {
          openingFrame = undefined;
          if (dialog.open && !closing) dialog.dataset.state = "open";
        });
      });
    }
    void loadIndex();
  }

  function closeSearch() {
    if (!dialog.open || closing) return;
    clearMotion();
    closing = true;
    dialog.dataset.state = "closing";
    if (header) {
      header.style.transitionDelay = reduceMotion.matches ? "0s" : "0.2s";
      header.style.opacity = headerStyles.opacity;
      header.style.pointerEvents = headerStyles.pointerEvents;
    }
    if (reduceMotion.matches) dialog.close();
    else closeTimer = window.setTimeout(() => dialog.close(), 600);
  }

  document
    .getElementById("search-close")
    ?.addEventListener("click", closeSearch);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeSearch();
  });
  dialog.addEventListener("close", () => {
    clearMotion();
    closing = false;
    delete dialog.dataset.state;
    if (header) {
      header.style.opacity = headerStyles.opacity;
      header.style.pointerEvents = headerStyles.pointerEvents;
      header.style.transitionDelay = headerStyles.transitionDelay;
    }
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPadding;
    input.value = "";
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    searchStatus.textContent = "";
    lastFocusedElement?.focus();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !event.isComposing) {
      event.preventDefault();
      closeSearch();
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      closeSearch();
  });
  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open && !closing) closeSearch();
      else openSearch();
    }
  });
  document
    .querySelectorAll("[data-search-trigger]")
    .forEach((trigger) => trigger.addEventListener("click", openSearch));
  input.addEventListener("compositionstart", () => {
    composing = true;
  });
  input.addEventListener("input", () => {
    if (!composing) void runSearch();
  });
  input.addEventListener("compositionend", () => {
    composing = false;
    void runSearch();
  });
  input.addEventListener("keydown", (event) => {
    if (event.isComposing) return;
    const links = getResultLinks();
    if (!links.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      updateSelectedResult(
        selectedResultIndex + (event.key === "ArrowDown" ? 1 : -1),
      );
    } else if (event.key === "Enter" && selectedResultIndex >= 0) {
      event.preventDefault();
      links[selectedResultIndex]?.click();
    }
  });

  return { openSearch, closeSearch };
}
