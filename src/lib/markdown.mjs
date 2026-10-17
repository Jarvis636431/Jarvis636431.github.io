import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeGithubAlert from "rehype-github-alert";
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
  // Sanitize author HTML before plugins generate trusted icons and math markup.
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [["className", /^language-./, "math-inline", "math-display"]],
    },
  })
  .use(rehypeGithubAlert)
  .use(rehypeKatex)
  .use(rehypeStringify);

/** Render external Markdown with GitHub-style HTML sanitization.
 * @param {string} content
 */
export async function renderMarkdown(content) {
  return String(await processor.process(content));
}

/** Extract searchable text at build time; never ship the Markdown parser to clients.
 * @param {string} content
 */
export function getSearchText(content) {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .parse(content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ""));
  const parts = [];
  const visit = (node) => {
    if (node.type === "html" || node.type === "definition") return;
    if (node.type === "image" || node.type === "imageReference") {
      if (node.alt) parts.push(node.alt);
    } else if (
      ["text", "inlineCode", "code", "math", "inlineMath"].includes(node.type)
    ) {
      parts.push(node.value);
    } else {
      node.children?.forEach(visit);
    }
  };
  visit(tree);
  return parts
    .join(" ")
    .replace(/\[!(?:NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
