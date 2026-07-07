/**
 * Graphics capability detection for the WebGL experience layer.
 *
 * Cheap and synchronous — safe to import statically from Layout. The heavy
 * three.js modules are only dynamically imported when the tier allows it.
 *
 * Tiers:
 *  - 'none': no canvas animation at all (reduced motion, data saver, no WebGL)
 *  - 'low':  fewer particles, capped frame rate, no pointer forces
 *  - 'high': the full experience
 */

export type GraphicsTier = 'none' | 'low' | 'high';

interface NetworkInformationLike {
    saveData?: boolean;
}

export function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getGraphicsTier(): GraphicsTier {
    if (prefersReducedMotion()) return 'none';

    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    if (connection?.saveData) return 'none';

    try {
        const canvas = document.createElement('canvas');
        if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) return 'none';
    } catch {
        return 'none';
    }

    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const lowCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
    const smallScreen = Math.min(window.screen.width, window.screen.height) < 480;

    return coarsePointer || lowCpu || smallScreen ? 'low' : 'high';
}
