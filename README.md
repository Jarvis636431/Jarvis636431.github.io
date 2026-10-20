# Jarvis Hub

A personal portfolio and technical writing archive built with Astro 5, TypeScript, and Tailwind CSS. The interface uses restrained typography, structured lists, and responsive layouts; see [DESIGN.md](DESIGN.md) for the visual guidelines.

## Features

- Home page with selected projects, recent published writing, and an externally hosted GitHub contribution heatmap.
- Blog categories, related articles, series navigation, reading time, table of contents, and reading progress.
- Article enhancements: code copying, line numbers, highlighted lines, collapsible code, image captions and zoom, and horizontally scrollable tables.
- Project archive and detail pages; archived projects are excluded from production.
- Data-driven resume with print / Save PDF support, plus About and contribution archive pages.
- Client-side fuzzy search over titles, summaries, and tags with Fuse.js and Cmd/Ctrl+K navigation. Article bodies are not indexed.
- Optional Supabase home-page view counter and Giscus comments through GitHub Discussions.
- Static RSS, sitemap, robots.txt, and page-specific SEO metadata.
- GitHub Actions verification, Pages deployment, and contribution snapshot synchronization every four hours.

## Development

CI uses Node.js 22 and pnpm 10.14.0. Use the same versions locally for consistent results.

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Open `http://localhost:4321`. Environment values are optional for local development:

| Variable                                              | Purpose                                                          |
| :---------------------------------------------------- | :--------------------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`     | Enable the home-page counter using the `increment_page_view` RPC |
| `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`         | Identify the GitHub repository for comments                      |
| `PUBLIC_GISCUS_CATEGORY`, `PUBLIC_GISCUS_CATEGORY_ID` | Identify the Discussions category                                |
| `PUBLIC_GISCUS_THEME`                                 | Comment theme; defaults to `light`                               |

Get Giscus IDs from [giscus.app](https://giscus.app) after enabling Discussions and installing its GitHub App. Production values are configured in GitHub Actions repository variables; see `.github/workflows/deploy.yml`.

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
client JavaScript. The sanitized Markdown component supports the same syntax.

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
failure, the original source remains readable. The sanitized Markdown component
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
signs as `\$` in prose. The sanitized Markdown component supports the same syntax.

### Images and code blocks

Regular Markdown images receive lazy loading, captions from alt text, and click-to-zoom behavior. For responsive output with intrinsic dimensions, import a local image through `ArticleImage` in MDX:

```mdx
import ArticleImage from "@components/ArticleImage.astro";
import screenshot from "../../assets/blog/screenshot.png";

<ArticleImage
  src={screenshot}
  alt="Dashboard overview"
  caption="Optional caption"
/>
```

The image path is illustrative: create the asset and adjust the relative import for the article location.

Fenced code supports filename metadata, line numbers, highlighted lines, and explicit collapse. Blocks longer than 24 lines collapse automatically:

````md
```ts title="src/example.ts" lineNumbers {2,4-6} collapse
const first = true;
const highlighted = true;
```
````

## Import aliases

Astro reads aliases directly from `tsconfig.json`; do not duplicate these mappings in Vite configuration. Source files use `@components/*`, `@layouts/*`, `@lib/*`, `@data/*`, `@scripts/*`, `@styles/*`, `@content/*`, `@assets/*`, and `@pages/*` for internal imports, including dynamic imports and browser scripts.

```ts
import { getPosts } from "@lib/content";
import { resumeProfile } from "@data/resume";
```

Node-run configuration files, automation scripts, and tests keep explicit relative paths (with extensions where required). Native Node does not resolve TypeScript `paths` aliases.

## Shared content queries

`src/lib/content.ts` owns draft and archive visibility, newest-first sorting, recent articles, and featured projects. The homepage, blog and project lists/details, RSS, search, and resume call this layer instead of querying collections independently.

- `getPosts()` includes drafts only during development; pass `includeDrafts` to override explicitly.
- `getProjects()` includes archived projects only during development; the project list passes `includeArchived: false` to preserve its public-only behavior.
- `getRecentPosts(limit)` uses the same article visibility rules.
- `getFeaturedProjects(limit?)` always excludes archives, including in development, and supplies both the homepage and resume.
- `src/lib/blog.ts` owns related-post ranking, reading time, and series navigation.
- `src/scripts/article.ts` initializes article reading progress, code tools, image previews, tables, headings, and sharing. The detail page imports it through an Astro script so it remains bundled.
- `src/components/site/` owns the shared header, footer, and view counter. The counter handles its own delayed Supabase initialization, so pages only need to pass `viewCounterSlug` to the layout.
- `src/scripts/mermaid.ts` initializes diagrams from the layout and loads the Mermaid renderer only when unprocessed diagram blocks are present. Failed diagrams retain their source.

## Profile and resume

The resume uses a compact, single-column layout inspired by [YAMLResume Calm](https://yamlresume.dev/docs/layouts/html/templates/calm). The print / Save PDF action is at the bottom of the document and is hidden when printing. This is an Astro implementation, not a YAMLResume CLI integration.

- Maintain personal profile, employment history, education, and skills in `src/data/resume.ts`. These facts are explicitly authored, not inferred from GitHub activity.
- `src/lib/resume.ts` builds selected projects from featured, non-archived project content. Names and descriptions prefer English metadata, with the original text as fallback; technologies and links come from the same entries used by project pages.
- Open-source sections are generated from the contribution snapshot: all repositories, merged-PR counts, and each repository's most recent merged PR title and link. There is no separate manually maintained contribution summary.
- The contribution sync (every four hours) updates the snapshot and rebuilds the site when metadata changes, so the resume follows the same update cycle. Builds require no GitHub API access. Deployment remains conditional on the full verification gate.
- Keep homepage and About copy consistent when changing personal information. About already reuses the resume's experience data.

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
returns to the first page. Dates use `Asia/Shanghai`. The snapshot contains only PR records; no sync
timestamp is stored.

`Sync merged PR contributions` runs every four hours (00:00, 04:00, 08:00,
12:00, 16:00, and 20:00 in Asia/Shanghai), and can also be triggered manually
from the Actions tab. It queries
PRs authored by `Jarvis636431`, excludes their own repositories, verifies actual
merge times, and keeps existing records if search results temporarily omit them.
API errors or incomplete results fail the run without changing the snapshot.

When metadata changes, the workflow verifies the site, commits only the generated
JSON to `main`, and calls the existing deployment workflow directly. Manual runs
also redeploy unchanged data, allowing a failed deployment to be retried. It uses
the built-in `GITHUB_TOKEN`; no personal token is needed. Repository rules must
allow the bot to push to `main`. The workflow must be on the default branch to
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
  components/        # Search, TOC, comments, images, contributions, Markdown
  content/           # Blog and project Markdown / MDX
  data/              # Resume and generated contribution snapshot
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

Both verification and deployment workflows use `pnpm verify`. The full `pnpm verify` gate passed locally on 2026-10-16 using Node.js 26.8.1 and pnpm 10.14.0, including content regression tests, Astro check, ESLint, formatting, and production build. CI uses Node.js 22; that environment must still be confirmed by its workflow. Astro frontmatter and client scripts explicitly use the parser exported by `typescript-eslint`. See [TODO.md](TODO.md) for remaining work. There is currently no automated interaction test suite or dedicated sensitive-content scanner.

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
