import { describe, it, expect } from 'vitest';
import { parseLocalDate } from '../src/utils/dates';

describe('parseLocalDate', () => {
    it('parses YYYY-MM-DD as a LOCAL date (no UTC shift)', () => {
        const d = parseLocalDate('2024-02-01');
        expect(d.getFullYear()).toBe(2024);
        expect(d.getMonth()).toBe(1); // February in every timezone
        expect(d.getDate()).toBe(1);
    });

    it('parses YYYY-MM as the first of the month', () => {
        const d = parseLocalDate('2025-06');
        expect(d.getFullYear()).toBe(2025);
        expect(d.getMonth()).toBe(5);
        expect(d.getDate()).toBe(1);
    });

    it('returns Invalid Date for garbage', () => {
        expect(isNaN(parseLocalDate('not-a-date').getTime())).toBe(true);
    });
});
