/** Render diagrams only when present; retain readable source on failure. */
export async function renderMermaid(
  root: Document = document,
  loadMermaid = () => import("mermaid"),
) {
  const blocks = Array.from(
    root.querySelectorAll<HTMLElement>(
      ".prose pre > code.language-mermaid, .markdown-body pre > code.language-mermaid",
    ),
  ).filter((code) => !code.parentElement?.dataset.mermaidState);
  if (!blocks.length) return;

  for (const code of blocks) {
    code.parentElement!.dataset.mermaidState = "loading";
  }

  const showSource = (code: HTMLElement) => {
    const pre = code.parentElement!;
    pre.dataset.mermaidState = "error";
    const status = root.createElement("span");
    status.className = "mermaid-status";
    status.setAttribute("role", "status");
    status.textContent = "Diagram unavailable. Source shown below.";
    pre.prepend(status);
  };

  try {
    // Pages without diagrams never download the Mermaid renderer.
    const { default: mermaid } = await loadMermaid();
    await root.fonts.ready;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      htmlLabels: false,
      theme: "base",
      fontFamily: '"Noto Sans SC", system-ui, sans-serif',
      themeVariables: {
        primaryColor: "#eef4f2",
        primaryTextColor: "#1f1f1f",
        primaryBorderColor: "#2f6f6d",
        lineColor: "#6b6b6b",
        secondaryColor: "#f6f4ef",
        tertiaryColor: "#ffffff",
        background: "#f6f4ef",
      },
    });
    for (const [index, code] of blocks.entries()) {
      const pre = code.parentElement!;
      try {
        const { svg } = await mermaid.render(
          `mermaid-diagram-${index}`,
          code.textContent ?? "",
        );
        pre.innerHTML = svg;
        pre.classList.add("mermaid-diagram");
        pre.dataset.mermaidState = "rendered";
        pre.tabIndex = 0;
        pre.setAttribute("role", "region");
        pre.setAttribute(
          "aria-label",
          "Diagram; scroll horizontally if needed",
        );
        const diagram = pre.querySelector("svg");
        const width = diagram?.viewBox.baseVal.width;
        if (diagram && width) {
          diagram.style.width = `${width}px`;
          diagram.style.maxWidth = "none";
        }
      } catch {
        showSource(code);
      }
    }
  } catch {
    blocks.forEach(showSource);
  }
}
