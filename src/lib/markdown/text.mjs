import { unified } from "unified";
import remarkParse from "remark-parse";
import { remarkPlugins } from "./plugins.mjs";

/** Extract searchable text at build time; never ship the Markdown parser to clients.
 * @param {string} content
 */
export function getSearchText(content) {
  const tree = unified()
    .use(remarkParse)
    .use(remarkPlugins)
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
