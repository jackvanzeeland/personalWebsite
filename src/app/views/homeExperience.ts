/**
 * "Years building professionally" — counted from Jack's first day at Echo
 * Global Logistics. Pure and deterministic so it can be unit-tested and
 * prerendered; the odometer and the terminal's `uptime` both read from here.
 */

export const EXPERIENCE_START = new Date('2024-02-01T09:00:00-06:00');

const YEAR_MS = 365.2425 * 86_400_000;
/** Calendar math runs on Chicago standard time so results don't depend on the visitor's zone. */
const OFFSET_MS = -6 * 3_600_000;

export function yearsSince(now: Date): number {
    return Math.max(0, (now.getTime() - EXPERIENCE_START.getTime()) / YEAR_MS);
}

export function formatYears(now: Date): string {
    return yearsSince(now).toFixed(7);
}

export function ageParts(now: Date): { years: number; months: number; days: number } {
    const a = new Date(EXPERIENCE_START.getTime() + OFFSET_MS);
    const b = new Date(Math.max(now.getTime(), EXPERIENCE_START.getTime()) + OFFSET_MS);
    let years = b.getUTCFullYear() - a.getUTCFullYear();
    let months = b.getUTCMonth() - a.getUTCMonth();
    let days = b.getUTCDate() - a.getUTCDate();
    if (days < 0) {
        months--;
        // days in the month before b's month
        days += new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months, days };
}

export function experienceAriaLabel(now: Date): string {
    return `About ${yearsSince(now).toFixed(2)} years building professionally`;
}
