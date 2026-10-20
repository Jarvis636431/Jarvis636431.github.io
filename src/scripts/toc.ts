/** Build and track each article TOC after the document has been parsed. */
export function initToc(
  document: Document = globalThis.document,
  Observer: typeof IntersectionObserver = globalThis.IntersectionObserver,
) {
  const tocRoots = document.querySelectorAll<HTMLElement>("[data-toc-root]");
  tocRoots.forEach((root) => {
    const articleId = root.getAttribute("data-article-id");
    const tocId = root.getAttribute("data-toc-id");
    const itemClass = root.getAttribute("data-item-class");
    if (!articleId || !tocId || !itemClass) return;

    const article = document.getElementById(articleId);
    const toc = document.getElementById(tocId);
    if (!article || !toc) return;

    const headings = Array.from(
      article.querySelectorAll<HTMLElement>("h1, h2, h3"),
    );
    const slugify = (s: string) =>
      s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const baseDepth = Math.min(
      ...headings.map((heading) => Number(heading.tagName.slice(1))),
    );
    const items: { id: string; depth: number; text: string }[] = [];
    const usedIds = new Set<string>();
    const existingIds = new Set(
      headings.map((heading) => heading.id).filter(Boolean),
    );
    headings.forEach((h) => {
      const label = h.cloneNode(true) as HTMLElement;
      label
        .querySelectorAll(".heading-anchor")
        .forEach((anchor) => anchor.remove());
      const text = label.textContent?.trim() || "";
      const baseId = h.id || slugify(text) || "section";
      let id = baseId;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${baseId}-${suffix++}`;
        while (existingIds.has(id)) id = `${baseId}-${suffix++}`;
      }
      usedIds.add(id);
      h.id = id;
      const depth = Number(h.tagName.slice(1)) - baseDepth + 1;
      items.push({ id, depth, text });
    });
    if (items.length < 2) {
      root.setAttribute("hidden", "");
      return;
    }
    const fragment = document.createDocumentFragment();
    // Keep element references: itemClass contains multiple CSS classes, not a selector.
    const linksById = new Map<string, HTMLAnchorElement>();
    items.forEach((item) => {
      const link = document.createElement("a");
      link.href = `#${item.id}`;
      link.className = `${itemClass} toc-depth-${item.depth}`;
      link.dataset.id = item.id;
      link.textContent = item.text;
      linksById.set(item.id, link);
      fragment.append(link);
    });
    toc.replaceChildren(fragment);
    const toggle = root.querySelector("[data-toc-toggle]");
    toggle?.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      root.classList.toggle("toc-open", !expanded);
      const icon = toggle.lastElementChild;
      if (icon) icon.textContent = expanded ? "＋" : "−";
    });
    const links = Array.from(linksById.values());
    const keepLinkVisible = (link: HTMLAnchorElement) => {
      // Scroll only the TOC itself; scrollIntoView can also move the article.
      if (toc.clientHeight === 0 || toc.scrollHeight <= toc.clientHeight)
        return;
      const viewportTop = toc.getBoundingClientRect().top + toc.clientTop;
      const viewportBottom = viewportTop + toc.clientHeight;
      const bounds = link.getBoundingClientRect();
      let delta = 0;
      if (bounds.top < viewportTop) {
        delta = bounds.top - viewportTop - 8;
      } else if (bounds.bottom > viewportBottom) {
        delta = Math.min(
          bounds.bottom - viewportBottom + 8,
          bounds.top - viewportTop,
        );
      }
      if (delta) toc.scrollTo({ top: toc.scrollTop + delta, behavior: "auto" });
    };
    const observer = new Observer(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = linksById.get(id);
          if (link && entry.isIntersecting) {
            links.forEach((l) => {
              l.classList.remove("active");
              l.removeAttribute("aria-current");
            });
            link.classList.add("active");
            link.setAttribute("aria-current", "true");
            keepLinkVisible(link);
          }
        });
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 },
    );
    headings.forEach((h) => observer.observe(h));
  });
}
