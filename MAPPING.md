# Navigation & Routes — jackvanzeeland.com

Single-page app. `src/app/router.ts` matches the path, `src/app/main.ts` mounts the
matching view module into `#view-root`. Every route also drives one accent color and
one persistent three.js particle formation (`src/scene/stage.ts`).

## Routes

| Path | Route name | View module | Formation | Accent |
|------|-----------|-------------|-----------|--------|
| `/` | `home` | `src/app/views/home.ts` | `monogram` (JVZ) | `#38bdf8` blue |
| `/projects` | `work` | `src/app/views/projects.ts` | `lattice` | `#818cf8` indigo |
| `/projects/:slug` | `workDetail` | `src/app/views/workDetail.ts` | `lattice` | `#818cf8` indigo |
| `/journey` | `journey` | `src/app/views/journey.ts` | `constellation` (from `public/data/timeline.json`) | `#34d399` green |
| `/beyond` | `beyond` | `src/app/views/beyond.ts` (DOM built by `beyondContent.ts`) | `nebula` | `#fbbf24` amber |
| `/contact` | `contact` | `src/app/views/contact.ts` | `signalWave` | `#38bdf8` blue |
| anything else | `notFound` | inline 404 markup in `main.ts` | — | — |

Legacy URLs (old `.html` paths, old `/assets/...` paths) 301-redirect via
`src/app/legacyRedirects.mjs` — the single source of truth, generated into
`infrastructure/spa-router-function.js` for the CloudFront Function
(`scripts/generate-redirects.mjs`, enforced by `tests/redirects-sync.test.ts`).

## Shell / component tree

```
index.html
├── #nav-root      ← nav.ts renderNav(activeRoute)     (re-rendered on every route change)
├── #view-root      ← current view's mount(root, params)
│   ├── home.ts
│   ├── projects.ts               (project/artifact cards, filterable by tag)
│   ├── workDetail.ts             (project detail; conditionally mounts an embedded tool)
│   │   ├── components/WordleSolver.ts    (item.tool === "wordle-solver")
│   │   ├── components/SecretSanta.ts     (item.tool === "secret-santa")
│   │   └── views/tools/lyricMarkup.ts + lyricAnimatorCore.ts  (item.tool === "lyric-animator")
│   ├── journey.ts                 (skills grid + timeline)
│   │   ├── components/Timeline.ts        (renders public/data/timeline.json)
│   │   └── components/ResumeManager.ts   (resume download)
│   ├── beyond.ts + beyondContent.ts (DOM builder)
│   │   ├── components/PhotoGallery.js
│   │   ├── components/InstagramGallery.js
│   │   └── components/MediaAccordion.js
│   └── contact.ts
└── #footer-root   ← footer.ts renderFooter()

scene/stage.ts → scheduleScene()   (mounted once by main.ts, outlives route changes)
└── SceneDirector.ts owns the renderer; morphs between scene/formations/*.ts on navigation
    ├── monogram.ts · lattice.ts · constellation.ts · nebula.ts · signalWave.ts
```

## Data sources

| File | Feeds | Notes |
|------|-------|-------|
| `src/data/projects.ts` | `/projects`, `/projects/:slug` | project copy, tags, `tool`/`page` keys that select an embedded artifact |
| `src/data/workItems.ts` | `/projects` filtering | tag → tool/page lookup tables |
| `public/data/timeline.json` | `/journey` | career timeline; drives both the Timeline component and the constellation formation |
| `src/generated/imageManifest.ts` | `optimizedImage.ts` | build-generated AVIF/WebP variant map from `scripts/optimize-images.mjs` |

## View module contract

Every entry in `main.ts`'s `viewLoaders` default-exports a `View`
(`src/app/views/types.ts`): `mount(root: HTMLElement, params) => void | Promise<void>`
and `unmount() => void`. `main.ts` awaits `mount`, calls `initReveals(viewRoot)` for
scroll-reveal animation, then `markPageAsVisited()`.
