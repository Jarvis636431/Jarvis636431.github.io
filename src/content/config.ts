import { defineCollection, z } from "astro:content";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    description: z.string().min(10),
    descriptionEn: z.string().optional(),
    commentId: z.string().min(1),
    language: z.string().min(2).default("zh-CN"),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    series: z.string().min(1).optional(),
    seriesOrder: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    summary: z.string().min(10),
    summaryEn: z.string().optional(),
    language: z.string().min(2).default("zh-CN"),
    status: z.enum(["in-progress", "launched", "archived"]).default("launched"),
    roles: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    externalUrl: optionalUrl,
    githubUrl: optionalUrl.refine((value) => {
      if (!value) return true;
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        url.hostname === "github.com" &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash &&
        /^\/[\w.-]+\/[\w.-]+\/?$/.test(url.pathname)
      );
    }, "Use a GitHub repository URL: https://github.com/owner/repository"),
    coverImage: z.string().optional(),
  }),
});

export const collections = {
  blog,
  projects,
};
