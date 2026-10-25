# Generate and maintain a template inside this repository

English | [简体中文](template-workflow.zh-CN.md)

Maintain one website implementation. The personal repository contains real content
and shared code; its generator creates a complete `template/` project beneath it.
That directory can have an independent Git history and a separate remote.

There is no sample-data directory. `scripts/build-template.mjs` generates minimal
default settings, empty content, and a generic SVG logo directly.

## The two repositories

```text
personal-site/
├── .git/                       # Personal site and generator history
├── src/                        # Shared implementation and personal content
├── scripts/build-template.mjs   # Generator and defaults
└── template/                   # Complete generated project, ignored by parent
    ├── .git/                   # Initialized separately, owned by the template
    ├── .template-manifest.json  # Generated file inventory
    ├── src/                    # Shared implementation, defaults and empty content
    ├── scripts/
    └── package.json
```

Ignoring `/template/` in the parent only prevents the parent from tracking it.
It does not interfere with Git inside an independently initialized child project.
Without the child's `.git`, Git searches upward and finds the parent repository;
initialize the child before committing there. This is not a Git submodule, and
the repositories do not share history.

## First generation

Run from the personal repository root:

```bash
pnpm template:build
```

This produces project source, not static website output. `pnpm build` produces
the personal site's `dist/`; running it inside the child produces `template/dist/`.

The generator copies an explicit list of shared pages, components, domain logic,
styles, validators, tests, and maintenance commands. It excludes personal posts,
projects, employment data, images, contribution records, environment files, and
the parent's `.git`.

New files within shared directories are included automatically. When adding a new
top-level shared directory, config file, or selected license, update the copy list
and run independent verification.

The starter has a placeholder name, empty contacts and resume sections, empty
blog/project folders, an empty contribution snapshot, and a generic SVG logo.
Comments, views, contribution display, and sync all default to disabled. The
output does not include the generator or `template:*` commands.

## Independent verification

From the parent root, run:

```bash
pnpm template:verify
```

This regenerates the project, installs its dependencies using the frozen lockfile,
and runs its own `pnpm verify`. The first installation needs registry access. It
does not reuse the parent's `node_modules` and requires no `.env` configuration.

Run `pnpm dev` inside the child to preview it. Empty content is intentional; use
`pnpm new:post` or `pnpm new:project` to add entries. Heading and math checks
validate existing articles without requiring the personal site's folders or counts.

This Astro version may report empty collections during an empty-content build;
the build still succeeds.

## Initialize the separate template repository

Create an empty repository on GitHub. Replace the remote URL below with your own:

```bash
cd template
git init -b main
git rev-parse --show-toplevel
git add .
git commit -m "Initial template"
git remote add origin https://github.com/YOUR_NAME/YOUR_TEMPLATE_REPO.git
git push -u origin main
```

Only initialize when `template/.git` does not exist. Confirm that the top-level
path ends in `/template`, so commits go to the child repository. If a remote is
already configured, inspect `git remote -v` instead of adding it again.

Optionally enable Template repository in the published repository's Settings to
provide GitHub's Use this template action. The generator does not require it.

## Subsequent updates

Change shared behavior in the personal site's `src/`. Change starter defaults
in the generator instead of maintaining a second implementation in its output.

From the personal repository root, verify and publish:

```bash
pnpm verify
pnpm template:verify
cd template
git status
git diff
git add .
git commit -m "Update template"
git push
```

Generation never initializes Git, commits, or pushes. It preserves the child's
`.git`, local `.env`, dependencies, and build caches. Both Git histories remain
independent.

## Update and cleanup boundaries

- Commit `.template-manifest.json` alongside generated source. It lists managed files.
- Regeneration replaces managed files with shared source or defaults. Direct edits
  to these files are overwritten; review `git diff` before publishing.
- Previously managed files no longer generated are deleted, avoiding stale modules.
- Unmanaged files are preserved. Review and maintain any extra files you place in
  the output yourself.
- Git metadata, environment files, and dependencies are protected. Invalid
  manifests and destination symlinks fail rather than deleting outside the output.
- Parent Git, type, lint, and formatting checks exclude `template/`. The child
  can still run its own checks independently.

## Workflows and publication scope

The personal site's deployment and sync workflows are unchanged. The generated
project checks pushes, PRs, and manual runs; Pages deployment is manual only, and
no scheduled contribution-sync workflow is included. Enable automated deployment
or scheduled writes deliberately in the published repository if needed.

Replace the starter's `https://example.com` with your real domain before publishing.
Domain-root hosting is supported; subdirectory hosting is not yet supported.

Licensing, a demo site, and Astro theme-directory submission are separate release
tasks. The generator does not choose a license, create GitHub repositories, or
submit themes.
