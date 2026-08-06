import { defineCollection, z } from "astro:content";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().min(10),
    commentId: z.string().min(1),
    language: z.string().min(2).default("zh-CN"),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string().min(10),
    language: z.string().min(2).default("zh-CN"),
    status: z.enum(["in-progress", "launched", "archived"]).default("launched"),
    roles: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    externalUrl: optionalUrl,
    coverImage: z.string().optional(),
  }),
});

export const collections = {
  blog,
  projects,
};
