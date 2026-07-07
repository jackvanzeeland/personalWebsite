/**
 * Shared types for the particle formation system.
 * Pure module — no three.js imports, fully unit-testable.
 */

export interface Formation {
    /** xyz triplets, length = 3 * particle count */
    targets: Float32Array;
    /** hex accent color the scene lerps toward during the morph */
    accent: string;
    /** approximate world-space half-extent, used for camera framing */
    spread: number;
}

export type FormationBuilder = (count: number, aspect: number) => Formation;

/** Deterministic PRNG (mulberry32) so formations are stable across mounts. */
export function seededRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
