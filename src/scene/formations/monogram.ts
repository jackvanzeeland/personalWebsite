/**
 * "JVZ" monogram formation — particles assemble into the initials.
 *
 * In the browser, glyph coverage is sampled from an offscreen 2D canvas
 * (same technique as PR #1's HeroParticles). Unit tests run in happy-dom
 * where canvas 2D is unavailable, so a deterministic block-letter grid
 * fallback stands in — also the runtime fallback if canvas ever fails.
 */

import { Formation, seededRandom } from '../formationTypes';

const ACCENT = '#38bdf8';
const SPREAD = 34;

/** 5x7 block glyphs — enough fidelity for a particle cloud. */
const GLYPHS: Record<string, string[]> = {
    J: ['#####', '   # ', '   # ', '   # ', '#  # ', '#  # ', ' ##  '],
    V: ['#   #', '#   #', '#   #', '#   #', '#   #', ' # # ', '  #  '],
    Z: ['#####', '    #', '   # ', '  #  ', ' #   ', '#    ', '#####']
};

function blockLetterPoints(text: string): [number, number][] {
    const pts: [number, number][] = [];
    let xOffset = 0;
    for (const ch of text) {
        const glyph = GLYPHS[ch];
        if (!glyph) continue;
        glyph.forEach((row, y) => {
            [...row].forEach((cell, x) => {
                if (cell === '#') pts.push([xOffset + x, y]);
            });
        });
        xOffset += 6.5; // 5 wide + gap
    }
    return pts;
}

function canvasPoints(text: string): [number, number][] | null {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 120;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return null;
        ctx.font = '900 100px -apple-system, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(text, 160, 60);
        const data = ctx.getImageData(0, 0, 320, 120).data;
        const pts: [number, number][] = [];
        for (let y = 0; y < 120; y += 2) {
            for (let x = 0; x < 320; x += 2) {
                if (data[(y * 320 + x) * 4 + 3] > 128) pts.push([x / 8, y / 8]);
            }
        }
        return pts.length > 40 ? pts : null;
    } catch {
        return null;
    }
}

export function monogramBuilder(count: number, aspect: number): Formation {
    const rand = seededRandom(1001);
    const pts = canvasPoints('JVZ') ?? blockLetterPoints('JVZ');

    // Normalize to centered world space
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y] of pts) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
    const w = Math.max(maxX - minX, 1);
    const h = Math.max(maxY - minY, 1);
    const scale = Math.min((SPREAD * Math.min(aspect, 1.9)) / w, 26 / h);

    const targets = new Float32Array(count * 3);
    // ~85% form the glyphs, the rest stay ambient dust around them
    const glyphCount = Math.floor(count * 0.85);
    for (let i = 0; i < count; i++) {
        if (i < glyphCount) {
            const [gx, gy] = pts[Math.floor(rand() * pts.length)];
            targets[i * 3] = (gx - minX - w / 2) * scale + (rand() - 0.5) * 0.6;
            targets[i * 3 + 1] = -(gy - minY - h / 2) * scale + (rand() - 0.5) * 0.6;
            targets[i * 3 + 2] = (rand() - 0.5) * 6;
        } else {
            targets[i * 3] = (rand() - 0.5) * SPREAD * 2.4;
            targets[i * 3 + 1] = (rand() - 0.5) * SPREAD * 1.5;
            targets[i * 3 + 2] = -10 - rand() * 30;
        }
    }
    return { targets, accent: ACCENT, spread: SPREAD };
}
