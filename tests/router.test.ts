import { describe, it, expect } from 'vitest';
import { matchRoute, legacyRedirect } from '../src/app/router';

describe('matchRoute', () => {
    it('matches static routes', () => {
        expect(matchRoute('/').name).toBe('home');
        expect(matchRoute('/work').name).toBe('work');
        expect(matchRoute('/journey').name).toBe('journey');
        expect(matchRoute('/beyond').name).toBe('beyond');
        expect(matchRoute('/contact').name).toBe('contact');
    });

    it('matches work detail with slug param', () => {
        const m = matchRoute('/work/wordle-solver');
        expect(m.name).toBe('workDetail');
        expect(m.params.slug).toBe('wordle-solver');
    });

    it('ignores trailing slashes', () => {
        expect(matchRoute('/work/').name).toBe('work');
        expect(matchRoute('/journey/').name).toBe('journey');
    });

    it('unknown paths are notFound', () => {
        expect(matchRoute('/nope/nope/nope').name).toBe('notFound');
    });
});

describe('legacyRedirect', () => {
    it('maps every old page to its new home', () => {
        expect(legacyRedirect('/pages/about')).toBe('/journey');
        expect(legacyRedirect('/pages/about.html')).toBe('/journey');
        expect(legacyRedirect('/pages/journey')).toBe('/journey');
        expect(legacyRedirect('/pages/projects')).toBe('/work');
        expect(legacyRedirect('/pages/artifacts')).toBe('/work');
        expect(legacyRedirect('/pages/beyond-the-code')).toBe('/beyond');
        expect(legacyRedirect('/pages/projects/wordle-solver.html')).toBe('/work/wordle-solver');
        expect(legacyRedirect('/pages/projects/secret-santa.html')).toBe('/work/secret-santa');
        expect(legacyRedirect('/pages/projects/lyric-animator.html')).toBe('/work/lyric-animator');
        expect(legacyRedirect('/pages/projects/budgeting-automation.html')).toBe('/work/budgeting-automation');
        expect(legacyRedirect('/pages/projects/basketball-optimization.html')).toBe('/work/basketball-optimization');
        expect(legacyRedirect('/pages/artifacts/qr-code-generator.html')).toBe('/work/qr-code-generator');
        expect(legacyRedirect('/pages/artifacts/uipath-queue-processor.html')).toBe('/work/uipath-queue-processor');
        expect(legacyRedirect('/pages/artifacts/html-gems.html')).toBe('/work/html-gems');
    });

    it('returns null for new-world paths', () => {
        expect(legacyRedirect('/work')).toBeNull();
        expect(legacyRedirect('/')).toBeNull();
    });
});
