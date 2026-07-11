# beyondMarkup.ts Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `src/app/views/beyondMarkup.ts`'s single-line escaped `BEYOND_MARKUP` HTML string with a DOM-builder module (`beyondContent.ts`) that matches the rest of the codebase's view convention, with no visual or behavioral change to the `/beyond` page.

**Architecture:** A new `src/app/views/beyondContent.ts` exports `buildBeyondContent(): DocumentFragment`, built with the same local `el<K>()` helper every other view file duplicates (`home.ts`, `contact.ts`, `journey.ts`). Structural/dynamic pieces (hero, sport cards, accordion shell, audiobook list, gallery skeleton) are built via `el()`. Inert third-party embed markup (YouTube/Spotify iframes, Instagram blockquote) stays as readable multi-line template-literal constants assigned via `innerHTML` on a sub-container — matching `qrMarkup.ts`/`uipathMarkup.ts` and `workDetail.ts`'s `WORDLE_DEMO`/`SANTA_DEMO` blocks.

**Tech Stack:** TypeScript, Vite, Vitest + happy-dom (existing project tooling; no new dependencies).

## Global Constraints

- No visual/CSS changes — every class name, id, and DOM nesting level from the original markup must be preserved exactly (`src/styles/redesign/beyond.css` targets these selectors and is not being touched).
- No changes to `src/components/PhotoGallery.js`, `src/components/InstagramGallery.js`, or `src/components/MediaAccordion.js` — all three locate elements by id/class after mount, so fidelity of ids/classes is the only thing that matters.
- `src/app/views/tools/lyricMarkup.ts` is explicitly out of scope (separate follow-up migration).
- File rename: `src/app/views/beyondMarkup.ts` → `src/app/views/beyondContent.ts`. Export changes from `export const BEYOND_MARKUP: string` to `export function buildBeyondContent(): DocumentFragment`.
- No Subresource Integrity hash is added to the Instagram `embed.js` `<script>` tag — Instagram doesn't publish a stable hash for it, so pinning `integrity` would break the embed on Instagram's next update. This is carried over unchanged from the original markup.

---

### Task 1: Characterization test for the `/beyond` view

**Files:**
- Create: `tests/views-beyond.test.ts`

**Interfaces:**
- Consumes: `src/app/views/beyond.ts`'s default export (`View` with `mount(root, params)` / `unmount()`), unchanged by this task.

This test is a safety net, not a red/green TDD cycle — the migration must not change what's rendered, so the test should **pass against the current, unmigrated code** before any implementation changes happen. Task 3 re-runs this same test after the cutover to prove nothing broke.

- [ ] **Step 1: Write the characterization test**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import beyondView from '../src/app/views/beyond';

describe('beyond view', () => {
    beforeEach(() => {
        document.body.innerHTML = '<main id="view-root"></main>';
    });

    it('renders the hero', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        expect(root.querySelector('h1')?.textContent).toBe('Beyond the Code');
        beyondView.unmount();
    });

    it('renders 4 sport cards', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        const cards = root.querySelectorAll('.sport-card');
        expect(cards.length).toBe(4);
        const titles = [...cards].map((c) => c.querySelector('h4')?.textContent);
        expect(titles).toEqual(['Intramural Sports', 'Golf', 'Running', 'Weight Training']);
        beyondView.unmount();
    });

    it('renders 4 accordion categories with matching panel ids', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        const items = root.querySelectorAll('.media-accordion .accordion-item');
        expect(items.length).toBe(4);

        const headers = root.querySelectorAll('.accordion-header');
        const panelIds = [...headers].map((h) => h.getAttribute('aria-controls'));
        expect(panelIds).toEqual(['movies-panel', 'podcasts-panel', 'episodes-panel', 'audiobooks-panel']);

        panelIds.forEach((id) => {
            expect(root.querySelector(`#${id}`)).toBeTruthy();
        });
        beyondView.unmount();
    });

    it('renders movie, podcast, and episode iframes', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        expect(root.querySelectorAll('#movies-panel iframe').length).toBe(3);
        expect(root.querySelectorAll('#podcasts-panel iframe').length).toBe(3);
        expect(root.querySelectorAll('#episodes-panel iframe').length).toBe(3);
        expect(root.querySelector('#movies-panel iframe')?.getAttribute('src')).toBe(
            'https://www.youtube.com/embed/ReIJ1lbL-Q8?si=x2nwOC3OkT-7AbZ9'
        );
        beyondView.unmount();
    });

    it('renders 5 audiobooks', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        const items = root.querySelectorAll('#audiobooks-panel li.list-group-item');
        expect(items.length).toBe(5);
        expect(items[0].querySelector('strong')?.textContent).toBe('The Almanack of Naval Ravikant');
        expect(items[0].textContent).toContain('A Guide to Wealth and Happiness');
        beyondView.unmount();
    });

    it('renders the photo gallery skeleton and Instagram embed', async () => {
        const root = document.getElementById('view-root')!;
        await beyondView.mount(root, {});
        expect(root.querySelector('#photo-gallery')).toBeTruthy();
        expect(root.querySelector('#photo-counter')).toBeTruthy();
        expect(root.querySelector('#prev-photo')).toBeTruthy();
        expect(root.querySelector('#next-photo')).toBeTruthy();
        expect(
            root.querySelector('blockquote.instagram-media')?.getAttribute('data-instgrm-permalink')
        ).toBe('https://www.instagram.com/jack.vanzeeland/');
        beyondView.unmount();
    });
});
```

- [ ] **Step 2: Run the test to verify it PASSES against the current (unmigrated) code**

Run: `npx vitest run tests/views-beyond.test.ts`
Expected: all 6 tests PASS (this confirms the test accurately describes today's behavior before any refactor).

- [ ] **Step 3: Commit**

```bash
git add tests/views-beyond.test.ts
git commit -m "Add characterization test for /beyond view before markup migration

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Build `beyondContent.ts`

**Files:**
- Create: `src/app/views/beyondContent.ts`

**Interfaces:**
- Produces: `export function buildBeyondContent(): DocumentFragment` — a fragment containing 5 top-level `<section>` elements (hero, intro, sports, media, life-moments), consumed by Task 3's `beyond.ts` change.

- [ ] **Step 1: Write the complete file**

```ts
/**
 * Beyond-the-Code content — DOM builder for the /beyond page's <main> body.
 * Structural/dynamic pieces are built with el(); third-party iframe/embed
 * markup stays as readable template-literal HTML assigned via innerHTML,
 * matching qrMarkup.ts/uipathMarkup.ts and workDetail.ts's tool-demo blocks.
 */

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

/* ── Hero + intro ──────────────────────────────────────────────────── */

function buildHero(): HTMLElement {
    const section = el('section', 'py-5 page-hero');
    const container = el('div', 'container');
    const center = el('div', 'text-center');
    center.append(
        el('span', 'page-eyebrow', 'Life Outside the Terminal'),
        el('h1', 'display-4 fw-bold mb-3', 'Beyond the Code'),
        el(
            'p',
            'lead text-muted mb-4',
            'Running, sports, music, and the things that keep engineering interesting.'
        ),
        el('div', 'separator')
    );
    container.appendChild(center);
    section.appendChild(container);
    return section;
}

function buildIntro(): HTMLElement {
    const section = el('section', 'py-5');
    const container = el('div', 'container');
    const row = el('div', 'row');
    const col = el('div', 'col-lg-8 mx-auto');
    const contentSection = el('div', 'content-section mb-5');
    contentSection.appendChild(
        el(
            'div',
            'lead mb-4',
            "While my professional life revolves around automation and problem-solving, my personal interests keep me active and engaged outside of work. Here's what I'm passionate about when I'm not coding."
        )
    );
    col.appendChild(contentSection);
    row.appendChild(col);
    container.appendChild(row);
    section.appendChild(container);
    return section;
}

/* ── Sports & Fitness ─────────────────────────────────────────────── */

interface SportCard {
    icon: string;
    title: string;
    description: string;
    details: string;
}

const SPORT_CARDS: SportCard[] = [
    {
        icon: '⚾',
        title: 'Intramural Sports',
        description:
            'You can often find me on the field or court playing intramural softball, basketball, and volleyball. Sports have always been a huge part of my life, shaping my competitive spirit and love for teamwork.',
        details: 'Softball • Basketball • Volleyball'
    },
    {
        icon: '⛳',
        title: 'Golf',
        description:
            "I enjoy hitting the links whenever I can, whether it's a casual round with friends or a more competitive outing. Golf is a great way to relax and enjoy the outdoors while challenging myself.",
        details: 'Weekend warrior • Course explorer'
    },
    {
        icon: '🏃‍♂️',
        title: 'Running',
        description:
            "I started running in 2023, completing my first half-marathon that year. It's become one of my favorite ways to stay active and clear my head.",
        details: 'Active runner • Half-marathon finisher'
    },
    {
        icon: '💪',
        title: 'Weight Training',
        description:
            "When I'm not running, I'm in the gym focusing on strength training. Building physical strength complements mental discipline from programming.",
        details: 'Strength training • Consistency focus'
    }
];

function buildSportCard(card: SportCard): HTMLElement {
    const col = el('div', 'col-md-6');
    const wrap = el('div', 'sport-card p-4 h-100');
    wrap.append(
        el('div', 'sport-icon mb-3', card.icon),
        el('h4', undefined, card.title),
        el('p', undefined, card.description)
    );
    const details = el('div', 'sport-details');
    details.appendChild(el('small', 'text-muted', card.details));
    wrap.appendChild(details);
    col.appendChild(wrap);
    return col;
}

function buildSportsSection(): HTMLElement {
    const section = el('section', 'py-5 bg-section-alt');
    const container = el('div', 'container');
    const row = el('div', 'row');
    const col = el('div', 'col-lg-12');
    col.appendChild(el('h2', 'text-center mb-5', 'Sports & Fitness'));
    const cardsRow = el('div', 'row g-4 mb-4');
    SPORT_CARDS.forEach((card) => cardsRow.appendChild(buildSportCard(card)));
    col.appendChild(cardsRow);
    row.appendChild(col);
    container.appendChild(row);
    section.appendChild(container);
    return section;
}

/* ── Media Recommendations accordion ─────────────────────────────── */

const MOVIES_EMBEDS = `
  <div class="media-grid">
    <div class="media-item">
      <div class="embed-responsive embed-responsive-16by9">
        <iframe class="embed-responsive-item"
          src="https://www.youtube.com/embed/ReIJ1lbL-Q8?si=x2nwOC3OkT-7AbZ9"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          loading="lazy"
          title="YouTube video player" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
    </div>
    <div class="media-item">
      <div class="embed-responsive embed-responsive-16by9">
        <iframe class="embed-responsive-item"
          src="https://www.youtube.com/embed/EodWwczRIe4?si=nE_mXU8mk090h3Gs"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          loading="lazy"
          title="YouTube video player" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
    </div>
    <div class="media-item">
      <div class="embed-responsive embed-responsive-16by9">
        <iframe class="embed-responsive-item"
          src="https://www.youtube.com/embed/bx46tthKXmc?si=-GXgTJB5hjbk3uko"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          loading="lazy"
          title="YouTube video player" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
    </div>
  </div>
`;

const PODCASTS_EMBEDS = `
  <div class="media-grid">
    <div class="media-item">
      <div class="embed-responsive spotify-embed-tall">
        <iframe class="embed-responsive-item" style="border-radius:12px"
          src="https://open.spotify.com/embed/show/0XrOqvxlqQI6bmdYHuIVnr/video?utm_source=generator"
          sandbox="allow-scripts allow-same-origin allow-popups"
          frameBorder="0" allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    </div>
    <div class="media-item">
      <div class="embed-responsive spotify-embed-short">
        <iframe style="border-radius:12px" src="https://open.spotify.com/embed/show/7nc7OQdPTekErtFSRxOBKh?utm_source=generator" width="100%" height="352" sandbox="allow-scripts allow-same-origin allow-popups" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
      </div>
    </div>
    <div class="media-item">
      <div class="embed-responsive spotify-embed-tall">
        <iframe class="embed-responsive-item" style="border-radius:12px"
          src="https://open.spotify.com/embed/show/6bSPqenYtlBc7AU6H5sjca?utm_source=generator"
          sandbox="allow-scripts allow-same-origin allow-popups"
          frameBorder="0" allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    </div>
  </div>
`;

const EPISODES_EMBEDS = `
  <div class="media-grid">
    <div class="media-item">
      <div class="embed-responsive spotify-embed-tall">
        <iframe class="embed-responsive-item" style="border-radius:12px"
          src="https://open.spotify.com/embed/episode/2KyMXeMQS0djxazcFJZaSb/video?utm_source=generator"
          sandbox="allow-scripts allow-same-origin allow-popups"
          frameBorder="0" allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    </div>
    <div class="media-item">
      <div class="embed-responsive spotify-embed-tall">
        <iframe class="embed-responsive-item" style="border-radius:12px"
          src="https://open.spotify.com/embed/episode/7DCZh0UySNrMkd2E373rso/video?utm_source=generator"
          sandbox="allow-scripts allow-same-origin allow-popups"
          frameBorder="0" allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    </div>
    <div class="media-item">
      <div class="embed-responsive spotify-embed-tall">
        <iframe class="embed-responsive-item" style="border-radius:12px"
          src="https://open.spotify.com/embed/episode/6tjNyF02d4F4ux9RBeFUxG?utm_source=generator"
          sandbox="allow-scripts allow-same-origin allow-popups"
          frameBorder="0" allowfullscreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    </div>
  </div>
`;

function buildAccordionShell(
    icon: string,
    title: string,
    panelId: string
): { item: HTMLElement; panel: HTMLElement } {
    const item = el('div', 'accordion-item');
    const header = el('button', 'accordion-header');
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', panelId);
    header.append(el('span', 'accordion-icon', icon), el('span', 'accordion-title', title));
    const chevronWrap = el('span', 'accordion-chevron');
    chevronWrap.appendChild(el('i', 'fas fa-chevron-down'));
    header.appendChild(chevronWrap);

    const panel = el('div', 'accordion-panel');
    panel.id = panelId;
    panel.style.maxHeight = '0';
    panel.style.overflow = 'hidden';
    panel.setAttribute('aria-hidden', 'true');

    item.append(header, panel);
    return { item, panel };
}

function buildEmbedAccordionItem(
    icon: string,
    title: string,
    panelId: string,
    embedsHTML: string
): HTMLElement {
    const { item, panel } = buildAccordionShell(icon, title, panelId);
    panel.innerHTML = embedsHTML;
    return item;
}

interface Audiobook {
    title: string;
    detail: string;
}

const AUDIOBOOKS: Audiobook[] = [
    {
        title: 'The Almanack of Naval Ravikant',
        detail: '- A Guide to Wealth and Happiness (Eric Jorgenson, Tim Ferriss)'
    },
    { title: 'Atomic Habits', detail: '(James Clear)' },
    { title: 'The Hard Thing about Hard Things', detail: '(Ben Horowitz)' },
    { title: 'Trump: The Art of the Deal', detail: '(Donald J. Trump, Tony Schwartz)' },
    { title: "Can't Hurt Me", detail: '(David Goggins)' }
];

function buildAudiobooksAccordionItem(): HTMLElement {
    const { item, panel } = buildAccordionShell('📚', 'Favorite Audiobooks', 'audiobooks-panel');
    const listWrap = el('div', 'audiobooks-list');
    const ol = el('ol', 'list-group list-group-flush');
    AUDIOBOOKS.forEach((book) => {
        const li = el('li', 'list-group-item');
        li.appendChild(el('strong', undefined, book.title));
        li.appendChild(document.createTextNode(` ${book.detail}`));
        ol.appendChild(li);
    });
    listWrap.appendChild(ol);
    panel.appendChild(listWrap);
    return item;
}

function buildMediaSection(): HTMLElement {
    const section = el('section', 'py-5');
    const container = el('div', 'container');
    const row = el('div', 'row');
    const col = el('div', 'col-lg-8 mx-auto');
    col.append(
        el('h2', 'text-center mb-5', 'My Top Recommendations'),
        el(
            'p',
            'text-center text-muted mb-5',
            "Here are some of my favorite movies, podcasts, episodes, and books that I've enjoyed and found insightful:"
        )
    );

    const accordion = el('div', 'media-accordion');
    accordion.appendChild(buildEmbedAccordionItem('🎥', 'Favorite Movies', 'movies-panel', MOVIES_EMBEDS));
    accordion.appendChild(
        buildEmbedAccordionItem('🎧', 'Favorite Podcasts', 'podcasts-panel', PODCASTS_EMBEDS)
    );
    accordion.appendChild(
        buildEmbedAccordionItem('🎧', 'Favorite Podcast Episodes', 'episodes-panel', EPISODES_EMBEDS)
    );
    accordion.appendChild(buildAudiobooksAccordionItem());
    col.appendChild(accordion);

    row.appendChild(col);
    container.appendChild(row);
    section.appendChild(container);
    return section;
}

/* ── Life Moments (photo gallery + Instagram) ────────────────────── */

const INSTAGRAM_EMBED = `
  <blockquote class="instagram-media"
    data-instgrm-permalink="https://www.instagram.com/jack.vanzeeland/"
    data-instgrm-version="14"
    style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin:1px; max-width:540px; min-width:326px; padding:0; width:99.375%;">
    <a href="https://www.instagram.com/jack.vanzeeland/" target="_blank">View Jack Van Zeeland's profile on Instagram</a>
  </blockquote>
  <script async src="https://www.instagram.com/embed.js"></script>
`;

function buildLifeMomentsSection(): HTMLElement {
    const section = el('section', 'py-5 bg-section-alt');
    const container = el('div', 'container');
    const row = el('div', 'row life-moments-row');

    const galleryCol = el('div', 'col-lg-6');
    galleryCol.append(
        el('h2', 'mb-5', 'Life Moments'),
        el('p', 'mb-4 text-muted', 'A collection of moments that capture life beyond the screen')
    );

    const gallery = el('div', 'photo-gallery');
    gallery.id = 'photo-gallery';
    const skeleton = el('div', 'skeleton');
    skeleton.style.width = '100%';
    skeleton.style.height = '280px';
    skeleton.style.borderRadius = '12px';
    gallery.appendChild(skeleton);
    galleryCol.appendChild(gallery);

    const controls = el('div', 'gallery-controls text-center mt-4');
    const prevBtn = el('button', 'btn btn-outline-primary btn-sm');
    prevBtn.id = 'prev-photo';
    prevBtn.setAttribute('aria-label', 'Previous photo');
    prevBtn.appendChild(el('i', 'fas fa-chevron-left'));
    prevBtn.appendChild(document.createTextNode(' Previous'));

    const counter = el('span', 'mx-3', '1 / 1');
    counter.id = 'photo-counter';
    counter.setAttribute('aria-live', 'polite');
    counter.setAttribute('aria-atomic', 'true');

    const nextBtn = el('button', 'btn btn-outline-primary btn-sm');
    nextBtn.id = 'next-photo';
    nextBtn.setAttribute('aria-label', 'Next photo');
    nextBtn.appendChild(document.createTextNode('Next '));
    nextBtn.appendChild(el('i', 'fas fa-chevron-right'));

    controls.append(prevBtn, counter, nextBtn);
    galleryCol.appendChild(controls);

    const instaCol = el('div', 'col-lg-6');
    const instaSection = el('div', 'instagram-section');
    instaSection.appendChild(el('h3', 'mb-4', 'Instagram'));
    const instaContainer = el('div', 'instagram-embed-container');
    instaContainer.innerHTML = INSTAGRAM_EMBED;
    instaSection.appendChild(instaContainer);
    instaCol.appendChild(instaSection);

    row.append(galleryCol, instaCol);
    container.appendChild(row);
    section.appendChild(container);
    return section;
}

/* ── Entry point ──────────────────────────────────────────────────── */

export function buildBeyondContent(): DocumentFragment {
    const fragment = document.createDocumentFragment();
    fragment.append(
        buildHero(),
        buildIntro(),
        buildSportsSection(),
        buildMediaSection(),
        buildLifeMomentsSection()
    );
    return fragment;
}
```

- [ ] **Step 2: Typecheck the new file**

Run: `npx tsc --noEmit`
Expected: no errors (this file isn't imported anywhere yet, so this only validates its own syntax/types).

- [ ] **Step 3: Commit**

```bash
git add src/app/views/beyondContent.ts
git commit -m "Add beyondContent.ts DOM builder (not yet wired in)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Cut over `beyond.ts` and remove `beyondMarkup.ts`

**Files:**
- Modify: `src/app/views/beyond.ts:10,23`
- Delete: `src/app/views/beyondMarkup.ts`

**Interfaces:**
- Consumes: `buildBeyondContent(): DocumentFragment` from Task 2's `src/app/views/beyondContent.ts`.

- [ ] **Step 1: Update the import**

In `src/app/views/beyond.ts`, change:

```ts
import { BEYOND_MARKUP } from './beyondMarkup';
```

to:

```ts
import { buildBeyondContent } from './beyondContent';
```

- [ ] **Step 2: Replace the innerHTML assignment**

In `src/app/views/beyond.ts`, change:

```ts
        // Trusted compile-time constant extracted from our own repo markup
        section.innerHTML = BEYOND_MARKUP;
```

to:

```ts
        section.appendChild(buildBeyondContent());
```

- [ ] **Step 3: Delete the old markup file**

```bash
git rm src/app/views/beyondMarkup.ts
```

- [ ] **Step 4: Re-run the characterization test from Task 1**

Run: `npx vitest run tests/views-beyond.test.ts`
Expected: all 6 tests still PASS — this proves the migration produced an identical DOM contract.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors, and no dangling references to `beyondMarkup` or `BEYOND_MARKUP`.

Run: `grep -rn "beyondMarkup\|BEYOND_MARKUP" src/`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/app/views/beyond.ts
git commit -m "Migrate /beyond view to beyondContent.ts DOM builder

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Manual verification in the browser

**Files:** none (manual QA step, no code changes)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Navigate to `/beyond` and verify**

- All 4 accordion sections (Movies, Podcasts, Episodes, Audiobooks) open and close one-at-a-time when clicked.
- Movie iframes (YouTube) and podcast/episode iframes (Spotify) render inside their panels once opened.
- Photo gallery Previous/Next buttons cycle photos and the counter (`1 / 7`, `2 / 7`, ...) updates.
- The Instagram embed renders Jack's profile card (not just the fallback link).
- Scroll-in (`data-reveal`) animations still trigger on the sport cards, the accordion, and the photo gallery area.

- [ ] **Step 3: Stop the dev server**

No commit for this task — it's verification only. If any check fails, return to Task 2/3 and fix before proceeding.

---

### Task 5: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm run test`
Expected: all tests pass, including the new `tests/views-beyond.test.ts`.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Run a production build**

Run: `npm run build`
Expected: build succeeds (this exercises `tsc` + `vite build`, catching any bundling issue from the file rename).

If any of these fail, fix the underlying issue and re-run this task's steps from the top before considering the migration complete. No new commit is needed if all steps pass cleanly (Task 3's commit already covers the code change).
