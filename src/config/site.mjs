// @ts-check
import { profile } from "./profile.mjs";
import { validateSiteSettings } from "./validate.mjs";

/** Shared by Astro and Node automation; no framework or browser dependencies. */
const name = "Jarvis Hub";
const githubUsername = profile.githubUsername.trim();
const logo = "/logo.png";

export const siteConfig = {
  name,
  title: `${name} - Creative Developer`,
  description: `Personal website of ${profile.name} - crafting web experiences, writing, and sharing experiments in code.`,
  url: "https://jarvis636431.github.io",
  language: "en",
  timeZone: "Asia/Shanghai",
  email: profile.email,
  github: {
    username: githubUsername,
    url: githubUsername ? `https://github.com/${githubUsername}` : undefined,
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
validateSiteSettings(siteConfig);
