import { readdir } from "node:fs/promises";
import { URL } from "node:url";

export async function articlesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const articles = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      articles.push(
        ...(await articlesIn(new URL(`${entry.name}/`, directory))),
      );
    } else if (/\.mdx?$/.test(entry.name)) {
      articles.push(new URL(entry.name, directory));
    }
  }
  return articles;
}
