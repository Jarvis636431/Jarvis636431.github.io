import { getPosts, getProjects } from "../lib/content";

export async function GET() {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);

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
