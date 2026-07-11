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
