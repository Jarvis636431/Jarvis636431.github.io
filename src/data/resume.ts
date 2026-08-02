export interface ResumeExperience {
  period: string;
  role: string;
  organization: string;
  location?: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface ResumeProject {
  name: string;
  role: string;
  description: string;
  href: string;
  stack: string[];
  external?: boolean;
}

export const resumeProfile = {
  name: "Jarvis",
  title: "Software Engineer at JD.com",
  location: "北京，中国",
  email: "mengda636431@gmail.com",
  website: "https://jarvis636431.github.io/",
  github: "https://github.com/Jarvis636431",
  summary:
    "现任京东软件工程师，拥有天津大学学习与校园技术团队实践经历。关注 AI 原生软件、跨端系统和开发者工具，擅长从产品交互出发完成前端、跨平台及全栈工程落地。",
  focus: ["AI Agent 与 LLM 应用", "跨端应用工程", "开发者体验与开源工具"],
  updatedAt: "2026-08",
};

export const resumeExperiences: ResumeExperience[] = [
  {
    period: "2026 — 至今",
    role: "Software Engineer",
    organization: "JD.com",
    location: "北京",
    summary:
      "围绕 AI Agent、LLM 应用、跨端工程与开发者体验持续实践，关注软件从原型到可维护产品的完整交付过程。",
    highlights: [
      "关注模块化、可观测和可演进的 Agent 应用架构。",
      "持续参与跨端框架与开源工具生态，重视工程效率和使用体验。",
    ],
    stack: ["TypeScript", "React", "AI Agents", "Cross-platform"],
  },
  {
    period: "2025",
    role: "Frontend Developer",
    organization: "Tenio · 天津大学",
    summary:
      "参与面向建筑设计场景的 AI 辅助系统，连接对话式交互、生成结果和三维空间预览。",
    highlights: [
      "构建核心前端界面和复杂状态流转，维护一致的交互与视觉语言。",
      "使用 Three.js 承载三维方案预览，并配合后端及模型服务调试数据结构。",
    ],
    stack: ["React", "TypeScript", "Three.js", "Tailwind CSS"],
  },
  {
    period: "2023 — 2024",
    role: "Full-stack Developer",
    organization: "iDesignLab · 天津大学",
    summary:
      "设计并实现工业设计实验室预约平台，将资源、权限、审批、签到和审计流程整合到统一系统。",
    highlights: [
      "实现 Vue 管理端、微信入口与 Go 服务端的完整业务链路。",
      "围绕预约冲突、角色权限、操作留痕和容器化部署设计系统能力。",
    ],
    stack: ["Vue 3", "Go", "Gin", "MariaDB", "Docker", "Nginx"],
  },
  {
    period: "2022",
    role: "Cross-platform Developer",
    organization: "天外天工作室 · 天津大学",
    summary:
      "参与微北洋校园应用的 Flutter 跨平台开发，为天津大学师生提供统一的校园服务入口。",
    highlights: [
      "参与课程、学业、消息及校园服务等模块的移动端工程实践。",
      "通过公共基础模块统一网络、缓存、主题和多端交付能力。",
    ],
    stack: ["Flutter", "Dart", "Android", "iOS"],
  },
];

export const resumeProjects: ResumeProject[] = [
  {
    name: "iDesignLab",
    role: "全栈开发",
    description:
      "实验室资源预约与运营平台，覆盖配置化时段、权限审批、签到完结、通知和数据报表。",
    href: "/projects/idesignlab",
    stack: ["Vue 3", "Go", "MariaDB", "Docker"],
  },
  {
    name: "微北洋",
    role: "跨平台开发",
    description:
      "由天外天工作室维护的天津大学校园应用，聚合课表、自习室、GPA、消息和校园社区能力。",
    href: "https://github.com/twtstudio/WePeiYang-Flutter",
    stack: ["Flutter", "Dart", "Mobile"],
    external: true,
  },
  {
    name: "Tenio",
    role: "前端开发与交互实现",
    description:
      "面向建筑设计的 AI 辅助系统，探索对话式需求输入、生成方案和三维预览的协作流程。",
    href: "/projects/tenio",
    stack: ["React", "TypeScript", "Three.js"],
  },
];

export const resumeSkills = [
  {
    label: "Frontend",
    items: ["TypeScript", "React", "Vue", "Next.js", "Astro", "Tailwind CSS"],
  },
  {
    label: "Cross-platform",
    items: ["Taro", "Flutter", "Dart", "小程序", "H5"],
  },
  {
    label: "Backend & Delivery",
    items: ["Go", "Gin", "MariaDB", "Docker", "Nginx", "GitHub Actions"],
  },
  {
    label: "Creative & AI",
    items: ["AI Agents", "LLM Applications", "Three.js", "Figma"],
  },
];

export const openSourceFocus = [
  {
    name: "Taro",
    href: "https://github.com/NervJS/taro",
    description:
      "支持 React、Vue、小程序、H5 与 React Native 等平台的开放式跨端框架。",
  },
  {
    name: "OxyGent",
    href: "https://github.com/jd-opensource/OxyGent",
    description: "强调模块化、可观测性与可演进性的开源多 Agent 框架。",
  },
];
