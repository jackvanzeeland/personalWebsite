import { describe, it, expect } from 'vitest';
import { seededRandom } from '../src/scene/formationTypes';

describe('seededRandom', () => {
    it('same seed produces the same sequence', () => {
        const a = seededRandom(42);
        const b = seededRandom(42);
        for (let i = 0; i < 10; i++) {
            expect(a()).toBe(b());
        }
    });

    it('different seeds diverge', () => {
        const a = seededRandom(1);
        const b = seededRandom(2);
        const seqA = Array.from({ length: 5 }, () => a());
        const seqB = Array.from({ length: 5 }, () => b());
        expect(seqA).not.toEqual(seqB);
    });

    it('values stay in [0, 1)', () => {
        const r = seededRandom(7);
        for (let i = 0; i < 1000; i++) {
            const v = r();
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThan(1);
        }
    });
});
