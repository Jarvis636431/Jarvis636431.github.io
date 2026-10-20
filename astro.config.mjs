// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeGithubAlert from "rehype-github-alert";
import remarkCodeMeta from "./src/lib/remark-code-meta.mjs";

import { siteConfig } from "./src/config/site.mjs";

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  base: "/",
  trailingSlash: "never",
  integrations: [
    mdx(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
        },
      ],
      sitemap: true,
      host: true,
    }),
  ],
  build: {
    assets: "_assets",
    format: "file",
    inlineStylesheets: "auto",
  },
  markdown: {
    syntaxHighlight: { type: "shiki", excludeLangs: ["mermaid"] },
    remarkPlugins: [remarkGfm, remarkMath, remarkCodeMeta],
    rehypePlugins: [rehypeGithubAlert, rehypeKatex],
    shikiConfig: {
      wrap: true,
      theme: "github-dark",
      transformers: [
        {
          name: "preserve-code-meta",
          pre(node) {
            const meta = this.options.meta?.__raw;
            if (typeof meta === "string" && meta.trim()) {
              node.properties["data-code-meta"] = meta;
            }
          },
        },
      ],
    },
    smartypants: true,
  },
  server: {
    host: true,
    port: 4321,
  },
});
