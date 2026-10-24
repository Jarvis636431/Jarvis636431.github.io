import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

import { remarkPlugins, rehypePlugins } from "./plugins.mjs";

const processor = unified()
  .use(remarkParse)
  .use(remarkPlugins)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // Sanitize author HTML before plugins generate trusted icons and math markup.
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [["className", /^language-./, "math-inline", "math-display"]],
    },
  })
  .use(rehypePlugins)
  .use(rehypeStringify);

/** Render external Markdown with GitHub-style HTML sanitization.
 * @param {string} content
 */
export async function renderExternalMarkdown(content) {
  return String(await processor.process(content));
}
