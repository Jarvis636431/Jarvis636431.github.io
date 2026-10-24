// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import robotsTxt from "astro-robots-txt";
import { remarkPlugins, rehypePlugins } from "./src/lib/markdown/plugins.mjs";

import { siteConfig } from "./src/config/site.mjs";

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  base: "/",
  trailingSlash: "never",
  integrations: [
    expressiveCode(),
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
    syntaxHighlight: false,
    remarkPlugins,
    rehypePlugins,
    smartypants: true,
  },
  server: {
    host: true,
    port: 4321,
  },
});
