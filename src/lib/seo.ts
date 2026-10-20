import { siteConfig } from "../config/site.mjs";

type StructuredData = Record<string, unknown> | Record<string, unknown>[];

type TwitterConfig = {
  card?: "summary" | "summary_large_image" | "player" | "app";
  site?: string;
  creator?: string;
  image?: string;
  imageAlt?: string;
  title?: string;
  description?: string;
};

export interface SeoConfig {
  canonical?: string;
  type?: string;
  image?: { src: string; alt?: string };
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  twitter?: TwitterConfig;
  structuredData?: StructuredData;
}

/** Supply complete share metadata even when a page has no custom image. */
export function getPageSeo({
  pathname,
  siteUrl = siteConfig.url,
  title = siteConfig.title,
  description = siteConfig.description,
  seo = {},
}: {
  pathname: string;
  siteUrl?: string;
  title?: string;
  description?: string;
  seo?: SeoConfig;
}) {
  const canonical = new URL(seo.canonical ?? pathname, siteUrl).toString();
  const image = seo.image?.src ? seo.image : siteConfig.image;
  const absoluteImage = new URL(image.src, siteUrl).toString();
  const article: Record<string, string | string[]> = {};
  if (seo.publishedTime) article.publishedTime = seo.publishedTime;
  if (seo.modifiedTime) article.modifiedTime = seo.modifiedTime;
  if (seo.tags?.length) article.tags = seo.tags;

  return {
    canonical,
    openGraph: {
      basic: {
        title,
        type: seo.type ?? "website",
        image: absoluteImage,
        url: canonical,
      },
      optional: { siteName: siteConfig.name, description },
      ...(Object.keys(article).length ? { article } : {}),
    },
    twitter: {
      card: seo.image?.src ? "summary_large_image" : "summary",
      title,
      description,
      image: absoluteImage,
      imageAlt: image.alt ?? title,
      ...seo.twitter,
    } satisfies TwitterConfig,
  };
}
