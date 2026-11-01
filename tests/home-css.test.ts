import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const css = readFileSync(path.resolve(__dirname, '../src/styles/redesign/home.css'), 'utf8');

/** Top-level rule blocks outside any @media, keyed by selector. */
function topLevelRule(selector: string): string | undefined {
    const withoutMedia = css.replace(/@media[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
    const m = withoutMedia.match(new RegExp(`(^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
    return m?.[2];
}

describe('home terminal CSS', () => {
    it('does not trap page scrolling on the stacked layout', () => {
        expect(topLevelRule('.home-term-body') ?? '').not.toMatch(/overscroll-behavior/);
    });

    it('gives the focused terminal a visible accent cue', () => {
        expect(topLevelRule('.home-term:focus-within') ?? '').toMatch(/var\(--accent\)/);
    });

    it('the compact (phone) terminal is see-through so the monogram shows', () => {
        const compact = css.match(/@media \(max-aspect-ratio: 11\/10\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
        const term = compact.match(/\.home-term \{([^}]*)\}/)?.[1] ?? '';
        expect(term).toMatch(/backdrop-filter:\s*none/);
        const alpha = term.match(/background:\s*rgba\([^)]*,\s*([0-9.]+)\)/)?.[1];
        expect(Number(alpha)).toBeLessThanOrEqual(0.3);
    });
});
