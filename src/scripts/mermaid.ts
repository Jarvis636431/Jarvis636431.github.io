/** Render diagrams only when present; retain readable source on failure. */
export async function renderMermaid(
  root: Document = document,
  loadMermaid = () => import("mermaid"),
) {
  const blocks = Array.from(
    root.querySelectorAll<HTMLElement>(".prose pre.mermaid"),
  ).filter((pre) => !pre.dataset.mermaidState);
  if (!blocks.length) return;

  for (const pre of blocks) {
    pre.dataset.mermaidState = "loading";
  }

  const showSource = (pre: HTMLElement) => {
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
    const styles = root.defaultView!.getComputedStyle(root.documentElement);
    const token = (name: string) => styles.getPropertyValue(name).trim();
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      htmlLabels: false,
      theme: "base",
      fontFamily: token("--font-prose"),
      themeVariables: {
        primaryColor: token("--color-diagram-fill"),
        primaryTextColor: token("--color-primary"),
        primaryBorderColor: token("--color-accent"),
        lineColor: token("--color-secondary"),
        secondaryColor: token("--color-background"),
        tertiaryColor: token("--color-surface"),
        background: token("--color-background"),
      },
    });
    for (const [index, pre] of blocks.entries()) {
      try {
        const { svg } = await mermaid.render(
          `mermaid-diagram-${index}`,
          pre.textContent ?? "",
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
        showSource(pre);
      }
    }
  } catch {
    blocks.forEach(showSource);
  }
}
