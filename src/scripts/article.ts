export function initArticle() {
  const progress = document.getElementById("reading-progress");
  const backToTop = document.getElementById("back-to-top");
  const article = document.getElementById("blog-article");

  function updateReadingProgress() {
    if (!progress || !article) return;

    const articleTop = article.offsetTop;
    const articleHeight = article.offsetHeight;
    const viewportHeight = window.innerHeight;
    const readableHeight = Math.max(articleHeight - viewportHeight * 0.65, 1);
    const current = window.scrollY - articleTop;
    const percent = Math.min(Math.max(current / readableHeight, 0), 1) * 100;
    progress.style.width = `${percent}%`;
  }

  function updateBackToTop() {
    if (!backToTop) return;
    const visible = window.scrollY > window.innerHeight * 0.8;
    backToTop.classList.toggle("opacity-0", !visible);
    backToTop.classList.toggle("pointer-events-none", !visible);
    backToTop.classList.toggle("translate-y-2", !visible);
  }

  function enhanceArticleLinks() {
    if (!article) return;

    article.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        link.dataset.externalLink = "true";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    });
  }

  function enhanceCodeBlocks() {
    if (!article) return;

    const parseHighlightedLines = (value: string) => {
      const lines = new Set<number>();
      value.split(",").forEach((part) => {
        const [start, end = start] = part.split("-").map(Number);
        if (!Number.isFinite(start) || !Number.isFinite(end)) return;
        for (let line = start; line <= end; line += 1) lines.add(line);
      });
      return lines;
    };

    const copyText = async (value: string) => {
      if (!window.navigator.clipboard?.writeText)
        throw new Error("Copy is unavailable");
      await window.navigator.clipboard.writeText(value);
    };

    article.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".code-copy-button")) return;
      const code = pre.querySelector("code");
      if (!code?.textContent) return;

      const meta = code.dataset.codeMeta ?? pre.dataset.codeMeta ?? "";
      const filename = meta.match(/(?:title|filename)=["']([^"']+)["']/)?.[1];
      const highlightExpression = meta.match(/\{([\d,\s-]+)\}/)?.[1] ?? "";
      const showLineNumbers =
        /(?:^|\s)(?:lineNumbers|showLineNumbers)(?:\s|$)/i.test(meta);
      const forceCollapse = /(?:^|\s)collapse(?:\s|$)/i.test(meta);
      const languageClass = Array.from(code.classList).find((className) =>
        className.startsWith("language-"),
      );

      const toolbar = document.createElement("div");
      toolbar.className = "code-toolbar";
      const identity = document.createElement("span");
      identity.className = "code-identity";
      if (filename) {
        const filenameLabel = document.createElement("span");
        filenameLabel.className = "code-filename";
        filenameLabel.textContent = filename;
        identity.append(filenameLabel);
      }
      if (languageClass) {
        const language = document.createElement("span");
        language.className = "code-language";
        language.textContent = languageClass.replace("language-", "");
        identity.append(language);
      }
      toolbar.append(identity);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "复制代码");
      button.addEventListener("click", async () => {
        try {
          await copyText(code.textContent ?? "");
          button.dataset.state = "success";
          button.textContent = "Copied";
        } catch {
          button.dataset.state = "error";
          button.textContent = "复制失败";
        }
        setTimeout(() => {
          button.textContent = "Copy";
          delete button.dataset.state;
        }, 1600);
      });
      toolbar.append(button);
      pre.prepend(toolbar);

      const lines = Array.from(code.querySelectorAll<HTMLElement>(".line"));
      if (showLineNumbers && lines.length > 0)
        pre.classList.add("code-with-lines");
      const highlightedLines = parseHighlightedLines(highlightExpression);
      lines.forEach((line, index) => {
        if (highlightedLines.has(index + 1))
          line.classList.add("is-highlighted");
      });

      if ((forceCollapse || lines.length > 24) && lines.length > 0) {
        pre.classList.add("is-collapsible");
        const foldButton = document.createElement("button");
        foldButton.type = "button";
        foldButton.className = "code-fold-button";
        foldButton.textContent = `展开 ${lines.length} 行代码`;
        foldButton.setAttribute("aria-expanded", "false");
        foldButton.addEventListener("click", () => {
          const expanded = pre.classList.toggle("is-expanded");
          foldButton.setAttribute("aria-expanded", String(expanded));
          foldButton.textContent = expanded
            ? "收起代码"
            : `展开 ${lines.length} 行代码`;
        });
        pre.append(foldButton);
      }
    });
  }

  function enhanceArticleImages() {
    if (!article) return;
    const lightbox = document.querySelector<HTMLDialogElement>(
      "[data-image-lightbox]",
    );
    const preview = lightbox?.querySelector<HTMLImageElement>(
      "[data-lightbox-image]",
    );
    const caption = lightbox?.querySelector<HTMLElement>(
      "[data-lightbox-caption]",
    );

    const openImage = (image: HTMLImageElement) => {
      if (!lightbox || !preview || !caption) return;
      preview.src = image.currentSrc || image.src;
      preview.alt = image.alt;
      caption.textContent =
        image.closest("figure")?.querySelector("figcaption")?.textContent ??
        image.alt;
      lightbox.showModal();
    };

    article.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
      image.loading = "lazy";
      image.decoding = "async";
      const setIntrinsicDimensions = () => {
        if (!image.hasAttribute("width") && image.naturalWidth)
          image.width = image.naturalWidth;
        if (!image.hasAttribute("height") && image.naturalHeight)
          image.height = image.naturalHeight;
      };
      if (image.complete) setIntrinsicDimensions();
      else
        image.addEventListener("load", setIntrinsicDimensions, { once: true });

      const parent = image.parentElement;
      if (parent?.matches("[data-article-image]")) {
        parent.addEventListener("click", () => openImage(image));
        return;
      }
      if (!parent || parent.tagName !== "P" || parent.children.length !== 1)
        return;

      const figure = document.createElement("figure");
      figure.className = "article-figure";
      const zoomButton = document.createElement("button");
      zoomButton.type = "button";
      zoomButton.className = "article-image-button";
      zoomButton.setAttribute(
        "aria-label",
        `放大图片：${image.alt || "文章图片"}`,
      );
      parent.before(figure);
      zoomButton.append(image);
      figure.append(zoomButton);
      if (image.alt) {
        const figureCaption = document.createElement("figcaption");
        figureCaption.textContent = image.alt;
        figure.append(figureCaption);
      }
      parent.remove();

      zoomButton.addEventListener("click", () => openImage(image));
    });

    lightbox
      ?.querySelector("[data-lightbox-close]")
      ?.addEventListener("click", () => lightbox.close());
    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }

  function setupArticleActions() {
    const shareButton = document.querySelector<HTMLButtonElement>(
      "[data-share-article]",
    );
    const copyButton =
      document.querySelector<HTMLButtonElement>("[data-copy-link]");
    const status = document.querySelector<HTMLElement>("[data-action-status]");
    let statusTimer: number | undefined;
    const announce = (message: string) => {
      if (!status) return;
      status.textContent = message;
      window.clearTimeout(statusTimer);
      statusTimer = window.setTimeout(() => (status.textContent = ""), 2200);
    };
    const copyUrl = async () => {
      try {
        await window.navigator.clipboard.writeText(window.location.href);
        announce("链接已复制");
      } catch {
        announce("复制失败，请从地址栏复制");
      }
    };

    copyButton?.addEventListener("click", copyUrl);
    if (!window.navigator.share) shareButton?.setAttribute("hidden", "");
    shareButton?.addEventListener("click", async () => {
      try {
        await window.navigator.share({
          title: document.title,
          text: document.querySelector<HTMLMetaElement>(
            'meta[name="description"]',
          )?.content,
          url: window.location.href,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        await copyUrl();
      }
    });
  }

  function enhanceTablesAndHeadings() {
    if (!article) return;

    article.querySelectorAll("table").forEach((table) => {
      if (table.parentElement?.classList.contains("table-scroll")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "table-scroll";
      wrapper.tabIndex = 0;
      wrapper.setAttribute("role", "region");
      wrapper.setAttribute("aria-label", "可横向滚动的数据表格");
      table.before(wrapper);
      wrapper.append(table);
    });

    article
      .querySelectorAll<HTMLElement>("h1[id], h2[id], h3[id]")
      .forEach((heading) => {
        if (heading.querySelector(".heading-anchor")) return;
        const anchor = document.createElement("a");
        anchor.className = "heading-anchor";
        anchor.href = `#${heading.id}`;
        anchor.textContent = "#";
        anchor.setAttribute(
          "aria-label",
          `链接到“${heading.textContent?.trim() ?? "本节"}”`,
        );
        heading.append(anchor);
      });
  }

  window.addEventListener("scroll", () => {
    updateReadingProgress();
    updateBackToTop();
  });
  window.addEventListener("resize", updateReadingProgress);
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  enhanceArticleLinks();
  enhanceCodeBlocks();
  enhanceArticleImages();
  enhanceTablesAndHeadings();
  setupArticleActions();
  updateReadingProgress();
  updateBackToTop();
}
