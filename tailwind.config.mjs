/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

const color = (name) => `rgb(var(--color-${name}-rgb) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: color("background"),
        surface: color("surface"),
        primary: color("primary"),
        secondary: color("secondary"),
        accent: {
          cyan: color("accent"),
          violet: color("accent-secondary"),
        },
        border: "var(--color-border)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [typography],
};
