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
