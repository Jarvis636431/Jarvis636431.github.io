import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeGithubAlert from "rehype-github-alert";
import rehypeKatex from "rehype-katex";
import rehypeMermaid from "rehype-mermaid";

// Shared syntax extensions. Each renderer still owns its HTML trust boundary.
export const remarkPlugins = [remarkGfm, remarkMath];
export const rehypePlugins = [
  rehypeGithubAlert,
  rehypeKatex,
  /** @type {[typeof rehypeMermaid, { strategy: "pre-mermaid" }]} */ ([
    rehypeMermaid,
    { strategy: "pre-mermaid" },
  ]),
];
