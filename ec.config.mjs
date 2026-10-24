// @ts-check
import { defineEcConfig } from "astro-expressive-code";
import { h } from "astro-expressive-code/hast";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";

export default defineEcConfig({
  themes: ["github-dark"],
  defaultProps: {
    wrap: true,
    showLineNumbers: false,
    collapseStyle: "collapsible-auto",
  },
  styleOverrides: {
    borderRadius: "0.5rem",
    codeFontFamily: "var(--font-mono)",
    codeFontSize: "0.8125rem",
    codeLineHeight: "1.7",
  },
  shiki: { langAlias: { mermaid: "text" } },
  plugins: [
    {
      name: "Site code defaults",
      hooks: {
        preprocessMetadata({ codeBlock }) {
          if (codeBlock.language === "mermaid") return;
          const lineCount = codeBlock.getLines().length;
          if (
            lineCount > 24 &&
            !codeBlock.metaOptions.getRanges("collapse").length
          ) {
            codeBlock.props.collapse ??= `25-${lineCount}`;
          }
        },
        // Keep diagrams as plaintext for the existing lazy Mermaid renderer.
        postprocessRenderedBlockGroup({ renderedGroupContents, renderData }) {
          const block = renderedGroupContents[0]?.codeBlock;
          if (
            renderedGroupContents.length === 1 &&
            block?.language === "mermaid"
          ) {
            renderData.groupAst = h("div", [
              h("pre", [
                h("code", { className: ["language-mermaid"] }, block.code),
              ]),
            ]);
          }
        },
      },
    },
    pluginLineNumbers(),
    pluginCollapsibleSections(),
  ],
});
