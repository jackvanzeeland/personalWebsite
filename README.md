# jackvanzeeland.com

Personal portfolio of Jack Van Zeeland — a dark-cinematic single-page app
built around one persistent three.js particle scene that morphs into a
signature formation for each section.

## The experience

- **One living scene**: ~4,000 particles behind every page. Navigating morphs
  them — the "JVZ" monogram on home, a project lattice on `/projects`, a career
  constellation built from the actual timeline data on `/journey`, a photo
  nebula on `/beyond`, a signal wave on `/contact` — with a staggered ease
  and an accent recolor per section.
- **Everything degrades gracefully**: reduced-motion, save-data, or no-WebGL
  visitors never download three.js and get a fully readable static site.
  Phones get fewer particles and only mount the scene after first interaction.
- **Interactive tools ported intact**: the Wordle solver, Secret Santa
  matcher, and lyric animator run as views inside the SPA.

## Stack

- **Vanilla TypeScript + Vite** — no framework; a ~150-line history-API
  router (`src/app/router.ts`) drives view modules with `mount`/`unmount`
- **three.js** — `src/scene/SceneDirector.ts` owns the renderer; formations
  live in `src/scene/formations/` (deterministic, unit-tested)
- **sharp** — build-time image pipeline (`scripts/optimize-images.mjs`)
  emitting AVIF/WebP responsive variants
- **vitest + happy-dom** — router, formations, data adapters, timeline
  rendering (including timezone regression tests)

## Structure

```
index.html                  single entry (404.html is the S3 SPA fallback)
src/app/                    router, shell, nav, footer, views/
src/scene/                  SceneDirector, formations, capability facade
src/components/             ported tools (WordleSolver, SecretSanta, galleries, Timeline)
src/data/                   projects/artifacts sources + workItems adapter
src/styles/redesign/        design tokens + per-view CSS (dark only)
scripts/                    image pipeline, redirect + sitemap generators
infrastructure.yaml         S3 + CloudFront (SPA routing function, legacy 301s)
public/data/timeline.json   career timeline (drives /journey and its constellation)
```

## Commands

```bash
npm run dev          # vite dev server
npm run build        # image pipeline + generators + tsc + vite build
npm test             # vitest run
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
```

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds and syncs `dist/` to
S3, then invalidates CloudFront. SPA deep links and legacy-URL 301s are
handled by a CloudFront Function generated from `src/app/legacyRedirects.mjs`
(`scripts/generate-redirects.mjs` keeps `infrastructure.yaml` in sync;
`tests/redirects-sync.test.ts` enforces it). Infrastructure changes are
applied via CloudFormation (`infrastructure.yaml`).

## Performance

Lighthouse mobile (build-time gate): **100** on `/`, `/projects`, `/journey` —
LCP ≤ 1.7s, CLS 0. three.js ships as an async chunk after first paint;
the entry bundle is ~16KB raw.
