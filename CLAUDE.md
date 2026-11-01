# Claude Code Guide — jackvanzeeland.com

Vanilla TypeScript + Vite personal portfolio SPA. No frontend framework — a
history-API router (`src/app/router.ts`) mounts plain `View` modules. See
[MAPPING.md](MAPPING.md) for routes/component tree and [AGENTS.md](AGENTS.md)
for which agent to use for which kind of change.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 3000) |
| `npm run build` | image pipeline → redirect gen → `tsc` → `vite build` → prerender (per-page HTML + `sitemap.xml`) |
| `npm test` | `vitest run` (happy-dom, `tests/**/*.test.ts`) |
| `npm run test:watch` | vitest watch mode |
| `npm run lint` | `eslint . --max-warnings 0` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run og:images` | regenerate the committed 1200×630 share images in `public/og/` (run after changing a project's title/thumbnail) |
| `npm run optimize:images` | rebuild `public/images/opt/` AVIF/WebP variants (gitignored, not run by `dev`) |
| `npm run deploy` / `deploy:prod` | `./deploy.sh` |

Run `lint` + `typecheck` + `test` before calling anything done — none of them run automatically on save.

## Conventions

| Rule | Pattern | Example |
|------|---------|---------|
| View modules | camelCase, default-export a `View` (`mount`/`unmount`) | `src/app/views/workDetail.ts` |
| Formations | camelCase, pure/deterministic, unit-tested | `src/scene/formations/nebula.ts` |
| Legacy `.js` components | untyped by design, invisible to `tsc` and `*.ts` greps | `src/components/PhotoGallery.js` |
| Path aliases | `@/components`, `@/utils`, `@/data`, `@/types` (`vite.config.ts`) | `import x from '@/utils/dates'` |
| Styles | one file per view under `src/styles/redesign/`, dark-only, token-driven | `src/styles/redesign/journey.css` |
| Tests | co-located in `tests/`, named after the module under test | `tests/views-workDetail.test.ts` |

## Patterns

- **Legacy redirects have one source of truth**: edit `src/app/legacyRedirects.mjs`
  only. `scripts/generate-redirects.mjs` regenerates
  `infrastructure/spa-router-function.js` from it, and `tests/redirects-sync.test.ts`
  fails the build if they drift.
- **The particle scene is persistent, not per-view**: `scene/stage.ts` mounts once
  in `main.ts` and morphs formations on navigation — don't mount/unmount three.js
  from inside a view module.
- **Everything must degrade gracefully**: reduced-motion, save-data, and no-WebGL
  visitors get the static site with no three.js download (`src/utils/capabilities.ts`
  gates this). Check that gate before adding anything scene-related.
- **Every page is prerendered at build time**: `scripts/prerender.ts` (vite-node +
  happy-dom) mounts each route from `src/site/routes.ts` and writes
  `dist/<route>/index.html` plus `dist/sitemap.xml`. All head tags (title,
  description, canonical, OG/X, JSON-LD) come from `src/app/seo.ts`, the same module
  the router and `workDetail` use on client navigation, so they can't drift. Page
  copy lives in `src/app/routeMeta.ts`, and a project's `seoDescription` in
  `src/data/projects.ts`. New routes or projects get picked up automatically;
  `tests/seo.test.ts` checks length limits, uniqueness, and that each page's
  `public/og/` image exists.
- **Every project declares `imageStyle`** (`"icon"` for logos and app tiles shown
  contained, `"cover"` for photos and artwork cropped full-bleed) in
  `src/data/projects.ts`. Cards and share images both read it, and TypeScript
  requires it. After changing it, rerun `npm run og:images`.
- **Reveal animations are gated on `.js`** (an inline script in `index.html`) so
  prerendered content stays visible without JavaScript. Keep any new hide-until-JS
  CSS behind `.js`.
- **Image variants are build-generated, not source**: `public/images/opt/` and
  `src/generated/imageManifest.ts` come from `scripts/optimize-images.mjs`. A fresh
  checkout shows broken `<picture>` sources until you run `npm run optimize:images`.
- **`data/analytics/*.json` and `data/temp_audio/*.mp3` are gitignored on purpose**
  (visitor privacy / scratch downloads) — don't force-add them.

## Do Not

- Don't hand-edit the CloudFront function block in `infrastructure.yaml` — regenerate
  it from `legacyRedirects.mjs` via `scripts/generate-redirects.mjs`.
- Don't apply the CloudFront function before the prerendered pages are deployed:
  it serves `/<path>/index.html`, which only exists after a site deploy. Deploy the
  site first, then update the stack.
- Don't assume CI applies infrastructure changes: **GitHub Actions only syncs
  `dist/` to S3 and invalidates CloudFront** — a changed `infrastructure.yaml` needs
  a manual CloudFormation stack update before its redirects take effect.
- Don't add committed build artifacts. This repo previously carried an orphaned
  `__pycache__/*.pyc` from an earlier Flask/Gunicorn iteration (now removed) — the
  `.gitignore`'s Python/Gunicorn/`wsgi.py` rules are vestiges of that era, kept in
  case any script still touches them, not evidence the stack uses Python.
- Don't rely on this repo being outside iCloud Drive — it's intentionally kept in
  `~/Library/Mobile Documents/com~apple~CloudDocs/...`. Watch for iCloud-spawned
  `"name 2.ext"` duplicate files after a merge/pull; sweep and delete them, they
  silently break `tsc`.

## Session start

This repo has a `Stop` hook (`.claude/hooks/auto-commit.sh`) that auto-commits any
`Edit`/`Write`/`MultiEdit` changes when a session ends — you generally don't need to
commit manually here. It also runs `cc-sessions` (`sessions/`), a separate task/
protocol framework; its own `sessions/CLAUDE.sessions.md` governs task workflow and
is orthogonal to this file.
