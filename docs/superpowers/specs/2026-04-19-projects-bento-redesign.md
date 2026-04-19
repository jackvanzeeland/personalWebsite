# Projects Page Bento Redesign

**Date:** 2026-04-19
**Status:** Approved
**Audience:** Recruiters and hiring managers (primary), technical peers (secondary)

---

## Goal

Replace the current equal-weight project grid with a layout that immediately communicates which projects are most significant, while still showing the complete catalog of 10 projects without requiring any interaction.

---

## Data Layer

### Project type (`src/types/index.ts`)
Add an optional `featured` boolean field to the `Project` interface.

### Projects data (`src/data/projects.ts`)
Mark exactly three projects with `featured: true`:
- **Budget Tracker** — full-stack finance app (React, Supabase)
- **Woku** — original hybrid game (TypeScript)
- **Super Bowl Competition** — scoring system (Python)

Array order: featured projects must appear first in the `PROJECTS` array (Budget Tracker → Woku → Super Bowl) so that filter-mode rendering falls back gracefully.

---

## Layout: Unfiltered State ("All")

### Zone 1 — Bento (featured 3)

A two-column asymmetric grid using CSS Grid, not Bootstrap columns.

```
┌─────────────────────┬──────────────┐
│                     │  Woku        │
│  Budget Tracker     │  (half)      │
│  (hero, full-left)  ├──────────────┤
│                     │  Super Bowl  │
│                     │  (half)      │
└─────────────────────┴──────────────┘
```

- **Left (hero card):** ~58% width. Image height 340px. Shows: image, title (`h3`), 2-sentence description (clamped), tech tags (up to 5), full CTA button.
- **Right column:** ~42% width, two cards stacked with a gap. Each card is exactly half the hero height. Shows: image (fills card), title overlay at bottom, tech tags (3 max), no description.
- **Breakpoint (< lg):** Right cards move below hero in a 2-column row.
- **Breakpoint (< md):** All three stack full-width vertically.

### Zone 2 — Compact grid (remaining 7)

Separated from Zone 1 by a thin divider with centered "More Work" label.

- Grid: 4 columns on desktop (`col-lg-3`), 2 on tablet (`col-md-6`), 1 on mobile.
- Each card: 140px fixed-height image, title, 2–3 tech tags. No description text.
- On hover: card lifts (`translateY(-5px)`), accent-color `View →` label fades in at the bottom of the card content area.
- Category accent stripe (3px top border) retained from current implementation.

---

## Layout: Filtered State

When any category filter is active:
- The bento collapses entirely.
- All matching projects (featured or not) render in the compact 4-column grid.
- The "More Work" divider is hidden.
- A "Showing X results" count appears below the filter dropdown.

When filter is cleared, bento restores.

---

## Filter

### Replacement for pill-wall

A single styled dropdown button replaces all filter pills. Positioned right-aligned above Zone 1.

- **Default label:** `All Categories ▾`
- **Active label:** `{Category} ×` (click × to clear)
- Implemented as a custom button + absolutely positioned list (not a native `<select>`) to allow full CSS control.
- Options derived dynamically from tag data (same as current).
- Small and visually quiet — `font-size: 0.82rem`, secondary text color, minimal border.

### No filter bar container

The old `.projects-filter-bar` panel (background, border, padding) is removed. The dropdown floats above the bento with no surrounding box.

---

## Component Changes

### `src/types/index.ts`
- Add `featured?: boolean` to `Project` interface.

### `src/data/projects.ts`
- Add `featured: true` to Budget Tracker, Woku, Super Bowl Competition.
- Reorder array: featured three first, then remaining seven.

### `src/components/ProjectGrid.ts`
- Split projects into `featured[]` and `rest[]` on load.
- `renderProjects()`: if no filter active, call `renderBento(featured)` + `renderCompactGrid(rest)`; if filter active, call `renderCompactGrid(matches)`.
- `renderBento()`: builds the CSS Grid bento structure with hero card + two stacked right cards.
- `renderCompactGrid()`: renders 4-column compact cards (image + title + tags + hover CTA).
- Replace filter pill logic with `renderFilterDropdown()` that builds a custom dropdown.
- Show/hide the "More Work" divider based on filter state.

### `src/styles/components/projects.css`
- Add `.bento-grid`, `.bento-hero`, `.bento-stack`, `.bento-side-card` styles.
- Add `.compact-card` styles (distinct from current `.project-card`).
- Add `.filter-dropdown` styles.
- Remove `.projects-filter-bar`, `.filter-label-text`, `.projects-count` (pill-bar remnants).
- Retain category accent classes (`cat-python`, etc.) and `.project-card` base for detail pages.

### `pages/projects.html`
- Remove `id="filter-buttons"` div.
- Add `id="filter-dropdown-wrapper"` div (right-aligned, above bento).
- Add `id="bento-grid"` div.
- Add `id="more-work-divider"` div (hidden by default, shown when bento is visible).
- Retain `id="projects-grid"` for the compact grid.

---

## Out of Scope

- Project detail pages — no changes.
- The `featured` flag affects only the projects list page rendering.
- No animations beyond existing AOS fade-up and hover transitions.
