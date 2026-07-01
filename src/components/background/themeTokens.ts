/**
 * Bridges the CSS design tokens (src/styles/color-scheme.css) into three.js.
 * Always read at runtime so light/dark values stay in sync with the
 * stylesheet — never hardcode hex values here.
 */

import { Color } from 'three';

export interface SceneTokens {
    /** Primary particle color (accent blue). */
    colorA: Color;
    /** Secondary particle color (teal/green). */
    colorB: Color;
    /** Tertiary color pulled from the hero gradient end (indigo). */
    colorC: Color;
    isDark: boolean;
}

function cssColor(styles: CSSStyleDeclaration, name: string, fallback: string): Color {
    const value = styles.getPropertyValue(name).trim();
    try {
        return new Color(value || fallback);
    } catch {
        return new Color(fallback);
    }
}

export function readSceneTokens(): SceneTokens {
    const styles = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        colorA: cssColor(styles, '--accent-primary', '#0ea5e9'),
        colorB: cssColor(styles, '--accent-secondary', '#10b981'),
        // --gradient-hero is a full gradient expression, not a color, so use
        // the indigo it ends on via a dedicated token fallback.
        colorC: cssColor(styles, '--accent-primary-light', '#6366f1'),
        isDark
    };
}
