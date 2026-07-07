/**
 * Project lattice — a jittered hexagonal node grid with connecting dust,
 * evoking a network of built things. Used on /work.
 */

import { Formation, seededRandom } from '../formationTypes';

const ACCENT = '#818cf8';
const SPREAD = 36;

export function latticeBuilder(count: number, aspect: number): Formation {
    const rand = seededRandom(2002);
    const targets = new Float32Array(count * 3);

    const cols = 9;
    const rows = 5;
    const cellW = (SPREAD * 2 * Math.min(aspect, 1.9)) / cols;
    const cellH = 44 / rows;

    // 60% cluster tightly at hex nodes, 40% scatter as connective dust
    const nodeCount = Math.floor(count * 0.6);
    for (let i = 0; i < count; i++) {
        if (i < nodeCount) {
            const col = Math.floor(rand() * cols);
            const row = Math.floor(rand() * rows);
            const hexOffset = row % 2 === 0 ? 0 : cellW / 2;
            targets[i * 3] = (col - cols / 2) * cellW + hexOffset + (rand() - 0.5) * 1.6;
            targets[i * 3 + 1] = (row - rows / 2) * cellH + (rand() - 0.5) * 1.6;
            targets[i * 3 + 2] = (rand() - 0.5) * 8;
        } else {
            targets[i * 3] = (rand() - 0.5) * SPREAD * 2.6;
            targets[i * 3 + 1] = (rand() - 0.5) * SPREAD * 1.6;
            targets[i * 3 + 2] = -8 - rand() * 34;
        }
    }
    return { targets, accent: ACCENT, spread: SPREAD };
}
