/**
 * Photo-dust nebula — three soft gaussian clouds, warm and organic.
 * Used on /beyond.
 */

import { Formation, seededRandom } from '../formationTypes';

const ACCENT = '#fbbf24';
const SPREAD = 34;

function gaussian(rand: () => number): number {
    // Box-Muller
    const u = Math.max(rand(), 1e-9);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const CLOUDS: [number, number, number, number][] = [
    // x, y, z, radius
    [-16, 6, -4, 7],
    [10, -4, -10, 9],
    [22, 10, -18, 6]
];

export function nebulaBuilder(count: number, _aspect: number): Formation {
    const rand = seededRandom(4004);
    const targets = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const [cx, cy, cz, r] = CLOUDS[i % CLOUDS.length];
        targets[i * 3] = cx + gaussian(rand) * r;
        targets[i * 3 + 1] = cy + gaussian(rand) * r * 0.7;
        targets[i * 3 + 2] = cz + gaussian(rand) * r * 0.5;
    }
    return { targets, accent: ACCENT, spread: SPREAD };
}
