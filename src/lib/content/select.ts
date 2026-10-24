import type { CollectionEntry } from "astro:content";

type Post = CollectionEntry<"blog">;
type Project = CollectionEntry<"projects">;

export function byPublishDateDescending(
  a: { data: { publishDate: Date } },
  b: { data: { publishDate: Date } },
) {
  return b.data.publishDate.getTime() - a.data.publishDate.getTime();
}

/** Select public content by default, without mutating collection order. */
export function selectPosts(
  posts: Post[],
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
) {
  return posts
    .filter(({ data }) => includeDrafts || !data.draft)
    .sort(byPublishDateDescending);
}

export function selectProjects(
  projects: Project[],
  {
    includeArchived = false,
    featuredOnly = false,
  }: { includeArchived?: boolean; featuredOnly?: boolean } = {},
) {
  return projects
    .filter(
      ({ data }) =>
        (includeArchived || data.status !== "archived") &&
        (!featuredOnly || data.featured),
    )
    .sort(byPublishDateDescending);
}
