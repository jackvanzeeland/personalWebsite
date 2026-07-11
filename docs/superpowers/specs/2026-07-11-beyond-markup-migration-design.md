# beyondMarkup.ts migration design

## Context

`src/app/views/beyondMarkup.ts` holds `BEYOND_MARKUP`, the entire `/beyond`
page body as a single-line, escaped HTML string mechanically extracted from
the old static `pages/beyond-the-code.html`. `beyond.ts` injects it via
`section.innerHTML = BEYOND_MARKUP`. This is out of step with every other
view (`home.ts`, `contact.ts`, `journey.ts`, `projects.ts`, `workDetail.ts`),
which build their DOM with a small shared `el()` helper and use readable
multi-line template literals only for genuinely static, attribute-heavy
markup (third-party embeds, tool-demo widget bodies with fixed DOM-id
contracts — see `WORDLE_DEMO`/`SANTA_DEMO` in `workDetail.ts` and
`qrMarkup.ts`/`uipathMarkup.ts`).

This is the first of two files being migrated to that convention
(`lyricMarkup.ts` is the second, tracked separately). This spec covers
`beyondMarkup.ts` only.

## Goal

Replace the escaped one-line string with DOM-builder code for
structural/dynamic content, and readable multi-line template-literal
constants for inert third-party embed markup — matching the rest of the
codebase's established convention exactly. No visual or behavioral change.

## Non-goals

- No visual/CSS changes.
- No changes to `PhotoGallery.js`, `InstagramGallery.js`, or
  `MediaAccordion.js` — all three locate elements by id/class after mount,
  so the migration only needs to preserve those contracts exactly.
- No change to `lyricMarkup.ts` (separate follow-up migration).

## Design

### File rename

`src/app/views/beyondMarkup.ts` → `src/app/views/beyondContent.ts`.

Export changes from `export const BEYOND_MARKUP: string` to
`export function buildBeyondContent(): DocumentFragment`.

`beyond.ts` changes:
```ts
// before
import { BEYOND_MARKUP } from './beyondMarkup';
...
section.innerHTML = BEYOND_MARKUP;

// after
import { buildBeyondContent } from './beyondContent';
...
section.appendChild(buildBeyondContent());
```

The `data-reveal` attribute wiring in `beyond.ts`
(`section.querySelectorAll('.sport-card, .media-accordion, .photo-container')`)
is untouched — it runs after the content is appended, same as today.

### Section-by-section treatment

Uses the same local `el<K>(tag, className?, text?)` helper duplicated in
every other view file (`home.ts`, `contact.ts`, `journey.ts`).

1. **Hero** (`.page-hero`) — eyebrow span, `h1`, lead `p`, separator div.
   Plain `el()` calls, same shape as `contact.ts`'s hero block.

2. **Intro** — single lead paragraph. Plain `el()`.

3. **Sports & Fitness** (`.sport-card` × 4) — a `SPORT_CARDS` array:
   ```ts
   const SPORT_CARDS: { icon: string; title: string; description: string; details: string }[] = [...]
   ```
   Rendered via `.map()` + `el()`, directly modeled on `home.ts`'s `STATS`
   array. Cards are built without `data-reveal` — `beyond.ts`'s existing
   post-append `querySelectorAll('.sport-card, ...')` pass still sets it,
   so the attribute-setting logic isn't duplicated in two places.

4. **Media accordion** (`.media-accordion`) — 4 categories: Movies,
   Podcasts, Episodes, Audiobooks.
   - Outer shell per category (`.accordion-item`, `.accordion-header`
     with `aria-expanded`/`aria-controls`, `.accordion-chevron`,
     `.accordion-panel` with `aria-hidden` + inline
     `style="max-height:0;overflow:hidden"`) built via `el()` in a loop
     over a small category descriptor list — `MediaAccordion.js` only
     depends on the `.accordion-item`/`.accordion-header`/`.accordion-panel`
     class contract, not on how the markup was constructed.
   - **Movies / Podcasts / Episodes panel bodies**: each stays a readable,
     unescaped, multi-line template-literal constant
     (`MOVIES_EMBEDS`, `PODCASTS_EMBEDS`, `EPISODES_EMBEDS`) assigned via
     `panel.innerHTML = ...`. These are inert third-party `<iframe>` embeds
     (YouTube/Spotify) with long fixed attribute lists (`sandbox`, `allow`,
     `referrerpolicy`, `loading`) — reconstructing via `setAttribute` calls
     buys no type-safety and risks silently dropping/typo-ing an attribute
     Instagram/YouTube/Spotify require. Matches `QR_MARKUP`/`UIPATH_MARKUP`.
   - **Audiobooks panel body**: no embeds, plain text — converted to a real
     `AUDIOBOOKS: { title: string; detail: string }[]` array rendered as
     `<li>` elements via `el()`, the cleanest dynamic case (same idea as
     `journey.ts`'s skill lists).

5. **Life Moments**:
   - Photo gallery skeleton (`#photo-gallery` with its loading skeleton
     div, `#prev-photo`/`#next-photo` buttons, `#photo-counter` span) —
     `el()`, mirrors `journey.ts`'s `#timeline-container` skeleton pattern.
     `PhotoGallery.js` replaces the skeleton's contents after mount exactly
     as it does today.
   - Instagram embed — one static `INSTAGRAM_EMBED` template-literal
     constant (the `<blockquote class="instagram-media" data-instgrm-...>`
     with its ~10 required data attributes and inline style per Instagram's
     own embed spec, plus the `<script async src="https://www.instagram.com/embed.js">`
     loader) assigned via `innerHTML`. Same reasoning as the video/podcast
     embeds — this is a third-party contract, not app structure.

### Verification

- Confirm every id/class queried by `PhotoGallery.js`
  (`#photo-gallery`, `#photo-counter`, `#prev-photo`, `#next-photo`),
  `InstagramGallery.js` (`.instagram-media`), and `MediaAccordion.js`
  (`.media-accordion`, `.accordion-item`, `.accordion-header`,
  `.accordion-panel`, `.accordion-chevron i`) is present with the same
  structure in the rebuilt DOM.
- `npm run typecheck` / `tsc --noEmit` (or project equivalent) passes.
- Run the dev server, navigate to `/beyond`, and manually verify:
  - All 4 accordion sections open/close (one-at-a-time behavior) and their
    embeds (YouTube/Spotify) render.
  - Photo gallery prev/next controls cycle photos and the counter updates.
  - Instagram embed loads.
  - `data-reveal` scroll-in animations still trigger on sport cards, the
    accordion, and the photo container.

## Risks

- Instagram's embed script (`embed.js`) processes the blockquote's exact
  attribute set client-side; a dropped/mistyped data attribute could
  silently fail to render. Keeping it as a literal template string
  (verbatim from the original) minimizes this risk rather than eliminating
  it entirely — still worth a manual visual check post-migration.
- None of the three components' behavior should change, since all three
  query by id/class post-mount rather than depending on DOM construction
  method.
- The `<script async src="https://www.instagram.com/embed.js">` loader in
  `INSTAGRAM_EMBED` is carried over unchanged (it's also duplicated at
  runtime by `InstagramGallery.js`'s `loadInstagramScript()`). No
  Subresource Integrity hash is added: Instagram serves this file from a
  CDN path it updates without notice and doesn't publish a stable hash for,
  so pinning `integrity` would break the embed on Instagram's next update
  rather than protect against tampering. This is a pre-existing tradeoff of
  using Instagram's own embed widget, unchanged by this migration.
