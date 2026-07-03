# Dark Cinematic Redesign — Design Spec

**Date:** 2026-07-03
**Status:** Approved by Jack (brainstorming session)
**Supersedes:** the Bootstrap-based layout; builds on the experience layer from PR #1

## Why

The PR #1 experience layer (ambient particles, JVZ hero, cinematic timeline) proved the direction, but layering WebGL onto the existing Bootstrap style produced a mismatch: the effects and the layout don't feel like one designed thing. Decision: abandon the existing style/layout entirely and rebuild the site *around* three.js. Hard constraint: **preserve all existing content** — projects, interactive tools, timeline, photos, artifacts, resume.

## Decisions (locked with Jack)

| Decision | Choice |
|---|---|
| Aesthetic | Dark cinematic space (near-black, glowing particles, depth) |
| Architecture | SPA shell with one persistent living scene |
| Tooling | Vanilla TS + hand-rolled history-API router (~100 lines); same Vite build |
| Experience metaphor | **Morphing particle stage**: one fullscreen particle system morphs into a signature formation per section; content scrolls over it as glass panels |
| Site structure | Consolidated 5 sections (see Routes) |
| Theming | **Dark only** — theme toggle removed; `theme_switcher` achievement retired/easter-egged |
| Rollout | Build complete on a `redesign` branch; single cutover PR; live site untouched meanwhile |

## Design language

- **Canvas:** near-black navy `#04070f`; particle hues cyan `#38bdf8` / teal `#34d399` / indigo `#818cf8` (existing brand hues, dark-first)
- **Type:** Space Grotesk (self-hosted, already in repo) for display; monospace for eyebrows/nav/stats/labels ("engineered" voice); system sans body
- **Panels:** 1px `rgba(148,163,184,.16)` borders, glass blur (`backdrop-filter`), generous spacing; content always on a legible surface
- **Section accents:** each route owns one accent color; the particle system recolors on navigation (home cyan, work indigo, journey teal, beyond warm, contact cyan)
- **Nav:** fixed minimal bar — `JVZ` mono wordmark + numbered mono links (`01 HOME … 05 CONTACT`)
- Reference mockup: `docs/superpowers/specs/2026-07-03-dark-cinematic-redesign-mockup.html`

## Routes & content mapping (nothing lost)

| New route | Formation | Content absorbed from today |
|---|---|---|
| `/` | JVZ monogram | index.html hero, stats, featured work |
| `/work` | Project lattice | pages/projects + pages/artifacts, merged into one filterable grid (`kind: project \| artifact` field); data from projects.json/ts + artifacts.ts |
| `/work/:slug` | Lattice, focused | 5 project detail pages + 3 artifact pages + interactive tools (Wordle solver, Secret Santa, lyric animator) as mounted views |
| `/journey` | Career constellation (sampled from timeline.json dates) | pages/about: bio, skills (resume.json), career timeline, resume download |
| `/beyond` | Photo-dust nebula | pages/beyond-the-code: PhotoGallery, InstagramGallery, MediaAccordion |
| `/contact` | Signal wave | LinkedIn/GitHub/email/resume links (today scattered in footers/about) |

- Achievements/journey tracking (`src/utils/journey.ts`) survives as a **site-wide easter egg** (corner tracker + unlock toasts), not a page.
- **Redirects:** every current URL (`/pages/about`, `/pages/projects/wordle-solver.html`, …) 301s to its new home via CloudFront function; sitemap.xml regenerated.
- SPA deep links: CloudFront 403/404 → `/index.html` (200); router resolves the path. Router updates `document.title`, meta description, canonical, and OG tags per route.

## Architecture

```
src/
  app/router.ts          — history-API router; route table; meta updates; emits route events
  app/views/             — one module per route: mount(el)/unmount(); home.ts, work.ts,
                           workDetail.ts, journey.ts, beyond.ts, contact.ts
  scene/SceneDirector.ts — singleton: renderer, camera, ~4000-particle system, RAF loop,
                           morphTo(formation, accent), pause()/resume(), pointer forces
  scene/formations/      — one module per formation returning Float32Array targets:
                           monogram.ts (text sampling, reuse HeroParticles technique),
                           lattice.ts, constellation.ts (from timeline.json),
                           nebula.ts, signalWave.ts
  scene/tiers.ts         — reuse src/utils/capabilities.ts unchanged
  styles/                — new token file (dark-only) + per-view CSS; Bootstrap REMOVED
```

- **Morph mechanics:** per-particle start→target interpolation with staggered delays (seeded), accent color lerp, ~1.6s; scroll adds gentle parallax; pointer repulsion on high tier (reuse shader approach from AmbientScene/HeroParticles).
- **Ported, not rewritten:** WordleSolver.ts, SecretSanta.ts, PhotoGallery.js, InstagramGallery.js, MediaAccordion.js, Timeline rendering/filter logic, ResumeManager.ts, journey.ts, optimizedImage.ts + sharp pipeline. Markup/CSS around them is new; logic untouched.
- **Bootstrap and AOS are removed** (CDN tags and npm deps). Grid → CSS grid/flex; reveals → small IntersectionObserver util; components that used Bootstrap JS (accordion, toggler) get ~20-line vanilla replacements.
- **Lyric animator** has its own canvas: its view calls `SceneDirector.pause()` on mount, `resume()` on unmount.

## Degradation & performance (carried from PR #1, still binding)

- Tier `none` (reduced-motion / save-data / no WebGL): no canvas at all; static gradient background; all content fully readable — the site works completely without the scene.
- Tier `low` (phones/weak CPUs): fewer particles, 30fps cap, no pointer forces, scene mounts after first interaction.
- three.js stays an async chunk fetched post-first-paint; content renders before the scene exists (scene fades in around it).
- Budgets: Lighthouse mobile perf ≥ 90 on `/`, `/work`, `/journey`; LCP < 2.5s; CLS < 0.1; sharp image pipeline and font strategy unchanged.
- Contrast: text on glass panels must meet WCAG AA against the darkest and brightest particle states.

## Testing

- **First real vitest suite:** router (parsing, redirects, meta), formation target generation (counts, bounds, determinism), timeline date math — **fix the existing UTC/local off-by-one-month bug** (`new Date('YYYY-MM-DD')` parsed UTC, formatted local) as part of porting.
- Playwright pass per milestone: every route direct-loaded and client-navigated, tools exercised (Wordle solve, Secret Santa flow), reduced-motion emulation, mobile viewport.
- Lighthouse gates per milestone as above.

## Out of scope

- New content (copy edits beyond what migration requires)
- Blog/CMS, analytics changes, backend anything
- Light theme
- Prerendering/SSG (revisit only if SEO measurably suffers post-launch)

## Open items carried along

- timeline.json drafted descriptions still awaiting Jack's review (uncommitted in working tree)
- Old `dist/` artifacts committed in git history — ignore, already gitignored going forward
