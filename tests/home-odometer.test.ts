import { describe, it, expect, vi, afterEach } from 'vitest';
import { createOdometer } from '../src/app/views/homeOdometer';

const FIXED = new Date('2026-11-01T09:00:00-06:00'); // "2.7488586"

const strips = (el: HTMLElement) =>
    [...el.querySelectorAll<HTMLElement>('.home-odo-strip')].map((s) => s.style.transform);

describe('home odometer', () => {
    afterEach(() => vi.useRealTimers());

    it('renders the current value as digit strips', () => {
        const o = createOdometer({ reducedMotion: false, now: () => FIXED });
        const digits = strips(o.el);
        expect(digits).toHaveLength(8);
        expect(digits[0]).toBe('translateY(-2em)');
        expect(digits[7]).toBe('translateY(-6em)');
        expect(o.el.querySelector('.home-odo-sep')?.textContent).toBe('.');
        expect(o.el.querySelector('.home-odo-value')?.getAttribute('aria-hidden')).toBe('true');
        expect(o.el.querySelector('.home-odo-label')?.textContent).toBe('BUILDING PROFESSIONALLY');
        expect(o.el.querySelector('.home-odo-unit')?.textContent).toBe('years and counting');
        expect(o.el.getAttribute('aria-label')).toBe('About 2.75 years building professionally');
        o.destroy();
    });

    it('ticks every 100ms and stops after destroy', () => {
        vi.useFakeTimers();
        const now = vi.fn(() => FIXED);
        const o = createOdometer({ reducedMotion: false, now });
        const base = now.mock.calls.length;
        vi.advanceTimersByTime(100);
        expect(now.mock.calls.length).toBeGreaterThan(base);
        o.destroy();
        const after = now.mock.calls.length;
        vi.advanceTimersByTime(1000);
        expect(now.mock.calls.length).toBe(after);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('reduced motion ticks once per second', () => {
        vi.useFakeTimers();
        const now = vi.fn(() => FIXED);
        const o = createOdometer({ reducedMotion: true, now });
        const base = now.mock.calls.length;
        vi.advanceTimersByTime(999);
        expect(now.mock.calls.length).toBe(base);
        vi.advanceTimersByTime(1);
        expect(now.mock.calls.length).toBeGreaterThan(base);
        o.destroy();
    });

    it('updates digits as time moves', () => {
        vi.useFakeTimers();
        let t = FIXED.getTime();
        const o = createOdometer({ reducedMotion: false, now: () => new Date(t) });
        const before = strips(o.el).join();
        t += 60_000; // ~1.9e-6 years → last digits change
        vi.advanceTimersByTime(100);
        expect(strips(o.el).join()).not.toBe(before);
        o.destroy();
    });
});
