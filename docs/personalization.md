# Personalization and template boundaries

English | [简体中文](personalization.zh-CN.md)

The personal site and a future template use the same rendering, interactions,
content queries, and automation. Customize data and settings instead of editing
pages or maintaining a second implementation. The current configuration keeps
this site's integrations enabled; no personal content has been replaced.

## Configuration entry points

| File                                         | Responsibility                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/config/profile.mjs`                     | Name, role, email, GitHub username, home/About copy, experience, education, and skills |
| `src/config/site.mjs`                        | Branding, domain, language, timezone, navigation, RSS, favicon, and share image        |
| `src/config/integrations.mjs`                | Feature switches, Giscus settings, contribution sync, and page size                    |
| `.env` / Actions repository variables        | Optional service IDs, Supabase URL and anonymous key                                   |
| `src/content/blog/`, `src/content/projects/` | Markdown and MDX content                                                               |
| `src/styles/tokens.css`                      | Shared colors and fonts                                                                |

Configuration uses ordinary ESM so both Astro and Node automation can read it.
There is no separate workflow copy of the author's GitHub username or Giscus
repository. Use empty arrays for absent experience or skills, an empty education
institution to omit education, and empty email/GitHub username values to omit
those contact links. Home and project archives provide empty states.

Configuration files declare and validate settings; runtime resolution lives in
`src/lib/integrations/resolve.mjs`. The CLI and workflow import this pure module,
while Astro reads environment-resolved settings from `src/lib/integrations/index.ts`.
Contribution queries are grouped in `src/lib/contributions/`; `src/data/` stores
only the snapshot. These internal modules normally do not need editing when
changing personal information or feature settings.

## Configuration checks

Profile and integration files use `@ts-check` with shared types in
`src/config/types.ts`. `pnpm check` checks their structure while the files remain
ordinary ESM that Node can execute without installing project dependencies.

Configuration is also validated when loaded. Errors identify the field: for
example, `Invalid configuration: contributions.pageSize must be a positive integer`.
Feature switches must be booleans, the site URL must be an absolute HTTP(S) URL
at the domain root, and the timezone must be recognized by `Intl.DateTimeFormat`.
GitHub usernames and comment repositories use username and `owner/repository`
formats respectively. Empty contact values remain supported. A configured,
enabled counter also validates its Supabase URL; disabled or incomplete services
do not attempt initialization. Errors never echo URL credentials.

Tests use independent configuration examples, so changing this site's defaults,
including disabling all integrations, does not change test expectations.

## Optional capabilities

```js
export const integrationConfig = {
  comments: {
    enabled: true,
    repository: "owner/repository",
    category: "Announcements",
    theme: "light",
    language: "zh-CN",
  },
  viewCounter: { enabled: true },
  contributions: {
    enabled: true,
    heatmap: true,
    sync: true,
    pageSize: 6,
  },
};
```

- Comments need both `PUBLIC_GISCUS_REPO_ID` and `PUBLIC_GISCUS_CATEGORY_ID`.
  A disabled feature renders neither the comment widget nor its article anchor,
  even in development. Enabled but incomplete configuration shows a development
  hint and is omitted in production.
- The counter needs `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`. Disabled
  or unconfigured counters are not rendered or initialized. Database/RPC setup
  remains external; use only a public anonymous key.
- `contributions.enabled` controls the About/resume contribution data and the
  homepage heatmap. `heatmap` can independently disable the external heatmap.
  An empty username also hides the heatmap and profile links.
- `contributions.sync` controls both `pnpm sync:contributions` and scheduled or
  manual sync workflow runs. Disabling it keeps already stored contributions
  visible when the display feature is enabled. Set both switches off to disable
  the feature entirely. `pageSize` must be a positive integer.
- The `/contributions` URL stays available as an empty archive when the display
  feature is disabled. No stored PR descriptions are included in that page.

Non-secret Giscus display settings belong in the configuration file, not
environment variables. No environment values are necessary for local development
or a production build.

## GitHub contributions and automation

The snapshot has the shape `{ author, pullRequests }`. It is rendered only for
the configured account (case-insensitive). Changing `profile.githubUsername`
hides the previous account's records immediately; the next enabled sync replaces
them with the new account's records. A same-account sync retains known records
temporarily missing from GitHub search. Failed API validation leaves the stored
snapshot unchanged.

The workflow reads the same sync rule as the CLI before installing dependencies.
When enabled, it checks out and commits to the repository's default branch,
verifies with the production service settings, and deploys that verified artifact.
A scheduled run with unchanged data does not rebuild; an enabled manual run can
rebuild and redeploy unchanged data. Disabling sync also disables this manual
redeployment path; use the deployment workflow to redeploy directly.

Normal push deployment currently targets `main`. If choosing a different default
branch, update that trigger in `.github/workflows/deploy.yml`. Root-domain hosting
is the supported configuration in this version; changing Astro's `base` alone
does not make all internal links work under a subdirectory.

## Extracting a template later

Copy the common code into a new repository, replace the profile, site settings,
content, and branded assets, and start with optional integrations disabled. Supply
an empty snapshot with the new username and `pullRequests: []`. Keep author-owned
articles, real employment history, and generated personal data out of template
examples. Choose and document licenses for code and example assets before release.

Run `pnpm verify` without `.env`, then verify enabled integrations separately.
Test public article fixtures as well as empty content, because a production build
that excludes every draft does not exercise article page rendering.
