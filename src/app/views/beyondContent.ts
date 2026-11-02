/**
 * Beyond-the-Code content — DOM builder for the /beyond page's <main> body.
 * Everything is built with el(); media embeds come from plain URL lists
 * (MOVIES / PODCASTS / EPISODES) so every iframe shares one size and config.
 */

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/* ── Hero ──────────────────────────────────────────────────────────── */

/** Eyebrow names the page, h1 speaks — same header rhythm as /projects and /journey. */
function buildHero(): DocumentFragment {
  const hero = document.createDocumentFragment();
  hero.append(
    el("p", "eyebrow", "// BEYOND THE CODE"),
    el("h1", undefined, "Life outside the terminal"),
    el(
      "p",
      "beyond-sub",
      "Running, sports, podcasts, and the photos in between — what keeps me busy when I'm not developing something.",
    ),
  );
  return hero;
}

/** A titled block: shared .section-head (title left, mono meta right). */
function buildBlock(title: string, meta?: string): HTMLElement {
  const block = el("section", "beyond-block");
  const head = el("div", "section-head");
  head.appendChild(el("h2", "section-head-title", title));
  if (meta) head.appendChild(el("p", "section-head-meta", meta));
  block.appendChild(head);
  return block;
}

/* ── Sports & Fitness ─────────────────────────────────────────────── */

interface SportCard {
  title: string;
  description: string;
  /** Optional mono tag; only rows that need the extra detail carry one. */
  details?: string;
}

const SPORT_CARDS: SportCard[] = [
  {
    title: "Intramural Sports",
    description:
      "You can often find me on the field or court playing intramural softball, basketball, volleyball, and soccer. Sports have always been a huge part of my life, managing my competitive spirit and building relationships.",
    details: "Softball · Basketball · Volleyball · Soccer",
  },
  {
    title: "Golf",
    description:
      "I've played golf ever since I was a kid with my family.  Unfortunately, the skill doesn't show in my game, but I still enjoy hitting the links whenever I can.",
  },
  {
    title: "Running",
    description:
      "I started running in 2023, completing my first half-marathon that year. Since then, it's become one of my favorite ways to stay active and clear my head.",
  },
  {
    title: "Weight Training",
    description:
      "Growing up playing sports, weight training was always a part of my routine. I continue to lift weights to maintain strength and overall fitness.",
  },
];

function buildSportRow(card: SportCard): HTMLElement {
  const row = el("li", "sport-row");
  // Title column holds the optional tag underneath, so every description
  // starts at the same x regardless of whether the row has a tag.
  const head = el("div", "sport-row-head");
  head.appendChild(el("span", "sport-row-title", card.title));
  if (card.details) {
    head.appendChild(el("span", "sport-row-kind", card.details.toUpperCase()));
  }
  row.append(head, el("span", "sport-row-desc", card.description));
  return row;
}

function buildSportsSection(): HTMLElement {
  const block = buildBlock("Sports & fitness");
  const list = el("ul", "sport-index");
  SPORT_CARDS.forEach((card) => list.appendChild(buildSportRow(card)));
  block.appendChild(list);
  return block;
}

/* ── Media Recommendations accordion ─────────────────────────────── */

/*
 * To add a pick, paste its embed URL into the matching list. Each list becomes
 * a row of iframes with the same settings and size, and the accordion count
 * ("5 FILMS") comes from the list length.
 */

/** YouTube embed URLs (Share → Embed → the iframe's src). */
const MOVIES: string[] = [
  "https://www.youtube.com/embed/ReIJ1lbL-Q8?si=x2nwOC3OkT-7AbZ9",
  "https://www.youtube.com/embed/zSWdZVtXT7E?si=SeQnq2PpwhvqZLSO",
  "https://www.youtube.com/embed/bx46tthKXmc?si=-GXgTJB5hjbk3uko",
  "https://www.youtube.com/embed/1NJO0jxBtMo?si=Ygkkb2M2KwYYHnGh",
  "https://www.youtube.com/embed/BjJcYdEOI0k?si=BJKtwbIptcKnFO2v",
];

/** Spotify show embed URLs (Share → Embed show → the iframe's src). */
const PODCASTS: string[] = [
  "https://open.spotify.com/embed/show/0XrOqvxlqQI6bmdYHuIVnr/video?utm_source=generator",
  "https://open.spotify.com/embed/show/7nc7OQdPTekErtFSRxOBKh?utm_source=generator",
  "https://open.spotify.com/embed/show/4rOoJ6Egrf8K2IrywzwOMk/video?utm_source=generator&si=100da53fe98e479a",
  "https://open.spotify.com/embed/show/2HGcJRYrjGnpce6bRp8UXm?utm_source=generator&si=7c76dd9301074bad",
  "https://open.spotify.com/embed/show/3ssx09faxpyVTRMHWKMdW0?utm_source=generator&si=7f85b0e7912449d9",
];

/** Spotify episode embed URLs (Share → Embed episode → the iframe's src). */
const EPISODES: string[] = [
  "https://open.spotify.com/embed/episode/2KyMXeMQS0djxazcFJZaSb/video?utm_source=generator",
  "https://open.spotify.com/embed/episode/7DCZh0UySNrMkd2E373rso/video?utm_source=generator",
  "https://open.spotify.com/embed/episode/6tjNyF02d4F4ux9RBeFUxG?utm_source=generator",
];

const YOUTUBE_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
const SPOTIFY_ALLOW =
  "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";

function youtubeFrame(src: string): HTMLIFrameElement {
  const frame = el("iframe", "media-frame media-frame-video");
  frame.src = src;
  frame.title = "YouTube video player";
  frame.allow = YOUTUBE_ALLOW;
  frame.allowFullscreen = true;
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-presentation allow-popups",
  );
  frame.loading = "lazy";
  return frame;
}

/**
 * Spotify's compact 80px player. The "/video" variant is dropped: squeezed to
 * this height it renders as a cramped thumbnail, and at full height it doesn't
 * match the audio-only shows next to it.
 */
function spotifyFrame(src: string): HTMLIFrameElement {
  const frame = el("iframe", "media-frame media-frame-audio");
  frame.src = src.replace(/\/video(?=\?|$)/, "");
  frame.title = "Spotify player";
  frame.allow = SPOTIFY_ALLOW;
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups");
  frame.loading = "lazy";
  return frame;
}

function buildMediaGrid(frames: HTMLIFrameElement[]): HTMLElement {
  const grid = el("div", "media-grid");
  for (const frame of frames) {
    const item = el("div", "media-item");
    item.appendChild(frame);
    grid.appendChild(item);
  }
  return grid;
}

const CHEVRON_SVG =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

function buildAccordionShell(
  title: string,
  panelId: string,
  count: string,
): { item: HTMLElement; panel: HTMLElement } {
  const item = el("div", "accordion-item");
  const header = el("button", "accordion-header");
  header.type = "button";
  header.setAttribute("aria-expanded", "false");
  header.setAttribute("aria-controls", panelId);
  header.appendChild(el("span", "accordion-title", title));
  header.appendChild(el("span", "accordion-count", count));
  // Rotated by CSS off aria-expanded (no <i>, so MediaAccordion leaves it alone)
  const chevron = el("span", "accordion-chevron");
  chevron.innerHTML = CHEVRON_SVG;
  header.appendChild(chevron);

  const panel = el("div", "accordion-panel");
  panel.id = panelId;
  panel.style.maxHeight = "0";
  panel.style.overflow = "hidden";
  panel.setAttribute("aria-hidden", "true");

  item.append(header, panel);
  return { item, panel };
}

function buildEmbedAccordionItem(
  title: string,
  panelId: string,
  unit: string,
  frames: HTMLIFrameElement[],
): HTMLElement {
  const { item, panel } = buildAccordionShell(
    title,
    panelId,
    `${frames.length} ${unit}`,
  );
  panel.appendChild(buildMediaGrid(frames));
  return item;
}

interface Audiobook {
  title: string;
  detail: string;
}

const AUDIOBOOKS: Audiobook[] = [
  {
    title: "The Almanack of Naval Ravikant",
    detail: "- A Guide to Wealth and Happiness (Eric Jorgenson, Tim Ferriss)",
  },
  { title: "Atomic Habits", detail: "(James Clear)" },
  { title: "The Hard Thing about Hard Things", detail: "(Ben Horowitz)" },
  {
    title: "Trump: The Art of the Deal",
    detail: "(Donald J. Trump, Tony Schwartz)",
  },
  { title: "Can't Hurt Me", detail: "(David Goggins)" },
];

function buildAudiobooksAccordionItem(): HTMLElement {
  const { item, panel } = buildAccordionShell(
    "Audiobooks",
    "audiobooks-panel",
    `${AUDIOBOOKS.length} BOOKS`,
  );
  const listWrap = el("div", "audiobooks-list");
  const ol = el("ol", "list-group");
  AUDIOBOOKS.forEach((book) => {
    const li = el("li", "list-group-item");
    li.appendChild(el("strong", undefined, book.title));
    li.appendChild(document.createTextNode(` ${book.detail}`));
    ol.appendChild(li);
  });
  listWrap.appendChild(ol);
  panel.appendChild(listWrap);
  return item;
}

function buildMediaSection(): HTMLElement {
  const block = buildBlock("Recommendations", "MOVIES · PODCASTS · BOOKS");
  const accordion = el("div", "media-accordion panel");
  accordion.append(
    buildEmbedAccordionItem(
      "Movies",
      "movies-panel",
      "FILMS",
      MOVIES.map(youtubeFrame),
    ),
    buildEmbedAccordionItem(
      "Podcasts",
      "podcasts-panel",
      "SHOWS",
      PODCASTS.map(spotifyFrame),
    ),
    buildEmbedAccordionItem(
      "Podcast episodes",
      "episodes-panel",
      "EPISODES",
      EPISODES.map(spotifyFrame),
    ),
    buildAudiobooksAccordionItem(),
  );
  block.appendChild(accordion);
  return block;
}

/* ── Life Moments (photo gallery) ─────────────────────────────────── */

const INSTAGRAM_URL = "https://www.instagram.com/jack.vanzeeland/";

function buildGalleryButton(
  id: string,
  label: string,
  text: string,
): HTMLButtonElement {
  const btn = el("button", "btn-ghost gallery-btn", text);
  btn.type = "button";
  btn.id = id;
  btn.setAttribute("aria-label", label);
  return btn;
}

function buildLifeMomentsSection(): HTMLElement {
  const block = buildBlock("Life moments", "PHOTOS");

  const gallery = el("div", "photo-gallery");
  gallery.id = "photo-gallery";
  gallery.appendChild(el("div", "photo-skeleton"));
  block.appendChild(gallery);

  const controls = el("div", "gallery-controls");
  const counter = el("span", "gallery-counter", "1 / 1");
  counter.id = "photo-counter";
  counter.setAttribute("aria-live", "polite");
  counter.setAttribute("aria-atomic", "true");

  const nav = el("div", "gallery-nav");
  nav.append(
    buildGalleryButton("prev-photo", "Previous photo", "← Prev"),
    counter,
    buildGalleryButton("next-photo", "Next photo", "Next →"),
  );

  // Static link instead of Instagram's embed.js: the embed rendered as a
  // blank white card on the dark theme and pulled in a third-party script.
  const insta = el(
    "a",
    "gallery-insta",
    "More on Instagram @jack.vanzeeland →",
  );
  insta.href = INSTAGRAM_URL;
  insta.target = "_blank";
  insta.rel = "noopener noreferrer";

  controls.append(nav, insta);
  block.appendChild(controls);
  return block;
}

/* ── Entry point ──────────────────────────────────────────────────── */

export function buildBeyondContent(): DocumentFragment {
  const fragment = document.createDocumentFragment();
  fragment.append(
    buildHero(),
    buildSportsSection(),
    buildMediaSection(),
    buildLifeMomentsSection(),
  );
  return fragment;
}
