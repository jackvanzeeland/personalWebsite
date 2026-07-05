import { describe, it, expect } from 'vitest';
import { monogramBuilder } from '../src/scene/formations/monogram';
import { latticeBuilder } from '../src/scene/formations/lattice';
import { constellationBuilder } from '../src/scene/formations/constellation';
import { nebulaBuilder } from '../src/scene/formations/nebula';
import { signalWaveBuilder } from '../src/scene/formations/signalWave';
import type { FormationBuilder } from '../src/scene/formationTypes';
import type { TimelineItem } from '../src/types';

const ITEMS: TimelineItem[] = [
    {
        id: 'a', title: 'A', organization: 'Org', type: 'education',
        startDate: '2021-09-01', endDate: '2025-05-31', isPresent: false, description: 'x'
    },
    {
        id: 'b', title: 'B', organization: 'Org', type: 'work',
        startDate: '2024-02-01', endDate: '2025-05-31', isPresent: false, description: 'x'
    },
    {
        id: 'c', title: 'C', organization: 'Org', type: 'certification',
        startDate: '2026-06-01', endDate: '2026-06-29', isPresent: false, description: 'x'
    }
];

const builders: [string, FormationBuilder][] = [
    ['monogram', monogramBuilder],
    ['lattice', latticeBuilder],
    ['constellation', constellationBuilder(ITEMS)],
    ['nebula', nebulaBuilder],
    ['signalWave', signalWaveBuilder]
];

describe.each(builders)('%s formation', (_name, builder) => {
    it('produces exactly count*3 finite coordinates within bounds', () => {
        const f = builder(500, 16 / 9);
        expect(f.targets.length).toBe(1500);
        for (let i = 0; i < f.targets.length; i++) {
            expect(Number.isFinite(f.targets[i])).toBe(true);
            expect(Math.abs(f.targets[i])).toBeLessThanOrEqual(f.spread * 2 + 40);
        }
        expect(f.spread).toBeGreaterThan(0);
        expect(f.accent).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('is deterministic for identical inputs', () => {
        const a = builder(300, 16 / 9);
        const b = builder(300, 16 / 9);
        expect(a.targets).toEqual(b.targets);
    });
});

describe('constellation specifics', () => {
    it('orders anchor clusters left-to-right by start date', () => {
        const f = constellationBuilder(ITEMS)(600, 16 / 9);
        // First N particles are the anchors (one per item), ordered chronologically
        const xA = f.targets[0];
        const xB = f.targets[3];
        const xC = f.targets[6];
        expect(xA).toBeLessThan(xB);
        expect(xB).toBeLessThan(xC);
    });
});
