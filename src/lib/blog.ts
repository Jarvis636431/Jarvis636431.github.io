import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

const CJK_RE = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
const WORD_RE = /[a-zA-Z0-9]+(?:['’-][a-zA-Z0-9]+)*/g;

/** Estimate reading time for mixed Chinese/English Markdown content. */
export function getReadingTime(content: string) {
  const readableContent = content
    .replace(/^---[\s\S]*?---/m, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|=-]/g, " ");

  const cjkCharacters = readableContent.match(CJK_RE)?.length ?? 0;
  const latinWords =
    readableContent.replace(CJK_RE, " ").match(WORD_RE)?.length ?? 0;

  // Average reading speeds: roughly 300 CJK characters or 200 words/minute.
  return Math.max(1, Math.ceil(cjkCharacters / 300 + latinWords / 200));
}

export function getPostReadingTime(post: BlogPost) {
  return getReadingTime(post.body);
}

export function getSeriesPosts(current: BlogPost, posts: BlogPost[]) {
  if (!current.data.series) return [];

  return posts
    .filter((post) => post.data.series === current.data.series)
    .slice()
    .sort((a, b) => {
      const orderDifference =
        (a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER);
      if (orderDifference !== 0) return orderDifference;
      return a.data.publishDate.getTime() - b.data.publishDate.getTime();
    });
}

export function getAdjacentPosts(current: BlogPost, posts: BlogPost[]) {
  const seriesPosts = getSeriesPosts(current, posts);
  if (seriesPosts.length > 1) {
    const index = seriesPosts.findIndex((post) => post.slug === current.slug);
    return {
      previous: index > 0 ? seriesPosts[index - 1] : undefined,
      next: index < seriesPosts.length - 1 ? seriesPosts[index + 1] : undefined,
      isSeries: true,
    };
  }

  const chronologicalPosts = posts
    .slice()
    .sort(
      (a, b) => a.data.publishDate.getTime() - b.data.publishDate.getTime(),
    );
  const index = chronologicalPosts.findIndex(
    (post) => post.slug === current.slug,
  );
  return {
    previous: index > 0 ? chronologicalPosts[index - 1] : undefined,
    next:
      index >= 0 && index < chronologicalPosts.length - 1
        ? chronologicalPosts[index + 1]
        : undefined,
    isSeries: false,
  };
}

/** Use the first folder below src/content/blog as the category.
 * Content IDs preserve folder names even when a post overrides its URL slug.
 * Root-level posts have no folder category.
 */
export function getBlogCategory(post: Pick<BlogPost, "id">): string | null {
  const segments = post.id.split("/");
  return segments.length > 1 ? segments[0] : null;
}

const GENERIC_TAGS = new Set(["技术笔记", "学习路线"]);

export function scoreRelatedPost(current: BlogPost, candidate: BlogPost) {
  const currentCategory = getBlogCategory(current);
  const candidateCategory = getBlogCategory(candidate);
  let score =
    currentCategory !== null && currentCategory === candidateCategory ? 6 : 0;

  const sharedTags = candidate.data.tags.filter(
    (tag) => current.data.tags.includes(tag) && !GENERIC_TAGS.has(tag),
  );
  score += sharedTags.length * 2;

  if (current.data.tags[0] && candidate.data.tags[0] === current.data.tags[0]) {
    score += 3;
  }

  const daysApart =
    Math.abs(
      current.data.publishDate.getTime() - candidate.data.publishDate.getTime(),
    ) / 86_400_000;
  score += Math.max(0, 2 - daysApart / 365);

  return score;
}

/** Rank related posts using the existing category, tag, and recency score. */
export function getRelatedPosts(
  current: BlogPost,
  posts: BlogPost[],
  limit = 3,
) {
  return posts
    .filter((candidate) => candidate.slug !== current.slug)
    .map((post) => ({ post, score: scoreRelatedPost(current, post) }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.publishDate.getTime() - a.post.data.publishDate.getTime(),
    )
    .slice(0, limit)
    .map(({ post }) => post);
}
