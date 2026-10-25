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
      ".sites-deploy/",
      "dist/",
      "node_modules/",
      "template/",
      "package-lock.json",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    // Use the parser exported by typescript-eslint for frontmatter and scripts.
    files: ["**/*.astro"],
    processor: "astro/client-side-ts",
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: ["**/*.astro/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
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
      globals: {
        ...nodeGlobals,
        fetch: "readonly",
        AbortSignal: "readonly",
        URLSearchParams: "readonly",
      },
    },
  },
  {
    rules: {
      "no-console": "off",
    },
  },
];
