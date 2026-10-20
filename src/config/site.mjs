/** Shared by Astro, browser-facing pages and Node automation; no runtime imports. */
const name = "Jarvis Hub";
const githubUsername = "Jarvis636431";
const logo = "/logo.png";

export const siteConfig = {
  name,
  title: `${name} - Creative Developer`,
  description:
    "Personal website of Jarvis - crafting web experiences, writing, and sharing experiments in code.",
  url: "https://jarvis636431.github.io",
  language: "en",
  email: "mengda636431@gmail.com",
  github: {
    username: githubUsername,
    url: `https://github.com/${githubUsername}`,
  },
  image: { src: logo, alt: `${name} logomark` },
  favicon: { src: logo, type: "image/png" },
  navLinks: [
    { href: "/projects", label: "Projects" },
    { href: "/blogs", label: "Blogs" },
    { href: "/resume", label: "Resume" },
    { href: "/about", label: "About Me" },
  ],
  rss: {
    title: `${name} 博客`,
    description: "关于前端工程、产品系统、AI 工具与持续学习的笔记。",
    language: "zh-CN",
  },
};
