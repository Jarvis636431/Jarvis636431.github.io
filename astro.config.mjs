// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";
import remarkGfm from "remark-gfm";

const SITE_URL = "https://jarvis636431.github.io";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
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
    syntaxHighlight: "shiki",
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
    shikiConfig: {
      wrap: true,
      theme: "github-dark",
    },
    smartypants: true,
  },
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    resolve: {
      alias: {
        "@components": "/src/components",
        "@layouts": "/src/layouts",
        "@pages": "/src/pages",
        "@assets": "/src/assets",
        "@content": "/src/content",
        "@styles": "/src/styles",
      },
    },
  },
});
