import { getCollection } from "astro:content";

export async function GET() {
    const posts = await getCollection("blog", ({ data }) => {
        return import.meta.env.DEV ? true : data.draft !== true;
    });

    const projects = await getCollection("projects", ({ data }) => {
        return import.meta.env.DEV ? true : data.status !== "archived";
    });

    const searchIndex = [
        ...posts.map((post) => ({
            title: post.data.title,
            description: post.data.description,
            slug: `/blogs/${post.slug}`,
            tags: post.data.tags,
            collection: "blog",
            date: post.data.publishDate,
        })),
        ...projects.map((project) => ({
            title: project.data.title,
            description: project.data.summary,
            slug: `/projects/${project.slug}`,
            tags: project.data.stack,
            collection: "project",
            date: project.data.publishDate,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return new Response(JSON.stringify(searchIndex), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
