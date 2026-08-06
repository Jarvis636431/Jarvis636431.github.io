/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

const config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "#f6f4ef",
        surface: "#ffffff",
        primary: "#1f1f1f",
        secondary: "#6b6b6b",
        accent: {
          cyan: "#2f6f6d",
          violet: "#c59a6d",
        },
        midnight: "#1f1f1f",
      },
      fontFamily: {
        display: [
          '"Space Grotesk"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          "sans-serif",
        ],
        body: [
          '"Newsreader"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          "serif",
        ],
        pixel: ['"IBM Plex Mono"', "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        neon: "0 0 20px rgba(34, 211, 238, 0.5)",
      },
      typography: {
        DEFAULT: {
          css: {
            // 基础颜色系统
            "--tw-prose-body": "#4b4b4b",
            "--tw-prose-headings": "#1f1f1f",
            "--tw-prose-links": "#2f6f6d",
            "--tw-prose-bold": "#1f1f1f",
            "--tw-prose-counters": "#6b6b6b",
            "--tw-prose-bullets": "#d1d5db",
            "--tw-prose-hr": "#e5e7eb",
            "--tw-prose-quotes": "#1f1f1f",
            "--tw-prose-quote-borders": "#2f6f6d",
            "--tw-prose-captions": "#6b6b6b",
            "--tw-prose-code": "#1f1f1f",
            "--tw-prose-pre-code": "#e5e7eb",
            "--tw-prose-pre-bg": "#1f1f1f",
            "--tw-prose-th-borders": "#d1d5db",
            "--tw-prose-td-borders": "#e5e7eb",

            // 全局排版
            maxWidth: "65ch",
            fontFamily:
              '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
            fontSize: "1.0625rem",
            lineHeight: "1.85",
            overflowWrap: "anywhere",

            // 标题样式
            "h1, h2, h3, h4": {
              fontFamily: '"Space Grotesk", sans-serif', // 无衬线体标题，形成对比
              fontWeight: "600",
              letterSpacing: "-0.02em",
              color: "var(--tw-prose-headings)",
            },
            h1: {
              fontWeight: "700",
              marginBottom: "0.8em",
            },
            h2: {
              marginTop: "2.4em",
              marginBottom: "0.8em",
              paddingBottom: "0.35em",
              borderBottom: "1px solid rgba(31,31,31,0.1)",
            },
            h3: {
              marginTop: "2em",
              marginBottom: "0.65em",
            },

            // 链接交互
            a: {
              color: "var(--tw-prose-links)",
              textDecoration: "none",
              fontWeight: "500",
              borderBottom: "1px solid transparent",
              transition: "all 0.2s ease",
              backgroundImage:
                "linear-gradient(to right, var(--tw-prose-links), var(--tw-prose-links))",
              backgroundSize: "0% 1px",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left bottom",
              "&:hover": {
                backgroundSize: "100% 1px",
                color: "#255a58", // 稍微加深
              },
            },

            // 引用块优化
            blockquote: {
              fontStyle: "italic",
              fontWeight: "400",
              color: "var(--tw-prose-quotes)",
              borderLeftWidth: "2px",
              borderLeftColor: "var(--tw-prose-quote-borders)",
              backgroundColor: "rgba(47, 111, 109, 0.05)", // 淡雅的背景色
              padding: "1em 1.5em",
              borderRadius: "0",
              quotes: "none",
              marginTop: "1.6em",
              marginBottom: "1.6em",
            },

            // 代码样式
            code: {
              color: "#2f6f6d",
              backgroundColor: "rgba(47, 111, 109, 0.1)",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontWeight: "500",
              fontSize: "0.9em",
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },

            // 图片样式
            img: {
              borderRadius: "0",
              boxShadow: "none",
              marginTop: "2em",
              marginBottom: "2em",
            },

            pre: {
              borderRadius: "0.35rem",
              marginTop: "2em",
              marginBottom: "2em",
            },

            table: {
              fontSize: "0.9em",
            },

            // 列表微调
            "ul > li::marker": {
              color: "#9ca3af",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
