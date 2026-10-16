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

// Load Astro's content API only when querying, keeping selection rules reusable.
export async function getPosts({ includeDrafts = import.meta.env.DEV } = {}) {
  const { getCollection } = await import("astro:content");
  return selectPosts(await getCollection("blog"), { includeDrafts });
}

export async function getProjects({
  includeArchived = import.meta.env.DEV,
  featuredOnly = false,
} = {}) {
  const { getCollection } = await import("astro:content");
  return selectProjects(await getCollection("projects"), {
    includeArchived,
    featuredOnly,
  });
}

export async function getRecentPosts(limit = 3) {
  return (await getPosts()).slice(0, limit);
}

/** Featured sections always exclude archived projects, including in development. */
export async function getFeaturedProjects(limit?: number) {
  const projects = await getProjects({
    includeArchived: false,
    featuredOnly: true,
  });
  return projects.slice(0, limit);
}
