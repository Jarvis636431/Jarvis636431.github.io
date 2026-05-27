import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("blog", ({ data }) =>
    import.meta.env.DEV ? true : data.draft !== true
  );

  const sortedPosts = posts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.data.publishDate).getTime() -
        new Date(a.data.publishDate).getTime()
    );

  const site = context.site?.toString() ?? "https://jarvishub.com";

  return rss({
    title: "Jarvis Hub – Writing",
    description:
      "Long-form notes on design systems, creative development, and learning in public.",
    site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.publishDate),
      link: `/blogs/${post.slug}`,
      categories: post.data.tags,
    })),
    trailingSlash: false,
    customData: "<language>en-us</language>",
  });
}
