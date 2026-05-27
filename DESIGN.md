---
version: alpha
name: Jarvis Hub Interface System
description: A restrained personal-site design system for project indexes, notes, and technical writing.
colors:
  background: "#f6f4ef"
  surface: "#ffffff"
  surface-muted: "#f8f7f4"
  primary: "#1f1f1f"
  secondary: "#6b6b6b"
  accent-cyan: "#2f6f6d"
  accent-violet: "#c59a6d"
  border: "#1f1f1f1a"
  positive-bg: "#dcfce7"
  positive-text: "#15803d"
  warning-bg: "#fef3c7"
  warning-text: "#92400e"
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: 0
  heading:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0
  body:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: 0
  label:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.14em
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  page-x: 24px
  page-y: 48px
components:
  page-shell:
    maxWidth: 72rem
    paddingX: "{spacing.page-x}"
    paddingY: "{spacing.page-y}"
  index-row:
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    backgroundColor: "{colors.surface}"
  chip:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.full}"
---

# Jarvis Hub Interface System

## Overview

Jarvis Hub should feel like a maintained technical archive rather than a generic portfolio template. The interface is quiet, editorial, and index-driven: pages should help visitors scan projects, notes, roles, dates, and technologies quickly.

Avoid oversized marketing sections, decorative blobs, and one-off visual effects. Prefer structured lists, restrained cards, compact metadata, clear type hierarchy, and a small set of recurring components.

## Colors

Use a warm off-white background with white or near-white surfaces. Primary text is near-black, secondary text is neutral gray, and accents are limited to deep cyan-green and muted brass.

Use `accent-cyan` for interactive focus, hover states, active navigation, and technical emphasis. Use `accent-violet` sparingly for secondary emphasis and project-oriented highlights. Do not introduce saturated purple-blue gradients or large single-hue backgrounds.

## Typography

Use `Space Grotesk` for headings, labels that need strength, project titles, and navigation. Use `Newsreader` for long-form body copy and article prose. Use `IBM Plex Mono` for dates, status labels, metadata, counters, and small system text.

Do not use negative letter spacing. Large display headings can be visually strong, but compact panels, cards, and rows should use modest heading sizes.

## Layout

Pages should be index-like and scannable:

- Use a constrained content width around `72rem`.
- Use clear horizontal dividers for archive lists and metadata rows.
- Use cards only for repeated items, framed tools, or focused feature entries.
- Prefer dense but readable lists over decorative grids when content volume is low.
- Keep mobile layouts single-column with stable spacing and no overlapping text.

## Elevation & Depth

Depth is subtle. Prefer borders, tonal surfaces, and hover color changes over heavy shadows. Shadows may be used lightly for overlays or important floating panels, but page sections should not look like stacked cards.

## Shapes

Use restrained rounding:

- `8px` for compact cards and buttons.
- `12px` to `16px` for feature entries and panels.
- `9999px` only for chips, status pills, and small tags.

Do not overuse large rounded cards. The site should feel structured and engineered, not bubbly.

## Components

### Header Navigation

Navigation is minimal. Active links should be clear through text color and `aria-current`, not through large backgrounds.

### Index Pages

Projects and blogs should use an archive/index model:

- A short kicker label.
- A large page title.
- A small stats panel.
- Optional chip strip for topics or technologies.
- Main content as rows, feature entries, or dense lists.

### Project Entries

Feature entries should show title, status, date, role, summary, and stack. Use a real cover image when available. If no image exists, use a simple typographic monogram rather than a decorative illustration.

### Blog Entries

Blog rows should prioritize date, title, description, reading time, and tags. They should scan like notes, not news cards.

### Chips And Tags

Chips are secondary metadata. They should use subtle borders and quiet backgrounds. On hover, shift toward `accent-cyan` without becoming visually dominant.

## Do's and Don'ts

Do:

- Keep interfaces calm, structured, and useful.
- Use metadata to make pages easier to scan.
- Reuse the same status, chip, row, and panel patterns across pages.
- Preserve the warm neutral background and restrained accent palette.
- Design for real content density, especially project and blog indexes.

Don't:

- Add decorative gradient blobs, bokeh, or unrelated SVG illustrations.
- Turn every section into a floating card.
- Use large marketing hero layouts for archive pages.
- Introduce new accent colors unless they map to a clear semantic state.
- Let text wrap awkwardly inside buttons, tags, or metadata panels.
