import Fuse, { type FuseResult, type RangeTuple } from "fuse.js";

export interface SearchItem {
  title: string;
  description: string;
  alternateTitles: string[];
  alternateDescriptions: string[];
  aliases: string[];
  body: string;
  slug: string;
  tags: string[];
  category: string;
  collection: "blog" | "project";
  date: string;
}

/** Keep display names consistent with pages while indexing both languages. */
export function getSearchMetadata(
  data: {
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    aliases?: string[];
  },
  preferEnglish = false,
) {
  const title = preferEnglish ? (data.titleEn ?? data.title) : data.title;
  const description = preferEnglish
    ? (data.descriptionEn ?? data.description)
    : data.description;
  return {
    title,
    description,
    alternateTitles: [
      ...new Set(
        [data.title, data.titleEn].filter(
          (value): value is string => Boolean(value) && value !== title,
        ),
      ),
    ],
    alternateDescriptions: [
      ...new Set(
        [data.description, data.descriptionEn].filter(
          (value): value is string => Boolean(value) && value !== description,
        ),
      ),
    ],
    aliases: [
      ...new Set(
        (data.aliases ?? []).map((value) => value.trim()).filter(Boolean),
      ),
    ],
  };
}

export function createSearch(items: SearchItem[]) {
  return new Fuse(items, {
    keys: [
      { name: "title", weight: 0.3 },
      { name: "alternateTitles", weight: 0.2 },
      { name: "aliases", weight: 0.15 },
      { name: "description", weight: 0.1 },
      { name: "alternateDescriptions", weight: 0.05 },
      { name: "tags", weight: 0.075 },
      { name: "category", weight: 0.025 },
      { name: "body", weight: 0.1 },
    ],
    // Full-text matches must not depend on distance from the article's start.
    ignoreLocation: true,
    ignoreFieldNorm: true,
    threshold: 0.25,
    includeMatches: true,
  });
}

/** Show context around the matching passage instead of always showing the summary. */
export function getSearchExcerpt(
  result: FuseResult<SearchItem>,
  query: string,
  maxLength = 160,
): { text: string; ranges: RangeTuple[] } {
  const bodyMatch = result.matches?.find((match) => match.key === "body");
  const match =
    bodyMatch ??
    result.matches?.find((match) => match.key === "description") ??
    result.matches?.find((match) => match.key === "alternateDescriptions");
  const source = bodyMatch
    ? result.item.body
    : match?.key === "alternateDescriptions"
      ? (match.value ?? result.item.description)
      : result.item.description;
  const exactIndex = source.toLowerCase().indexOf(query.trim().toLowerCase());
  // Fuse can return isolated character matches before the meaningful fuzzy match.
  const strongestRange = match?.indices.reduce<RangeTuple | undefined>(
    (best, range) =>
      !best || range[1] - range[0] > best[1] - best[0] ? range : best,
    undefined,
  );
  const anchor = exactIndex >= 0 ? exactIndex : (strongestRange?.[0] ?? 0);
  let start = Math.max(0, Math.min(anchor - 40, source.length - maxLength));
  let end = Math.min(source.length, start + maxLength);
  // Do not split UTF-16 surrogate pairs when cutting a passage.
  if (start > 0 && /[\uDC00-\uDFFF]/.test(source[start] ?? "")) start -= 1;
  if (end < source.length && /[\uDC00-\uDFFF]/.test(source[end] ?? ""))
    end += 1;
  const prefix = start > 0 ? "…" : "";
  const ranges: RangeTuple[] = [];
  const indices: readonly RangeTuple[] =
    exactIndex >= 0 && query.trim()
      ? [[exactIndex, exactIndex + query.trim().length - 1]]
      : (match?.indices ?? []);
  for (const [from, to] of indices) {
    if (to < start || from >= end) continue;
    ranges.push([
      Math.max(from, start) - start + prefix.length,
      Math.min(to, end - 1) - start + prefix.length,
    ]);
  }
  return {
    text: prefix + source.slice(start, end) + (end < source.length ? "…" : ""),
    ranges,
  };
}
