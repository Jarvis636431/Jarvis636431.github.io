// @ts-check
import { defineEcConfig } from "astro-expressive-code";
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
  plugins: [
    {
      name: "Site code defaults",
      hooks: {
        preprocessMetadata({ codeBlock }) {
          const lineCount = codeBlock.getLines().length;
          if (
            lineCount > 24 &&
            !codeBlock.metaOptions.getRanges("collapse").length
          ) {
            codeBlock.props.collapse ??= `25-${lineCount}`;
          }
        },
      },
    },
    pluginLineNumbers(),
    pluginCollapsibleSections(),
  ],
});
