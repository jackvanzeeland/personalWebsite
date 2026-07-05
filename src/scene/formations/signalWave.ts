/**
 * Signal wave — layered sine ribbons, like a transmission.
 * Used on /contact.
 */

import { Formation, seededRandom } from '../formationTypes';

const ACCENT = '#38bdf8';
const SPREAD = 36;

export function signalWaveBuilder(count: number, aspect: number): Formation {
    const rand = seededRandom(5005);
    const targets = new Float32Array(count * 3);
    const width = SPREAD * 2 * Math.min(aspect, 1.9);

    for (let i = 0; i < count; i++) {
        const t = rand();
        const ribbon = Math.floor(rand() * 3); // 3 stacked ribbons
        const x = (t - 0.5) * width;
        const phase = ribbon * 1.9;
        const y = Math.sin(t * Math.PI * 3 + phase) * 9 + (ribbon - 1) * 7 + (rand() - 0.5) * 1.4;
        targets[i * 3] = x;
        targets[i * 3 + 1] = y;
        targets[i * 3 + 2] = (rand() - 0.5) * 10 - ribbon * 4;
    }
    return { targets, accent: ACCENT, spread: SPREAD };
}
