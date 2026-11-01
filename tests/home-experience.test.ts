import { describe, it, expect } from 'vitest';
import {
    EXPERIENCE_START,
    ageParts,
    experienceAriaLabel,
    formatYears,
    yearsSince
} from '../src/app/views/homeExperience';

const NOW = new Date('2026-11-01T09:00:00-06:00'); // exactly 1004 days after start

describe('home experience math', () => {
    it('starts on Feb 1, 2024 (Echo)', () => {
        expect(EXPERIENCE_START.toISOString()).toBe('2024-02-01T15:00:00.000Z');
    });

    it('formats decimal years to 7 places', () => {
        expect(formatYears(NOW)).toBe('2.7488586');
        expect(yearsSince(NOW)).toBeCloseTo(1004 / 365.2425, 10);
    });

    it('is zero at start and clamps before it', () => {
        expect(formatYears(EXPERIENCE_START)).toBe('0.0000000');
        expect(formatYears(new Date('2020-01-01'))).toBe('0.0000000');
    });

    it('splits calendar parts', () => {
        expect(ageParts(NOW)).toEqual({ years: 2, months: 9, days: 0 });
    });

    it('borrows days across month ends', () => {
        expect(ageParts(new Date('2026-03-15T09:00:00-06:00'))).toEqual({ years: 2, months: 1, days: 14 });
    });

    it('aria label rounds to 2 places', () => {
        expect(experienceAriaLabel(NOW)).toBe('About 2.75 years building professionally');
    });
});
