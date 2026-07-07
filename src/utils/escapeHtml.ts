/**
 * Escape a value for safe interpolation into innerHTML template literals,
 * both as element text and inside double-quoted attribute values.
 */
export function escapeHtml(unsafe: unknown): string {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
