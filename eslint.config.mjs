import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

const browserGlobals = {
  document: "readonly",
  window: "readonly",
  HTMLElement: "readonly",
  HTMLAnchorElement: "readonly",
  HTMLDialogElement: "readonly",
  HTMLInputElement: "readonly",
  IntersectionObserver: "readonly",
  KeyboardEvent: "readonly",
  Response: "readonly",
  URL: "readonly",
  fetch: "readonly",
  requestAnimationFrame: "readonly",
  setTimeout: "readonly",
};

const nodeGlobals = {
  console: "readonly",
  process: "readonly",
  Buffer: "readonly",
};

export default [
  {
    ignores: [
      "**/.astro/**",
      ".vercel/",
      "content-migration/",
      "dist/",
      "node_modules/",
      "package-lock.json",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["src/**/*.{astro,js,ts}", "*.config.mjs"],
    languageOptions: {
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}", "*.config.mjs"],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
  {
    rules: {
      "no-console": "off",
    },
  },
];
