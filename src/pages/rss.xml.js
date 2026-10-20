import { siteConfig } from "@config/site.mjs";
import { getPosts } from "@lib/content";

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export async function GET(context) {
  const posts = await getPosts();

  const site = context.site?.toString() ?? siteConfig.url;
  const siteUrl = site.endsWith("/") ? site.slice(0, -1) : site;
  const items = posts
    .map((post) => {
      const link = `${siteUrl}/blogs/${post.slug}`;
      const categories = post.data.tags
        .map((tag) => `<category>${escapeXml(tag)}</category>`)
        .join("");

      return `
        <item>
          <title>${escapeXml(post.data.title)}</title>
          <description>${escapeXml(post.data.description)}</description>
          <link>${escapeXml(link)}</link>
          <guid>${escapeXml(link)}</guid>
          <pubDate>${new Date(post.data.publishDate).toUTCString()}</pubDate>
          ${categories}
        </item>`;
    })
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.rss.title)}</title>
    <description>${escapeXml(siteConfig.rss.description)}</description>
    <link>${escapeXml(siteUrl)}</link>
    <language>${escapeXml(siteConfig.rss.language)}</language>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
