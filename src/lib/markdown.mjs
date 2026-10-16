import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  // Sanitize author HTML before generating KaTeX's trusted markup.
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [["className", /^language-./, "math-inline", "math-display"]],
    },
  })
  .use(rehypeKatex)
  .use(rehypeStringify);

/** Render external Markdown with GitHub-style HTML sanitization.
 * @param {string} content
 */
export async function renderMarkdown(content) {
  return String(await processor.process(content));
}
