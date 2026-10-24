import { URL } from "node:url";
import { createRequire } from "node:module";
import config from "../../astro.config.mjs";

const requireFromAstro = createRequire(import.meta.resolve("astro"));
const { createMarkdownProcessor } = await import(
  requireFromAstro.resolve("@astrojs/markdown-remark")
);

// Run the integration hook so tests exercise the same code renderer as Astro.
export async function createArticleProcessor() {
  let markdown = { ...config.markdown };
  await config.integrations
    .find((integration) => integration.name === "astro-expressive-code")
    .hooks["astro:config:setup"]({
      command: "build",
      config: {
        ...config,
        root: new URL("../../", import.meta.url),
        srcDir: new URL("../../src/", import.meta.url),
      },
      addWatchFile() {},
      updateConfig(update) {
        markdown = {
          ...markdown,
          ...update.markdown,
          rehypePlugins: [
            ...markdown.rehypePlugins,
            ...update.markdown.rehypePlugins,
          ],
        };
      },
    });
  return createMarkdownProcessor(markdown);
}
