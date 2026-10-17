import { getPosts, getProjects } from "@lib/content";
import { getBlogCategory } from "@lib/blog";
import { getSearchText } from "@lib/markdown.mjs";
import { getSearchMetadata, type SearchItem } from "@lib/search";

export async function GET() {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);

  const searchIndex = [
    ...posts.map(
      (post): SearchItem => ({
        ...getSearchMetadata(post.data),
        body: getSearchText(post.body),
        category: getBlogCategory(post) ?? "Uncategorized",
        slug: `/blogs/${post.slug}`,
        tags: post.data.tags,
        collection: "blog",
        date: post.data.publishDate.toISOString(),
      }),
    ),
    ...projects.map(
      (project): SearchItem => ({
        ...getSearchMetadata(
          {
            title: project.data.title,
            titleEn: project.data.titleEn,
            description: project.data.summary,
            descriptionEn: project.data.summaryEn,
            aliases: project.data.aliases,
          },
          true,
        ),
        body: getSearchText(project.body),
        category: "",
        slug: `/projects/${project.slug}`,
        tags: project.data.stack,
        collection: "project",
        date: project.data.publishDate.toISOString(),
      }),
    ),
  ] satisfies SearchItem[];

  searchIndex.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
