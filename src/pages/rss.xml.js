import { getCollection } from "astro:content";

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export async function GET(context) {
  const posts = await getCollection("blog", ({ data }) =>
    import.meta.env.DEV ? true : data.draft !== true,
  );

  const sortedPosts = posts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.data.publishDate).getTime() -
        new Date(a.data.publishDate).getTime(),
    );

  const site = context.site?.toString() ?? "https://jarvis636431.github.io";
  const siteUrl = site.endsWith("/") ? site.slice(0, -1) : site;
  const items = sortedPosts
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
    <title>Jarvis Hub 博客</title>
    <description>关于前端工程、产品系统、AI 工具与持续学习的笔记。</description>
    <link>${escapeXml(siteUrl)}</link>
    <language>zh-CN</language>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
