/**
 * Career constellation — timeline entries become bright anchor stars laid
 * out chronologically left→right, with dust drifting between them.
 * Built from the actual timeline.json items. Used on /journey.
 */

import { FormationBuilder, seededRandom } from '../formationTypes';
import { parseLocalDate } from '../../utils/dates';
import type { TimelineItem } from '../../types';

const ACCENT = '#34d399';
const SPREAD = 38;

export function constellationBuilder(items: TimelineItem[]): FormationBuilder {
    return (count, aspect) => {
        const rand = seededRandom(3003);
        const targets = new Float32Array(count * 3);

        const sorted = [...items].sort(
            (a, b) => parseLocalDate(a.startDate).getTime() - parseLocalDate(b.startDate).getTime()
        );
        const times = sorted.map((i) => parseLocalDate(i.startDate).getTime());
        const min = times[0] ?? 0;
        const range = Math.max((times[times.length - 1] ?? 1) - min, 1);
        const width = SPREAD * 2 * Math.min(aspect, 1.9) * 0.82;

        const anchors: [number, number, number][] = sorted.map((item, idx) => {
            const t = (times[idx] - min) / range;
            const y = (rand() - 0.5) * 30 + (item.type === 'work' ? 6 : item.type === 'education' ? -6 : 0);
            return [(t - 0.5) * width, y, (rand() - 0.5) * 6];
        });

        const n = anchors.length;
        // First n particles ARE the anchors (tested); each anchor also gets a halo
        const haloPer = n > 0 ? Math.floor((count * 0.45) / n) : 0;

        for (let i = 0; i < count; i++) {
            if (i < n) {
                const [x, y, z] = anchors[i];
                targets[i * 3] = x;
                targets[i * 3 + 1] = y;
                targets[i * 3 + 2] = z;
            } else if (n > 0 && i < n + n * haloPer) {
                const anchor = anchors[Math.floor((i - n) / haloPer) % n];
                const angle = rand() * Math.PI * 2;
                const radius = 0.6 + rand() * 2.4;
                targets[i * 3] = anchor[0] + Math.cos(angle) * radius;
                targets[i * 3 + 1] = anchor[1] + Math.sin(angle) * radius;
                targets[i * 3 + 2] = anchor[2] + (rand() - 0.5) * 2;
            } else {
                targets[i * 3] = (rand() - 0.5) * SPREAD * 2.5;
                targets[i * 3 + 1] = (rand() - 0.5) * SPREAD * 1.5;
                targets[i * 3 + 2] = -10 - rand() * 32;
            }
        }
        return { targets, accent: ACCENT, spread: SPREAD };
    };
}
