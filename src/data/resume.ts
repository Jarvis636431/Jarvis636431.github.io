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
  title: "Software Engineer at Joybuy",
  organization: "Joybuy",
  location: "Beijing, China",
  email: "mengda636431@gmail.com",
  website: "https://jarvis636431.github.io/",
  github: "https://github.com/Jarvis636431",
  summary:
    "Software engineer at Joybuy with a background at Tianjin University and campus technology teams. Focused on AI applications, cross-platform systems, and developer tools, bringing product interactions to life through frontend and full-stack engineering.",
  focus: [
    "AI agents & LLM applications",
    "Cross-platform engineering",
    "Developer experience & open source",
  ],
  updatedAt: "2026-10",
};

export const resumeExperiences: ResumeExperience[] = [
  {
    period: "2026 — Present",
    role: "Software Engineer",
    organization: "Joybuy",
    location: "Beijing",
    summary:
      "Focused on AI agents, LLM applications, cross-platform engineering, and developer experience, from prototypes to maintainable software.",
    highlights: [
      "Explore modular, observable, and extensible architectures for agent applications.",
      "Participate in cross-platform and open-source ecosystems, with an emphasis on engineering efficiency and usability.",
    ],
    stack: ["TypeScript", "React", "AI Agents", "Cross-platform"],
  },
  {
    period: "2025",
    role: "Frontend Developer",
    organization: "Tenio · Tianjin University",
    summary:
      "Contributed to an AI-assisted architectural design system connecting conversational interfaces, generated designs, and 3D previews.",
    highlights: [
      "Built core frontend interfaces and complex state flows while maintaining consistent interactions and visual design.",
      "Implemented 3D design previews with Three.js and collaborated on data integration with backend and model services.",
    ],
    stack: ["React", "TypeScript", "Three.js", "Tailwind CSS"],
  },
  {
    period: "2023 — 2024",
    role: "Full-stack Developer",
    organization: "iDesignLab · Tianjin University",
    summary:
      "Designed and built an industrial design lab reservation platform unifying resources, permissions, approvals, check-in, and audit trails.",
    highlights: [
      "Delivered an end-to-end workflow across a Vue admin interface, WeChat entry point, and Go backend.",
      "Implemented booking conflict handling, role-based access, activity records, and containerized deployment.",
    ],
    stack: ["Vue 3", "Go", "Gin", "MariaDB", "Docker", "Nginx"],
  },
  {
    period: "2022",
    role: "Cross-platform Developer",
    organization: "TWT Studio · Tianjin University",
    summary:
      "Contributed to the Flutter-based WePeiYang campus app, providing a unified service entry point for Tianjin University students and staff.",
    highlights: [
      "Worked on mobile modules for schedules, academic information, messaging, and campus services.",
      "Used shared infrastructure for networking, caching, themes, and delivery across platforms.",
    ],
    stack: ["Flutter", "Dart", "Android", "iOS"],
  },
];

export const resumeProjects: ResumeProject[] = [
  {
    name: "iDesignLab",
    role: "Full-stack development",
    description:
      "A lab reservation and operations platform covering configurable time slots, approvals, check-in, notifications, and reporting.",
    href: "/projects/idesignlab",
    stack: ["Vue 3", "Go", "MariaDB", "Docker"],
  },
  {
    name: "WePeiYang",
    role: "Cross-platform development",
    description:
      "A campus app maintained by TWT Studio, bringing together schedules, study rooms, GPA, messaging, and community features.",
    href: "https://github.com/twtstudio/WePeiYang-Flutter",
    stack: ["Flutter", "Dart", "Mobile"],
    external: true,
  },
  {
    name: "Tenio",
    role: "Frontend & interaction development",
    description:
      "An AI-assisted design system exploring a collaborative workflow for conversational input, generated proposals, and 3D previews.",
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
    items: ["Taro", "Flutter", "Dart", "Mini Programs", "H5"],
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
      "支持 React、Vue、Mini Programs、H5 与 React Native 等平台的开放式跨端框架。",
  },
  {
    name: "OxyGent",
    href: "https://github.com/jd-opensource/OxyGent",
    description:
      "An open-source multi-agent framework focused on modularity, observability, and extensibility.",
  },
];
