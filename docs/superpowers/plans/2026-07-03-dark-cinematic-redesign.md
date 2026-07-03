# Dark Cinematic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild jackvanzeeland.com as a dark-only SPA around one persistent three.js particle scene that morphs into a signature formation per section, preserving all existing content.

**Architecture:** Single Vite entry + hand-rolled history-API router; `SceneDirector` singleton owns ~4000 particles and a `morphTo(formation, accent)` API; views are `mount/unmount` TS modules rendering glass panels over the canvas; existing interactive components port logic-untouched. Bootstrap/AOS removed.

**Tech Stack:** Vanilla TypeScript, Vite 6, three.js (existing), GSAP (existing, timeline only), vitest + happy-dom, sharp image pipeline (existing).

**Spec:** `docs/superpowers/specs/2026-07-03-dark-cinematic-redesign-design.md`

## Global Constraints

- Dark only: background `#04070f`; accents cyan `#38bdf8`, teal `#34d399`, indigo `#818cf8`
- Type: Space Grotesk (already at `assets/fonts/SpaceGrotesk-latin-var.woff2`) for display; monospace eyebrows/nav/stats; system sans body
- Routes: `/`, `/work`, `/work/:slug`, `/journey`, `/beyond`, `/contact` — old URLs must 301/redirect
- Capability tiers from `src/utils/capabilities.ts` are binding: tier `none` → no canvas ever; `low` → reduced particles, mount after first interaction
- three.js/gsap stay async chunks loaded post-first-paint; content renders before the scene
- Budgets: Lighthouse mobile ≥ 90 on `/`, `/work`, `/journey`; CLS < 0.1
- All content preserved: projects, artifacts, tools (Wordle/Secret Santa/lyric animator), timeline, photos, resume
- Work on branch `redesign` (off `dev`); never push to `main`
- Every commit: typecheck + lint + affected tests green

---

### Task 1: Branch, vitest setup, first test

**Files:**
- Create: `tests/setup-sanity.test.ts`
- Modify: `package.json` (add `happy-dom` devDep), `vite.config.ts` (vitest `test` block)

**Interfaces:**
- Produces: working `npm test` with happy-dom environment; `redesign` branch

- [ ] **Step 1: Branch**

```bash
git checkout dev && git checkout -b redesign
```

- [ ] **Step 2: Install happy-dom, configure vitest**

```bash
npm install -D happy-dom
```

In `vite.config.ts` add top-level (with `/// <reference types="vitest/config" />` at file head):

```ts
test: {
  environment: 'happy-dom',
  include: ['tests/**/*.test.ts']
},
```

- [ ] **Step 3: Write sanity test** (`tests/setup-sanity.test.ts`)

```ts
import { describe, it, expect } from 'vitest';

describe('test environment', () => {
  it('has a DOM', () => {
    document.body.innerHTML = '<p id="x">hi</p>';
    expect(document.getElementById('x')?.textContent).toBe('hi');
  });
});
```

- [ ] **Step 4: Run** `npm test` → 1 passed
- [ ] **Step 5: Commit** `chore: vitest + happy-dom test environment on redesign branch`

---

### Task 2: Dark design tokens and base styles

**Files:**
- Create: `src/styles/redesign/tokens.css`, `src/styles/redesign/base.css`
- Test: visual (dev server), no unit tests for CSS

**Interfaces:**
- Produces: CSS custom properties `--bg`, `--panel`, `--line`, `--text`, `--text-dim`, `--accent`, `--accent-cyan/teal/indigo/warm`, `--font-display`, `--font-mono`; classes `.panel`, `.eyebrow`, `.btn-glow`, `.btn-ghost`, `.container-x`

- [ ] **Step 1: Write `tokens.css`**

```css
:root {
  --bg: #04070f;
  --bg-raise: #0a1020;
  --panel: rgba(10, 16, 32, 0.62);
  --line: rgba(148, 163, 184, 0.16);
  --text: #e2e8f0;
  --text-bright: #f1f5f9;
  --text-dim: #94a3b8;
  --text-faint: #64748b;
  --accent-cyan: #38bdf8;
  --accent-teal: #34d399;
  --accent-indigo: #818cf8;
  --accent-warm: #fbbf24;
  --accent: var(--accent-cyan); /* router sets per route */
  --font-display: 'Space Grotesk', -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
  --font-body: -apple-system, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 2: Write `base.css`** — reset, body bg/text, `@font-face` (copy the Space Grotesk face + fallback block from `src/styles/main.css` lines appended in Phase 5 of PR #1), heading font-family, and:

```css
.container-x { width: min(1120px, 100% - 48px); margin-inline: auto; }
.panel { background: var(--panel); border: 1px solid var(--line);
  border-radius: 12px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: .25em;
  text-transform: uppercase; color: var(--accent); }
.btn-glow { padding: 12px 24px; border-radius: 4px; background: var(--accent);
  color: #0b1120; font-weight: 600; border: 1px solid var(--accent);
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 35%, transparent); }
.btn-ghost { padding: 12px 24px; border-radius: 4px; color: var(--text);
  border: 1px solid rgba(148,163,184,.35); background: transparent; }
a { color: var(--accent-cyan); }
```

- [ ] **Step 3: Commit** `feat(redesign): dark design tokens and base styles`

---

### Task 3: Router (TDD)

**Files:**
- Create: `src/app/router.ts`
- Test: `tests/router.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface RouteMatch { name: RouteName; params: Record<string, string>; path: string }
  export type RouteName = 'home' | 'work' | 'workDetail' | 'journey' | 'beyond' | 'contact' | 'notFound';
  export function matchRoute(path: string): RouteMatch;
  export function legacyRedirect(path: string): string | null; // old URL -> new path
  export function navigate(path: string): void;                // pushState + dispatch
  export function startRouter(onRoute: (m: RouteMatch) => void): void; // popstate + link interception + initial dispatch (applies legacyRedirect via replaceState)
  export const routeMeta: Record<RouteName, { title: string; description: string; accent: string }>;
  ```

- [ ] **Step 1: Write failing tests** (`tests/router.test.ts`)

```ts
import { describe, it, expect } from 'vitest';
import { matchRoute, legacyRedirect } from '../src/app/router';

describe('matchRoute', () => {
  it('matches static routes', () => {
    expect(matchRoute('/').name).toBe('home');
    expect(matchRoute('/work').name).toBe('work');
    expect(matchRoute('/journey').name).toBe('journey');
    expect(matchRoute('/beyond').name).toBe('beyond');
    expect(matchRoute('/contact').name).toBe('contact');
  });
  it('matches work detail with slug param', () => {
    const m = matchRoute('/work/wordle-solver');
    expect(m.name).toBe('workDetail');
    expect(m.params.slug).toBe('wordle-solver');
  });
  it('ignores trailing slashes', () => {
    expect(matchRoute('/work/').name).toBe('work');
  });
  it('unknown paths are notFound', () => {
    expect(matchRoute('/nope/nope').name).toBe('notFound');
  });
});

describe('legacyRedirect', () => {
  it('maps every old page to its new home', () => {
    expect(legacyRedirect('/pages/about')).toBe('/journey');
    expect(legacyRedirect('/pages/about.html')).toBe('/journey');
    expect(legacyRedirect('/pages/journey')).toBe('/journey');
    expect(legacyRedirect('/pages/projects')).toBe('/work');
    expect(legacyRedirect('/pages/artifacts')).toBe('/work');
    expect(legacyRedirect('/pages/beyond-the-code')).toBe('/beyond');
    expect(legacyRedirect('/pages/projects/wordle-solver.html')).toBe('/work/wordle-solver');
    expect(legacyRedirect('/pages/projects/secret-santa.html')).toBe('/work/secret-santa');
    expect(legacyRedirect('/pages/projects/lyric-animator.html')).toBe('/work/lyric-animator');
    expect(legacyRedirect('/pages/projects/budgeting-automation.html')).toBe('/work/budgeting-automation');
    expect(legacyRedirect('/pages/projects/basketball-optimization.html')).toBe('/work/basketball-optimization');
    expect(legacyRedirect('/pages/artifacts/qr-code-generator.html')).toBe('/work/qr-code-generator');
    expect(legacyRedirect('/pages/artifacts/uipath-queue-processor.html')).toBe('/work/uipath-queue-processor');
    expect(legacyRedirect('/pages/artifacts/html-gems.html')).toBe('/work/html-gems');
    expect(legacyRedirect('/work')).toBeNull();
  });
});
```

- [ ] **Step 2: Run** `npm test -- router` → FAIL (module not found)
- [ ] **Step 3: Implement `src/app/router.ts`** — route table as array of `{ name, pattern: RegExp }`, `legacyRedirect` as a Record lookup after stripping `.html` and trailing `/`; `startRouter` intercepts same-origin `<a>` clicks (no modifier keys, no `target`, no `data-external`), applies `legacyRedirect` on initial load via `history.replaceState`, sets `document.title`/meta description/canonical from `routeMeta`, sets `document.documentElement.style.setProperty('--accent', meta.accent)`, dispatches to `onRoute`, and scrolls to top on navigation.
- [ ] **Step 4: Run** `npm test -- router` → PASS
- [ ] **Step 5: Commit** `feat(redesign): history-API router with legacy URL redirects`

---

### Task 4: App shell — single entry, nav, view registry

**Files:**
- Create: `src/app/main.ts`, `src/app/nav.ts`, `src/app/views/types.ts`, `src/styles/redesign/nav.css`
- Modify: `index.html` (full rewrite), `vite.config.ts` (rollup inputs → `main` + `404` only), `404.html` (SPA loader)
- Test: `tests/nav.test.ts` + manual dev-server pass

**Interfaces:**
- Consumes: `startRouter`, `matchRoute`, `routeMeta` (Task 3)
- Produces:
  ```ts
  // views/types.ts
  export interface View { mount(el: HTMLElement, params: Record<string,string>): void | Promise<void>; unmount(): void }
  // nav.ts
  export function renderNav(active: RouteName): HTMLElement; // fixed bar: JVZ wordmark + numbered mono links
  ```
  `index.html` body: `<div id="scene-root"></div><nav id="nav-root"></nav><main id="view-root"></main><footer id="footer-root"></footer>`

- [ ] **Step 1: Failing test** (`tests/nav.test.ts`): `renderNav('work')` returns element containing 5 links with `href` `/`, `/work`, `/journey`, `/beyond`, `/contact`, numbered labels `01–05`, and `aria-current="page"` on the active one.
- [ ] **Step 2: Run** → FAIL
- [ ] **Step 3: Implement nav + shell.** `main.ts`: import tokens/base/nav css; view registry `Record<RouteName, () => Promise<View>>` using dynamic imports (`() => import('./views/home')`); `startRouter` callback unmounts previous view, mounts next into `#view-root`, re-renders nav. Rewrite `index.html`: keep CSP/OG/JSON-LD/meta patterns from the old file but reference only `/src/app/main.ts`; remove Bootstrap/AOS/theme-toggle markup; keep the theme-boot script REMOVED (dark only — instead `<html data-theme="dark">` hardcoded until Task 12 removes the attribute entirely). `404.html`: minimal dark page + inline `location.replace('/' + '?p=' + encodeURIComponent(location.pathname))` fallback for S3-website mode, and router reads `?p=` on boot (add to `startRouter`).
- [ ] **Step 4: Trim `vite.config.ts` rollupOptions.input** to `{ main: 'index.html', '404': '404.html' }`. Old `pages/**.html` stay on disk (git history + redirect targets served by CloudFront function later) but are no longer built.
- [ ] **Step 5: Run** `npm test` + `npm run dev` → shell renders: nav + empty main over dark bg, console error-free, route changes update title/accent.
- [ ] **Step 6: Commit** `feat(redesign): SPA shell, nav, single-entry build`

---

### Task 5: SceneDirector (persistent particle stage)

**Files:**
- Create: `src/scene/SceneDirector.ts`, `src/scene/formationTypes.ts`, `src/styles/redesign/scene.css`
- Test: `tests/formationTypes.test.ts` (pure parts only; WebGL is browser-verified)

**Interfaces:**
- Consumes: `getGraphicsTier` from `src/utils/capabilities.ts` (unchanged)
- Produces:
  ```ts
  // formationTypes.ts
  export interface Formation { targets: Float32Array /* len = 3*count */; accent: string; spread: number }
  export type FormationBuilder = (count: number, aspect: number) => Formation;
  export function seededRandom(seed: number): () => number; // mulberry32
  // SceneDirector.ts
  export function getDirector(): SceneDirector | null;      // null on tier 'none'
  export interface SceneDirector {
    morphTo(builder: FormationBuilder): void;  // 1.6s staggered ease, accent lerp
    pause(): void; resume(): void; destroy(): void;
  }
  ```
  Particle count: 4000 high / 1200 low. Canvas fixed, `z-index:-1`, fades in via `scene.css`.

- [ ] **Step 1: Failing test** for `seededRandom` (same seed → same sequence; values in [0,1)) and a trivial `Formation` shape check.
- [ ] **Step 2: Run** → FAIL
- [ ] **Step 3: Implement.** Port the renderer/material/lifecycle skeleton from `src/components/background/AmbientScene.ts` (visibility pause, reduced-motion live destroy, contextlost, pagehide, pixel-ratio clamp). New: shader gets `aStart`+`aTarget` attributes and `uMorph` uniform (0→1 per morph, per-particle stagger from `aSeed`, same easing approach as HeroParticles); `morphTo` copies current interpolated positions into `aStart`, writes new `targets` into `aTarget`, resets clock, tweens accent `Color`. Mount policy identical to PR #1: tier none → `getDirector()` returns null; low → build after first interaction; high → idle after load.
- [ ] **Step 4: Run tests** → PASS; dev-server visual check with a placeholder random-sphere formation.
- [ ] **Step 5: Commit** `feat(redesign): SceneDirector with morphable particle stage`

---

### Task 6: Formation library (TDD)

**Files:**
- Create: `src/scene/formations/monogram.ts`, `lattice.ts`, `constellation.ts`, `nebula.ts`, `signalWave.ts`, `src/utils/dates.ts`
- Test: `tests/formations.test.ts`, `tests/dates.test.ts`

**Interfaces:**
- Consumes: `Formation`, `FormationBuilder`, `seededRandom` (Task 5); `public/data/timeline.json` (constellation fetches at view level and passes items in — builder signature for constellation is `constellationBuilder(items: TimelineItem[]): FormationBuilder`)
- Produces: five `FormationBuilder`s; `parseLocalDate(iso: string): Date` (fixes the UTC off-by-one-month bug)

- [ ] **Step 1: Failing tests**

```ts
// tests/dates.test.ts
import { parseLocalDate } from '../src/utils/dates';
it('parses YYYY-MM-DD as LOCAL date (no UTC shift)', () => {
  const d = parseLocalDate('2024-02-01');
  expect(d.getFullYear()).toBe(2024);
  expect(d.getMonth()).toBe(1);  // February in every timezone
  expect(d.getDate()).toBe(1);
});

// tests/formations.test.ts — for each builder:
// targets.length === count*3; all coords within ±spread bounds;
// same (count, aspect) → identical Float32Array (determinism via seededRandom);
// monogram: >60% of targets cluster in the glyph bounding box;
// constellation: item count N ⇒ N anchor clusters ordered by parseLocalDate(startDate)
```

- [ ] **Step 2: Run** → FAIL
- [ ] **Step 3: Implement.** `monogram.ts` ports the offscreen-canvas text-sampling from `src/components/background/HeroParticles.ts` `sampleMonogram()` (happy-dom lacks canvas — gate the test with a fallback grid sampler used when `getContext` returns null, and assert on the fallback in unit tests; browser uses real sampling). `lattice.ts`: hex-grid nodes with jitter. `constellation.ts`: anchors on a time axis (x = normalized parseLocalDate range, y = seeded scatter, type-based z), remaining particles as dust between anchors. `nebula.ts`: 3 gaussian clusters. `signalWave.ts`: sine ribbon.
- [ ] **Step 4: Run** → PASS
- [ ] **Step 5: Commit** `feat(redesign): five particle formations + local-date parsing fix`

---

### Task 7: Home view

**Files:**
- Create: `src/app/views/home.ts`, `src/styles/redesign/home.css`
- Test: `tests/views-home.test.ts` + dev-server visual

**Interfaces:**
- Consumes: `View` (Task 4), `getDirector`/`monogramBuilder` (5–6), `PROJECTS` from `src/data/projects.ts`, `createOptimizedPicture` from `src/utils/optimizedImage.ts`
- Produces: default-exported `View`; markup per mockup (`docs/superpowers/specs/2026-07-03-dark-cinematic-redesign-mockup.html`): eyebrow `// AUTOMATION ENGINEER — CHICAGO`, display name, subtext, `.btn-glow` → `/work`, `.btn-ghost` → `/journey`, mono stats strip (22 automations / 48K+ hours / 87%), `SELECTED WORK` panel with the 3 featured projects (`PROJECTS.filter(p => p.featured)` top 3).

- [ ] **Step 1: Failing test:** mounting home into a div renders an `h1` containing "Jack Van Zeeland", 2 CTA links (`/work`, `/journey`), and 3 featured cards.
- [ ] **Step 2: Run** → FAIL
- [ ] **Step 3: Implement** (build DOM with `createElement`/template literals + `createOptimizedPicture` for card images; call `getDirector()?.morphTo(monogramBuilder)` in `mount`).
- [ ] **Step 4: Run** → PASS; visual pass at 1440px and 390px widths.
- [ ] **Step 5: Commit** `feat(redesign): home view with monogram formation`

---

### Task 8: Work view (merged lattice grid)

**Files:**
- Create: `src/app/views/work.ts`, `src/data/workItems.ts`, `src/styles/redesign/work.css`
- Test: `tests/workItems.test.ts`

**Interfaces:**
- Consumes: `PROJECTS` (`src/data/projects.ts`), `ARTIFACTS` (`src/data/artifacts.ts`), lattice builder, `createOptimizedPicture`
- Produces:
  ```ts
  // workItems.ts
  export interface WorkItem { slug: string; kind: 'project' | 'artifact'; title: string;
    description: string; technologies: string[]; tags: string[]; image?: string;
    links: { github?: string; demo?: string; external?: string };
    tool?: 'wordle-solver' | 'secret-santa' | 'lyric-animator' } // mounted interactive views
  export const WORK_ITEMS: WorkItem[];             // PROJECTS + ARTIFACTS normalized; slug from existing `page` field / artifact id
  export function getWorkItem(slug: string): WorkItem | undefined;
  export function allWorkTags(): string[];
  ```

- [ ] **Step 1: Failing tests:** `WORK_ITEMS` contains every `PROJECTS` entry and every `ARTIFACTS` entry (length check = sum); every item has unique non-empty slug; `getWorkItem('wordle-solver')!.tool === 'wordle-solver'`; `allWorkTags()` deduped and sorted.
- [ ] **Step 2: Run** → FAIL
- [ ] **Step 3: Implement adapter + view.** Grid of `.panel` cards (image via `createOptimizedPicture`, title, tags, kind badge), mono filter chips from `allWorkTags()` + kind filter; card → `navigate('/work/'+slug)`. `mount` calls `morphTo(latticeBuilder)`.
- [ ] **Step 4: Run** → PASS; visual pass incl. filtering.
- [ ] **Step 5: Commit** `feat(redesign): unified work lattice (projects + artifacts)`

---

### Task 9: Work detail views + interactive tools

**Files:**
- Create: `src/app/views/workDetail.ts`, `src/styles/redesign/work-detail.css`
- Modify: none of the tool classes — `WordleSolver.ts` and `SecretSanta.ts` query specific DOM ids (e.g. `#wordle-lookup`); reproduce those ids in the new detail markup rather than changing the classes
- Test: `tests/views-workDetail.test.ts` + heavy manual pass

**Interfaces:**
- Consumes: `getWorkItem` (8), `WordleSolver`/`SecretSanta` classes (instantiate in `mount` after injecting their expected DOM), lyric-animator markup from `pages/projects/lyric-animator.html` (extract its `<main>` content + inline script into `src/app/views/tools/lyricAnimator.ts` during this task), `getDirector().pause()/resume()`
- Produces: `View` that renders: static detail layout (hero image, description, tech chips, links) for plain items; tool mount section for `item.tool` set; `notFound` message + back link for unknown slugs.

- [ ] **Step 1: Failing test:** unknown slug renders "not found" + link to `/work`; known static slug renders title + GitHub link when present.
- [ ] **Step 2: Run** → FAIL
- [ ] **Step 3: Implement static details** + port each tool's required DOM (copy the relevant `<main>` sections from `pages/projects/wordle-solver.html`, `secret-santa.html`, `lyric-animator.html`; restyle classes to `.panel`/tokens; keep every element id the component classes query). Lyric animator `mount` → `getDirector()?.pause()`, `unmount` → `resume()`.
- [ ] **Step 4: Manual pass:** Wordle solve CRANE→results, Secret Santa full flow, lyric animator runs, back/forward navigation cleans up (no duplicate listeners, scene resumes).
- [ ] **Step 5: Run tests** → PASS
- [ ] **Step 6: Commit** `feat(redesign): work detail views with ported interactive tools`

---

### Task 10: Journey view (bio + skills + timeline)

**Files:**
- Create: `src/app/views/journey.ts`, `src/styles/redesign/journey.css`
- Modify: `src/components/Timeline.ts` (swap `new Date(...)` calls to `parseLocalDate`; parameterize container/render classes to the new panel styling; keep filter + count + a11y announcer logic identical)
- Test: existing `tests/dates.test.ts` + new `tests/timeline-render.test.ts`

**Interfaces:**
- Consumes: `initializeTimeline` (Timeline.ts), `ResumeManager.ensureLoaded()/getSkills()`, `constellationBuilder(items)`, resume.pdf link
- Produces: `View` with: intro panel (bio from `pages/about.html` "My Journey" copy), skills grid (3 categories), timeline (Timeline.ts render, restyled), resume download `.btn-ghost`.

- [ ] **Step 1: Failing test** (`timeline-render.test.ts`): with a 2-item fixture injected (mock `fetch`), rendered output contains both titles, year sections in descending order, and `Feb 2024` for a `2024-02-01` startDate (the bug fix assertion).
- [ ] **Step 2: Run** → FAIL (current code renders `Jan 2024` in Chicago tz)
- [ ] **Step 3: Implement** date fix in Timeline.ts + view assembly; `mount` fetches timeline.json once, passes items to both Timeline render and `morphTo(constellationBuilder(items))`.
- [ ] **Step 4: Run** → PASS; visual pass incl. filters.
- [ ] **Step 5: Commit** `feat(redesign): journey view — bio, skills, timeline with tz fix, constellation`

---

### Task 11: Beyond + Contact views

**Files:**
- Create: `src/app/views/beyond.ts`, `src/app/views/contact.ts`, `src/styles/redesign/beyond.css`, `src/styles/redesign/contact.css`
- Modify: `src/components/PhotoGallery.js`, `src/components/MediaAccordion.js`, `src/components/InstagramGallery.js` — add `export` to classes; replace any Bootstrap-JS accordion usage in MediaAccordion with a ~20-line `<details>`-based or class-toggle implementation
- Test: `tests/views-contact.test.ts` + manual gallery pass

**Interfaces:**
- Consumes: `PhotoGallery`, `InstagramGallery`, `MediaAccordion` classes; nebula + signalWave builders
- Produces: beyond view (gallery DOM ids the classes expect, copied from `pages/beyond-the-code.html` `<main>`, restyled); contact view: mono eyebrow `// GET IN TOUCH`, email `.btn-glow` (`mailto:jack.vanzeeland@outlook.com`), LinkedIn/GitHub/resume `.btn-ghost` links.

- [ ] **Step 1: Failing test:** contact renders 4 links (mailto, linkedin.com, github.com, resume.pdf).
- [ ] **Step 2: Run** → FAIL
- [ ] **Step 3: Implement both views** (`morphTo(nebulaBuilder)` / `morphTo(signalWaveBuilder)`).
- [ ] **Step 4: Run** → PASS; manual: photo nav arrows/keyboard, Instagram embeds, accordion.
- [ ] **Step 5: Commit** `feat(redesign): beyond gallery and contact views`

---

### Task 12: Kill Bootstrap/AOS/light-theme; achievements easter egg; footer

**Files:**
- Create: `src/app/footer.ts`, `src/app/achievementTracker.ts`, `src/styles/redesign/footer.css`
- Modify: `package.json` (remove `bootstrap`, `aos`, `@types/aos`, `@types/bootstrap`), `vite.config.ts` (drop vendor/animations manualChunks + optimizeDeps entries), `src/utils/journey.ts` (retire `theme_switcher` achievement: mark legacy-granted or remove from `ACHIEVEMENTS`; keep localStorage compat), delete `src/utils/theme.ts` usage from shell (file can remain for git history but nothing imports it)
- Test: `npm run build` + grep gates

**Interfaces:**
- Consumes: `getAchievements`, `unlockAchievement`, `markPageAsVisited` (journey.ts — router calls `markPageAsVisited()` per route change)
- Produces: corner tracker button (mono `▲ n/8`) opening a `.panel` popover listing achievements; unlock toast on `achievement:unlocked` CustomEvent (add dispatch inside `unlockAchievement`).

- [ ] **Step 1: Remove deps** `npm uninstall bootstrap aos @types/aos @types/bootstrap`
- [ ] **Step 2: Gates:** `grep -rn "bootstrap\|aos" src/ index.html --include='*.ts' --include='*.css' -i` → only comments/none; `npm run typecheck && npm run build` → green.
- [ ] **Step 3: Implement footer (mono links, © line) + tracker + toast.**
- [ ] **Step 4: Run** `npm test` + visual.
- [ ] **Step 5: Commit** `feat(redesign): remove bootstrap/aos/theme, add achievement easter egg + footer`

---

### Task 13: Reveal-on-scroll util + polish pass

**Files:**
- Create: `src/utils/reveal.ts` (IntersectionObserver adds `.in` class; honors `prefersReducedMotion()` by revealing instantly), `src/styles/redesign/reveal.css` (`[data-reveal]{opacity:0;transform:translateY(16px);transition:.6s} .in{opacity:1;transform:none}` inside a `no-preference` media query)
- Modify: views add `data-reveal` to panels
- Test: `tests/reveal.test.ts` (reduced-motion path reveals instantly — mock matchMedia)

- [ ] **Step 1: Failing test** → **Step 2: FAIL** → **Step 3: implement** → **Step 4: PASS** → **Step 5: visual scroll pass on all routes** → **Step 6: Commit** `feat(redesign): scroll reveals`

---

### Task 14: SEO, redirects, deploy config

**Files:**
- Create: `infrastructure/spa-router-function.js` (CloudFront Function: 301 map for legacy paths — same table as `legacyRedirect`, generated by `scripts/generate-redirects.mjs` from the router's exported map to keep them in sync; unknown non-asset paths rewrite to `/index.html`)
- Create: `scripts/generate-redirects.mjs`, `scripts/generate-sitemap.mjs` (6 routes + work slugs from `WORK_ITEMS`)
- Modify: `infrastructure.yaml` (attach function to CloudFront default behavior), `sitemap.xml` (generated), `robots.txt` (unchanged check), `package.json` build (`generate-sitemap` before vite build), `.github/workflows/deploy.yml` (no change expected — verify)
- Test: `tests/redirects-sync.test.ts` — the generated CF function file contains every key from `legacyRedirect`'s map

- [ ] **Step 1: Failing sync test** → **Step 2: FAIL** → **Step 3: implement generators + CF function + infra wiring** → **Step 4: PASS + `npm run build` green** → **Step 5: Commit** `feat(redesign): SPA routing/redirects at CloudFront, generated sitemap`

---

### Task 15: Performance + degradation verification (gate)

**Files:** none new (fixes as found)

- [ ] **Step 1: Build + preview;** Playwright sweep: all 6 routes direct-load AND client-navigate; back/forward; Wordle/Santa/lyric tools; reduced-motion emulation (no canvas, all content visible); 390px mobile pass.
- [ ] **Step 2: Lighthouse mobile** on `/`, `/work`, `/journey` → all ≥ 90, CLS < 0.1; JS budget: entry chunk < 60KB gz, three async.
- [ ] **Step 3: Fix regressions found; re-run until green.**
- [ ] **Step 4: Commit** `test(redesign): perf + degradation gate green`

---

### Task 16: Docs + cutover PR

**Files:**
- Modify: `README.md` (architecture section rewrite: SPA, SceneDirector, formations, dark-only), delete stale `pages/**` from build docs
- Test: `npm run build && npm test && npm run lint && npm run typecheck` all green

- [ ] **Step 1: Update README.**
- [ ] **Step 2: Full gate run.**
- [ ] **Step 3: Push `redesign`; open PR → `main` titled "Dark cinematic redesign: SPA + morphing particle stage"** with before/after screenshots, Lighthouse table, redirect table. **Do NOT merge — Jack reviews the deployed preview and approves the actual cutover.**
- [ ] **Step 4: Commit + push.**
