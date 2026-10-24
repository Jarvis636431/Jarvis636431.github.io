# Jarvis Hub

[English](README.md) | [简体中文](README.zh-CN.md)

A personal portfolio and technical writing archive built with Astro 5, TypeScript, and Tailwind CSS. The interface uses restrained typography, structured lists, and responsive layouts; see [DESIGN.md](DESIGN.md) for the visual guidelines.

## Features

- Home page with selected projects, recent published writing, and an externally hosted GitHub contribution heatmap.
- Blog categories, related articles, series navigation, reading time, table of contents, and reading progress.
- Article enhancements: code copying, line numbers, highlighted lines, collapsible code, image captions and zoom, and horizontally scrollable tables.
- Project archive and detail pages; archived projects are excluded from production.
- Data-driven resume with print / Save PDF support, plus About and contribution archive pages.
- Client-side fuzzy search over titles, summaries, aliases, tags, categories, and article bodies with Fuse.js and Cmd/Ctrl+K navigation.
- Optional Supabase home-page view counter and Giscus comments through GitHub Discussions.
- Static RSS, sitemap, robots.txt, and page-specific SEO metadata.
- GitHub Actions verification, Pages deployment, and contribution snapshot synchronization every four hours.

## Personalization

Start with [the configuration guide](docs/personalization.md). Personal data lives
in `src/data/profile.mjs`, site settings in `src/config/site.mjs`, optional
capabilities in `src/config/integrations.mjs`, and content in `src/content/`.
These are the intended differences between a personal site and a future template;
pages, components, scripts, and workflows share the same implementation.

## Development

CI uses Node.js 22 and pnpm 10.14.0. Use the same versions locally for consistent results.

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Open `http://localhost:4321`. Environment values are optional for local development:

| Variable                                             | Purpose                                                        |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`    | Optional home-page counter using the `increment_page_view` RPC |
| `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY_ID` | IDs for the comment repository and category                    |

Feature switches and Giscus repository, category, theme, and language live in
`src/config/integrations.mjs`. Only enabled services with complete configuration
render their integration. No environment variables are required to build the site.

Get Giscus IDs from [giscus.app](https://giscus.app) after enabling Discussions and installing its GitHub App. Production values are configured in GitHub Actions repository variables and supplied by both `.github/workflows/deploy.yml` and `.github/workflows/sync-contributions.yml`.

`PUBLIC_*` values can be exposed to browsers: use only the Supabase anonymous key, never a service-role key. The repository does not provision the Supabase database or RPC; those must be configured separately with appropriate permissions. Without service configuration, the counter stays hidden and production comments are omitted. Development shows a comment configuration hint.

## Content management

```bash
pnpm new:post --title "My New Post" --template mdx
pnpm new:post --title "Series Part One" --series "My Series" --series-order 1
pnpm new:project --title "My Project"
```

Omit arguments for interactive prompts. New posts default to drafts; new projects default to `in-progress` and are eligible for production. Review content before publishing.

Schemas live in `src/content/config.ts`:

| Collection | Fields                                                                                                                                                                               |
| :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Blog       | `title`, `description` (at least 10 characters), `commentId`, `language`, `publishDate`, optional `updatedDate`, `tags`, `series`, `seriesOrder`, and `draft`                        |
| Projects   | `title`, `summary` (at least 10 characters), `language`, `status`, `roles`, `stack`, `featured`, `publishDate`, optional `updatedDate`, `externalUrl`, `githubUrl`, and `coverImage` |

Both collections support optional English title and summary fields (`titleEn` with `descriptionEn` / `summaryEn`). The homepage uses these where available; this is not a full translation system. Reading time is calculated from the body rather than stored in frontmatter.

Project list entries show a title, summary, logo, and configured external links.
Set `externalUrl` to the official website and optional `githubUrl` to a repository:

```yaml
externalUrl: "https://example.com"
githubUrl: "https://github.com/owner/repository"
```

The GitHub link displays an icon and `owner/repository`, without the URL prefix.
Omit the field or leave it empty to hide that link. Unpublished website addresses
can also remain empty; no placeholder links are rendered.

Both collections accept optional search aliases, for example
`aliases: ["WePeiYang-Flutter"]`. Search indexes the original and English titles
and descriptions plus aliases. Project results use the same English name and
summary as the project pages when translations are present; article results keep
the original display title. An alias match shows its matching name beneath the
result title. Aliases do not change the content URL.

Development includes draft articles in routes, lists, RSS, and search, and archived projects in detail routes and search. The homepage and project list always exclude archived projects. Production excludes drafts and archived projects from their routes and indexes. A scheduled publication date is not enforced.

As of 2026-10-16, all 65 articles are drafts. Production therefore has no article detail pages or RSS items, and search contains only public projects. Draft filtering does not hide source files in a public repository. Review sensitive information before changing `draft` to `false`.

### Site search

Search covers article and project titles, descriptions, tags, folder categories,
and body text (including code identifiers). Results prioritize metadata matches,
show a passage around the matching text, and highlight matching words using safe
DOM text nodes. At most 20 results are shown per query.

Open search from the navigation or with `Cmd/Ctrl + K`. Use the arrow keys and Enter
to open a result; Escape or the close button dismisses the dialog and restores focus.
The index loads on first open, is reused for the page session, and can be retried
if loading fails. Chinese input composition is respected. Production search uses
the same draft and archive filtering as the rest of the site.

### Callouts

Use GitHub-style alerts as top-level blockquotes in Markdown or MDX:

```markdown
> [!NOTE]
> A short definition or supporting explanation.

> [!TIP]
> A useful approach or practical suggestion.

> [!WARNING]
> Negative sampling changes the training distribution.
> Keep the evaluation set close to the real distribution.
```

`IMPORTANT` and `CAUTION` are also supported. Keep the marker on its own line;
use a blank quoted line (`>`) to start another paragraph. Lists, code blocks, and
formulas can appear in the body. Regular blockquotes keep their existing style.
Alerts render at build time through `rehype-github-alert` with local CSS and no
client JavaScript. The sanitized PR body renderer supports the same syntax.

### Mermaid diagrams

Use a fenced `mermaid` block in Markdown or MDX:

````markdown
```mermaid
flowchart LR
  accTitle: Recommendation pipeline
  accDescr: Candidate items pass through retrieval, ranking, and re-ranking.
  A[Candidate pool] --> B[Retrieval] --> C[Ranking] --> D[Re-ranking]
```
````

Diagrams render in the browser using a locally bundled Mermaid dependency, loaded
only on pages containing diagrams. Add `accTitle` and `accDescr` for accessible
labels. Wide diagrams scroll horizontally. With JavaScript disabled or a rendering
failure, the original source remains readable. The sanitized PR body renderer
supports the same fenced syntax. HTML labels and interactive links are disabled.

### Math formulas

Markdown and MDX articles support `$...$` for inline math and `$$...$$` on separate
lines for display equations. Use LaTeX notation, for example:

```markdown
The predicted probability is $p = \sigma(z)$.

$$
p = \frac{1}{1 + e^{-z}}
$$
```

Formulas render at build time with KaTeX; styles and fonts are served locally.
Long display equations scroll horizontally on narrow screens. Keep executable code,
text diagrams, and experiment output in fenced code blocks. Escape literal dollar
signs as `\$` in prose. The sanitized PR body renderer supports the same syntax.

### Images and code blocks

Regular Markdown images receive lazy loading, captions from alt text, and click-to-zoom behavior through the article script. There is no separate image component to maintain; use standard Markdown image syntax in articles.

Fenced code supports filename metadata, line numbers, highlighted lines, and explicit collapse. Blocks longer than 24 lines collapse automatically:

````md
```ts title="src/example.ts" lineNumbers {2,4-6} collapse
const first = true;
const highlighted = true;
```
````

## Import aliases

Astro reads aliases directly from `tsconfig.json`; do not duplicate these mappings in Vite configuration. Source files use `@config/*`, `@components/*`, `@layouts/*`, `@lib/*`, `@data/*`, `@scripts/*`, `@styles/*`, `@content/*`, `@assets/*`, and `@pages/*` for internal imports, including dynamic imports and browser scripts.

```ts
import { getPosts } from "@lib/content";
import { profile } from "@data/profile.mjs";
```

Node-run configuration files, automation scripts, and tests keep explicit relative paths (with extensions where required). Native Node does not resolve TypeScript `paths` aliases. Leaf modules imported directly by Node tests (such as `src/scripts/search.ts` and `src/lib/seo.ts`) also use explicit relative imports for their dependencies.

## Components

Components are grouped by their callers: `site/` for the shared layout, `blog/` for article details, and `contributions/` for full and compact contribution views. Keep page-specific layout in `src/pages/` rather than adding wrappers without a separate responsibility.

`Markdown.astro` owns shared prose presentation. Pass a raw `content` string for sanitized external Markdown, or compiled Astro content through its slot. PR descriptions use compact typography; blogs and project details use the same component with standard typography. Shared presentation does not bypass HTML sanitization for external content. The unused `ArticleImage` component has been removed; article images use standard Markdown syntax and the existing client enhancement script.

## Site configuration and page metadata

`src/config/site.mjs` owns the site name, origin, navigation, contact links, GitHub identity, default share image, favicon, and RSS defaults. Astro configuration, page metadata, profile data, and contribution automation use the same values. The module has no Astro or browser dependencies.

`src/lib/seo.ts` supplies canonical URLs and complete Open Graph / Twitter metadata. Pages can override their title, description, share image, article dates, tags, or Twitter settings through `Layout`; pages without a custom image use the existing logo as a fallback.

## Client initialization and tests

`Search.astro` and `Toc.astro` own their markup and styles; their bundled scripts call `initSearch` and `initToc` from `src/scripts/`. Tests import those modules directly and inject browser dependencies, without extracting or transpiling Astro source. Search tests cover animation, focus restoration (including mobile menu triggers), and reduced motion; TOC tests cover duplicate headings, tracking, and local scrolling.

The mobile menu is inert while closed. Opening enables its links and moves focus inside; Escape closes it and restores the menu button. Opening search from the mobile menu restores the visible menu button when search closes. Switching to desktop navigation closes the mobile menu and moves focus to a desktop link when needed.

## Styling

- `src/styles/tokens.css` is the source of site colors and font stacks. Use `var(--color-accent)` in CSS and RGB channels such as `rgb(var(--color-accent-rgb) / 0.1)` for transparency. Tailwind colors read these same channels, including opacity modifiers such as `bg-accent-cyan/10`.
- `tailwind.config.mjs` maps tokens to utility names and enables Typography defaults; site-specific prose overrides live in `src/styles/prose.css`.
- `src/styles/global.css` owns site-wide base rules and the shared decorative background. Page and component layout stays in scoped Astro styles.
- `src/styles/prose.css` owns long-form `.prose`, compact `.prose--compact`, and shared KaTeX, Mermaid, and callout styles. The two text formats keep their existing sizes and spacing.
- `src/styles/article.css` owns blog-only code tools, image captions, table scrolling, and heading anchors, scoped to `.article-content`. The blog detail page imports it; other pages do not need these enhancements.
- Mermaid reads its palette and font from computed CSS tokens. Shiki and KaTeX retain their renderer-specific syntax colors and math fonts; the resume's print-oriented neutral shades and lightbox overlay remain local.

## Shared content queries

`src/lib/content.ts` owns draft and archive visibility, newest-first sorting, recent articles, and featured projects. The homepage, blog and project lists/details, RSS, search, and resume call this layer instead of querying collections independently.

- `getPosts()` includes drafts only during development; pass `includeDrafts` to override explicitly.
- `getProjects()` includes archived projects only during development; the project list passes `includeArchived: false` to preserve its public-only behavior.
- `getRecentPosts(limit)` uses the same article visibility rules.
- `getFeaturedProjects(limit?)` always excludes archives, including in development, and supplies both the homepage and resume.
- `src/lib/blog.ts` owns related-post ranking, reading time, and series navigation.
- `src/scripts/article.ts` initializes article reading progress, code tools, image previews, tables, headings, and sharing. The detail page imports it through an Astro script so it remains bundled.
- `src/components/site/` owns the shared header, footer, search dialog, and view counter. The counter handles its own delayed Supabase initialization, so pages only need to pass `viewCounterSlug` to the layout.
- `src/scripts/mermaid.ts` initializes diagrams from the layout and loads the Mermaid renderer only when unprocessed diagram blocks are present. Failed diagrams retain their source.

## Profile and resume

The resume uses a compact, single-column layout inspired by [YAMLResume Calm](https://yamlresume.dev/docs/layouts/html/templates/calm). The print / Save PDF action is at the bottom of the document and is hidden when printing. This is an Astro implementation, not a YAMLResume CLI integration.

- Maintain personal profile, homepage/About copy, employment history, education, and skills in `src/data/profile.mjs`. These facts are explicitly authored, not inferred from GitHub activity.
- `src/lib/resume.ts` builds selected projects from featured, non-archived project content. Names and descriptions prefer English metadata, with the original text as fallback; technologies and links come from the same entries used by project pages.
- Open-source sections are generated from the contribution snapshot: all repositories, merged-PR counts, and each repository's most recent merged PR title and link. There is no separate manually maintained contribution summary.
- The contribution sync (every four hours) updates the snapshot and rebuilds the site when metadata changes, so the resume follows the same update cycle. Builds require no GitHub API access. Deployment remains conditional on the full verification gate.
- Homepage, About, resume, contact links, and person metadata read the same profile data. Site branding, origin, navigation, and timezone remain in `src/config/site.mjs`.

## Contribution synchronization

The About page displays GitHub metadata directly from
`src/data/contributions.generated.json`: repository, PR number, original title,
creation and merge times, labels, descriptions, change statistics, and discussion
counts. This file is maintained by the sync script.

About shows contribution totals and the latest six merged PRs, with a link to
the complete archive. `/contributions` contains the full archive in reverse chronological
order, with repository filters, six PRs per page, and expandable PR descriptions rendered
as sanitized GitHub-flavored Markdown (including tables, task lists and code blocks).
The selected repository and page are preserved in the URL; switching repositories
returns to the first page. Dates use `siteConfig.timeZone` (`Asia/Shanghai` here). The snapshot contains an `author` and PR records; no sync timestamp is stored. Data is displayed only when the author matches the configured GitHub account. Switching accounts starts a separate snapshot on the next sync; records omitted temporarily are retained only for the same account.

`Sync merged PR contributions` runs every four hours (00:00, 04:00, 08:00,
12:00, 16:00, and 20:00 in Asia/Shanghai), and can also be triggered manually
from the Actions tab. Both CLI and workflow read `contributions.enabled` and
`contributions.sync` from `src/config/integrations.mjs`; disabled sync or an empty
GitHub username skips API requests. The workflow also skips installation,
verification, commit, and deployment when sync is disabled. It queries
PRs authored by `profile.githubUsername`, excludes their own repositories, verifies actual
merge times, and keeps existing records if search results temporarily omit them.
API errors or incomplete results fail the run without changing the snapshot.

When metadata changes, the workflow runs `pnpm verify` once with production
configuration, commits only the generated JSON to the default branch, and uploads the verified
`dist/` as a Pages artifact. It then calls the deployment workflow in
`artifact-only` mode to deploy that same artifact without rebuilding or checking
out `main` again. Manual runs also verify, build, and redeploy unchanged data,
allowing a failed deployment to be retried. Scheduled runs with unchanged data
skip verification, artifact upload, and deployment. It uses
the built-in `GITHUB_TOKEN`; no personal token is needed. Repository rules must
allow the bot to push to the default branch. The workflow must be on the default branch to
run on a schedule; GitHub may delay scheduled runs or disable them after 60 days
of inactivity in a public repository.

Run `pnpm sync:contributions` locally (optional `GH_TOKEN` for higher API limits).
Unchanged metadata does not produce a commit.

## Project structure

```text
.github/workflows/    # Verification, Pages deployment, contribution sync
public/              # Static images and favicon
scripts/             # Content scaffolding, sync, legacy MDX migration helpers
tests/               # Content visibility, recommendations, and navigation regression tests
src/
  components/
    site/            # Header, Footer, Search, ViewCounter
    blog/            # Toc, Comments
    contributions/   # Full and compact contribution views
  content/           # Blog and project Markdown / MDX
  config/            # Site identity and optional integrations
  data/              # Shared personal profile and generated contribution snapshot
  layouts/           # Shared page shell and metadata
  lib/               # Reading helpers, Markdown pipeline, Supabase client
  pages/             # Static routes, RSS, search index
  scripts/           # Browser-side article interactions
  styles/            # Global CSS
```

## Commands and validation

| Command                              | Purpose                                          |
| :----------------------------------- | :----------------------------------------------- |
| `pnpm dev`                           | Start local development                          |
| `pnpm test`                          | Run content regression tests with Node.js 22.6+  |
| `pnpm check`                         | Astro and TypeScript diagnostics                 |
| `pnpm lint`                          | ESLint                                           |
| `pnpm format:check`                  | Check formatting without writing                 |
| `pnpm format`                        | Format files in place                            |
| `pnpm build`                         | Build production files into `dist/`              |
| `pnpm verify`                        | Run tests, check, lint, format check, then build |
| `pnpm preview`                       | Preview the production build                     |
| `pnpm new:post` / `pnpm new:project` | Scaffold content                                 |
| `pnpm sync:contributions`            | Refresh the merged-PR snapshot                   |

Pull requests and manual verification runs use `verify.yml`; pushes to `main` and manual deployments use `deploy.yml`. Each path runs `pnpm verify` once. Contribution synchronization verifies before committing and deploys its existing artifact through the reusable deployment workflow. The `artifact-only` input is reserved for callers that have already uploaded a `github-pages` artifact in the same workflow run; it does not retrieve artifacts from other runs. A failed verification prevents deployment. Pushes made by the sync workflow using `GITHUB_TOKEN` do not trigger a second push workflow. The full `pnpm verify` gate passed locally on 2026-10-24 using Node.js 22.18.0 and pnpm 10.14.0, including 63 tests, Astro check, ESLint, formatting, and production build. A separate template scenario with a public article, empty projects/profile sections, and disabled integrations also builds successfully. Remote CI execution must still be confirmed by its workflow. Astro frontmatter and client scripts explicitly use the parser exported by `typescript-eslint`. There is currently no automated interaction test suite or dedicated sensitive-content scanner.

## Nested blog folders

Blog posts can live in subfolders such as `src/content/blog/rec/example.md`.
Their URLs retain the folder path (`/blogs/rec/example`). The `[...slug].astro`
detail route handles both root-level and nested posts. Drafts are visible in
development and excluded from production builds.

Blog categories are derived automatically from the first folder below
`src/content/blog/`: `rec/example.md` belongs to `rec`, and
`frontend/react/example.mdx` belongs to `frontend`. Folder names are displayed
as written, with no category mapping to maintain. Root-level posts appear under
`Uncategorized`. Categories use the source file ID, so custom URL slugs do not
change them. Tags remain available for search and related-article scoring;
sharing a folder adds a relevance bonus, while root-level posts receive no
shared-category bonus.

Current blog folders:

| Folder       | Content                                                           |
| ------------ | ----------------------------------------------------------------- |
| `frontend`   | Web fundamentals, frameworks, browser APIs, and engineering notes |
| `interviews` | Interview preparation and interview records                       |
| `projects`   | Project documentation and implementation notes                    |
| `updates`    | Weekly updates and work logs                                      |
| `algorithms` | Coding exercises and reinforcement learning notes                 |
| `databases`  | SQL and database notes                                            |
| `life`       | Personal notes                                                    |
| `rec`        | Search, advertising, and recommendation systems                   |

Articles moved from the blog root retain their original URLs through an explicit
`slug` in frontmatter. Leave that slug unchanged when reorganizing an existing
article. New articles without a custom slug use their folder path in the URL.
Comment IDs, publication dates, and draft status are independent of folders.

### Article heading levels

The detail page supplies the article title as its `h1`. Start the Markdown body
with `##` sections, use `###` for their subsections, and keep heading levels
consecutive. Code-block examples are independent of this rule. The table of
contents includes body `h1`–`h3` for compatibility with older articles, with
indentation relative to the shallowest body heading. The page title is excluded.
