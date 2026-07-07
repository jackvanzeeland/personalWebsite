/**
 * Local-timezone date parsing for data files.
 *
 * `new Date('2024-02-01')` parses as UTC midnight, which the old timeline
 * rendered one month early in US timezones. Parsing the parts explicitly
 * constructs a local date, so formatted output matches the data everywhere.
 */

export function parseLocalDate(iso: string): Date {
    const m = iso.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
    if (!m) return new Date(NaN);
    return new Date(Number(m[1]), Number(m[2]) - 1, m[3] ? Number(m[3]) : 1);
}
