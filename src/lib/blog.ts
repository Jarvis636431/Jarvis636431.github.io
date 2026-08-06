import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

const hasAnyTag = (tags: string[], candidates: string[]) =>
  candidates.some((candidate) => tags.includes(candidate));

export function getBlogCategory(tags: string[]) {
  if (hasAnyTag(tags, ["面经", "实习", "产品"])) return "面经";
  if (hasAnyTag(tags, ["Swanlab", "周报"])) return "周报";
  if (hasAnyTag(tags, ["iDesignLab", "项目文档", "项目实践", "博客"]))
    return "项目记录";
  if (
    hasAnyTag(tags, [
      "AI/算法",
      "算法",
      "强化学习",
      "RAG",
      "搜广推",
      "语音信息处理",
      "论文导读",
    ])
  )
    return "AI 与算法";
  if (hasAnyTag(tags, ["SQL", "数据库"])) return "数据库";
  if (
    hasAnyTag(tags, [
      "前端",
      "HTML/CSS/JS",
      "React",
      "Vue",
      "工程化",
      "浏览器",
      "Web API",
      "计算机网络",
      "跨平台",
      "架构设计",
    ])
  )
    return "前端";
  return "其他";
}

const GENERIC_TAGS = new Set(["技术笔记", "学习路线"]);

export function scoreRelatedPost(current: BlogPost, candidate: BlogPost) {
  const currentCategory = getBlogCategory(current.data.tags);
  const candidateCategory = getBlogCategory(candidate.data.tags);
  let score = currentCategory === candidateCategory ? 6 : 0;

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
