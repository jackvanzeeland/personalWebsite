/**
 * Generates the 1200×630 link-preview images (Open Graph / X cards):
 *   public/og/default.jpg               — site-wide card with the headshot
 *   public/og/projects/<slug>.jpg       — one per prerendered project page
 *
 * Run manually when a project, its thumbnail, or its title changes:
 *   npm run og:images
 * Output is committed (text rendering depends on locally installed fonts,
 * so CI builds shouldn't re-render it). tests/seo.test.ts fails if a
 * prerendered project is missing its image.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { WORK_ITEMS, type WorkItem } from '../src/data/workItems';
import { prerenderRoutes, cdnOwnedProjectPaths } from '../src/site/routes';
import { resolveImageSrc } from '../src/utils/optimizedImage';
import { isIconImage } from '../src/utils/iconImage';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public/og');
const W = 1200;
const H = 630;

// Mirrors src/styles/redesign/tokens.css
const C = {
    bg: '#04070f',
    raise: '#0a1020',
    line: 'rgba(148,163,184,0.16)',
    text: '#f1f5f9',
    dim: '#94a3b8',
    cyan: '#38bdf8',
    teal: '#34d399',
    indigo: '#818cf8'
};
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "Menlo, 'SF Mono', Consolas, monospace";

function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Greedy word wrap by character budget (Helvetica bold ≈ 0.56em per glyph). */
function wrap(text: string, maxChars: number): string[] {
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
        if (line && (line + ' ' + word).length > maxChars) {
            lines.push(line);
            line = word;
        } else {
            line = line ? `${line} ${word}` : word;
        }
    }
    if (line) lines.push(line);
    return lines;
}

async function loadImage(src: string): Promise<Buffer> {
    if (/^https?:\/\//.test(src)) {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`og: ${src} → HTTP ${res.status}`);
        return Buffer.from(await res.arrayBuffer());
    }
    return fs.readFile(path.join(ROOT, 'public', src));
}

const background = `
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <defs>
    <radialGradient id="glow" cx="78%" cy="50%" r="55%">
      <stop offset="0" stop-color="ACCENT" stop-opacity="0.22"/>
      <stop offset="1" stop-color="ACCENT" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${C.line}"/>`;

function bg(accent: string): string {
    return background.replace(/ACCENT/g, accent);
}

async function defaultCard(): Promise<Buffer> {
    const size = 340;
    const photo = await sharp(path.join(ROOT, 'public/images/profile.jpg'))
        .resize(size, size, { fit: 'cover', position: 'attention' })
        .modulate({ saturation: 0.85, brightness: 0.95 })
        .composite([
            {
                input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`),
                blend: 'dest-in'
            }
        ])
        .png()
        .toBuffer();

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      ${bg(C.cyan)}
      <circle cx="905" cy="315" r="${size / 2 + 10}" fill="none" stroke="${C.cyan}" stroke-opacity="0.35" stroke-width="2"/>
      <text x="80" y="170" font-family="${MONO}" font-size="24" letter-spacing="5" fill="${C.teal}">// SOFTWARE ENGINEER — CHICAGO</text>
      <text x="80" y="275" font-family="${SANS}" font-weight="700" font-size="92" fill="${C.text}">Jack</text>
      <text x="80" y="375" font-family="${SANS}" font-weight="700" font-size="92" fill="${C.text}">Van Zeeland</text>
      <text x="80" y="445" font-family="${SANS}" font-size="30" fill="${C.dim}">Automation, AI tooling, and useful side projects.</text>
      <text x="80" y="550" font-family="${MONO}" font-size="24" letter-spacing="2" fill="${C.cyan}">jackvanzeeland.com</text>
    </svg>`;

    return sharp(Buffer.from(svg))
        .composite([{ input: photo, left: 905 - size / 2, top: 315 - size / 2 }])
        .jpeg({ quality: 84, mozjpeg: true })
        .toBuffer();
}

async function projectCard(item: WorkItem): Promise<Buffer> {
    const accent = C.indigo;
    const panelX = 640;
    const panelW = W - panelX;
    const layers: sharp.OverlayOptions[] = [];

    if (item.image) {
        const src = resolveImageSrc(item.image);
        const img = await loadImage(src);
        if (isIconImage(src)) {
            // App icon: contained and rounded on the dark panel, like the cards
            const icon = 220;
            const rounded = await sharp(img)
                .resize(icon, icon, { fit: 'contain', background: C.raise })
                .composite([
                    {
                        input: Buffer.from(`<svg width="${icon}" height="${icon}"><rect width="${icon}" height="${icon}" rx="40"/></svg>`),
                        blend: 'dest-in'
                    }
                ])
                .png()
                .toBuffer();
            layers.push({ input: rounded, left: panelX + (panelW - icon) / 2, top: (H - icon) / 2 });
        } else {
            // Photo/artwork: full-bleed on the right, graded like the cards, and
            // alpha-faded at its left edge so it melts into the background
            // (an opaque overlay band left a visible seam against the glow).
            const mask = `<svg width="${panelW}" height="${H}" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="m" x1="0" x2="1">
                <stop offset="0" stop-color="#fff" stop-opacity="0"/>
                <stop offset="0.38" stop-color="#fff" stop-opacity="1"/>
              </linearGradient></defs>
              <rect width="${panelW}" height="${H}" fill="url(#m)"/>
            </svg>`;
            const photo = await sharp(img)
                .resize(panelW, H, { fit: 'cover', position: 'attention' })
                .modulate({ saturation: 0.85, brightness: 0.85 })
                .ensureAlpha()
                .composite([{ input: Buffer.from(mask), blend: 'dest-in' }])
                .png()
                .toBuffer();
            layers.push({ input: photo, left: panelX, top: 0 });
        }
    }

    let size = 66;
    let lines = wrap(item.title, 15);
    if (lines.length > 3) {
        size = 52;
        lines = wrap(item.title, 19);
    }
    const lineH = Math.round(size * 1.12);
    // Laid out top-down from the eyebrow so long titles never collide with it
    const titleTop = 120 + 34 + size;
    const kind = `// ${item.kind.toUpperCase()}${item.tool ? ' · TRY IT IN THE BROWSER' : ''}`;
    const tech = item.technologies.slice(0, 4).join('  ·  ');

    const text = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${C.line}"/>
      <text x="70" y="120" font-family="${MONO}" font-size="22" letter-spacing="4" fill="${accent}">${esc(kind)}</text>
      ${lines
          .map(
              (l, i) =>
                  `<text x="70" y="${titleTop + i * lineH}" font-family="${SANS}" font-weight="700" font-size="${size}" fill="${C.text}">${esc(l)}</text>`
          )
          .join('\n')}
      <text x="70" y="${titleTop + lines.length * lineH + 18}" font-family="${MONO}" font-size="22" fill="${C.dim}">${esc(tech)}</text>
      <text x="70" y="560" font-family="${SANS}" font-weight="700" font-size="26" fill="${C.text}">Jack Van Zeeland</text>
      <text x="300" y="560" font-family="${MONO}" font-size="22" fill="${C.cyan}">jackvanzeeland.com</text>
    </svg>`;
    layers.push({ input: Buffer.from(text), left: 0, top: 0 });

    return sharp(Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${bg(accent)}</svg>`))
        .composite(layers)
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
}

await fs.mkdir(path.join(OUT, 'projects'), { recursive: true });
await fs.writeFile(path.join(OUT, 'default.jpg'), await defaultCard());
console.log('og: default.jpg');

const infra = await fs.readFile(path.join(ROOT, 'infrastructure.yaml'), 'utf8');
for (const route of prerenderRoutes(WORK_ITEMS, cdnOwnedProjectPaths(infra))) {
    if (!route.item) continue;
    await fs.writeFile(path.join(OUT, 'projects', `${route.item.slug}.jpg`), await projectCard(route.item));
    console.log(`og: projects/${route.item.slug}.jpg`);
}
