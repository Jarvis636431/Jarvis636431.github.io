import assert from "node:assert/strict";
import test from "node:test";
import { URL } from "node:url";
import { siteConfig } from "../src/config/site.mjs";
import { getPageSeo } from "../src/lib/seo.ts";

test("pages without custom images still have complete sharing metadata", () => {
  const page = getPageSeo({
    pathname: "/",
    title: "Home",
    description: "Welcome",
  });
  assert.equal(page.canonical, `${siteConfig.url}/`);
  assert.equal(page.openGraph.basic.title, "Home");
  assert.equal(page.openGraph.optional.description, "Welcome");
  assert.equal(page.openGraph.optional.siteName, siteConfig.name);
  assert.equal(
    page.openGraph.basic.image,
    new URL(siteConfig.image.src, siteConfig.url).href,
  );
  assert.equal(page.twitter.image, page.openGraph.basic.image);
  assert.equal(page.twitter.imageAlt, siteConfig.image.alt);
  assert.equal(page.twitter.card, "summary");
});

test("article overrides preserve canonical URLs, images, dates and Twitter settings", () => {
  const seo = {
    canonical: "/writing/example",
    type: "article",
    image: { src: "/assets/cover.png", alt: "Cover" },
    publishedTime: "2026-10-20T00:00:00Z",
    modifiedTime: "2026-10-21T00:00:00Z",
    tags: ["Astro"],
    twitter: { title: "Twitter title", card: "summary" },
  };
  const page = getPageSeo({
    pathname: "/blogs/example",
    siteUrl: "https://preview.example.com",
    title: "Article",
    seo,
  });
  assert.equal(page.canonical, "https://preview.example.com/writing/example");
  assert.equal(page.openGraph.basic.type, "article");
  assert.equal(
    page.openGraph.basic.image,
    "https://preview.example.com/assets/cover.png",
  );
  assert.deepEqual(page.openGraph.article, {
    publishedTime: seo.publishedTime,
    modifiedTime: seo.modifiedTime,
    tags: ["Astro"],
  });
  assert.equal(page.twitter.imageAlt, "Cover");
  assert.equal(page.twitter.title, "Twitter title");
  assert.equal(page.twitter.card, "summary");
  assert.equal(seo.canonical, "/writing/example");
});

test("absolute share URLs stay intact and article metadata does not leak between calls", () => {
  const article = getPageSeo({
    pathname: "/article",
    seo: {
      type: "article",
      publishedTime: "2026-10-20",
      image: { src: "https://images.example.com/cover.png" },
    },
  });
  assert.equal(
    article.openGraph.basic.image,
    "https://images.example.com/cover.png",
  );
  assert.equal(article.twitter.card, "summary_large_image");
  const page = getPageSeo({ pathname: "/about" });
  assert.equal(page.openGraph.article, undefined);
  assert.equal(page.openGraph.basic.type, "website");
  assert.equal(page.openGraph.basic.title, siteConfig.title);
});
