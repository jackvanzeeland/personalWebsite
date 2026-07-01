/**
 * Layout Component
 * Unified initialization for header, footer, and common page elements
 */

import { initializeHeader } from './Header';
import { initializeFooter } from './Footer';
import { initializeTheme } from '../utils/theme';
import { markPageAsVisited } from '../utils/journey';
import { getGraphicsTier } from '../utils/capabilities';
import AOS from 'aos';
import '../styles/components/background.css';

export interface LayoutOptions {
    includeAOS?: boolean;
    includeTheme?: boolean;
    /**
     * Ambient WebGL background intensity for this page.
     * Defaults to 'subtle'; the homepage passes 'full'; pages with their own
     * canvas effects (e.g. lyric animator) pass 'off'.
     * A `<body data-ambient="off">` attribute also disables it.
     */
    background?: { intensity: 'off' | 'subtle' | 'full' };
}

/**
 * Lazily mount the ambient background: never before first paint, never on
 * incapable devices, and never competing with page load.
 *
 * High tier (desktop-class): mount in an idle slot after the load event.
 * Low tier (phones/weak CPUs): wait for the first user interaction so the
 * three.js download/compile can't take time from content on slow hardware —
 * in practice the effect appears on the first scroll.
 */
function scheduleAmbientBackground(intensity: 'subtle' | 'full'): void {
    if (document.body.dataset.ambient === 'off') return;

    const tier = getGraphicsTier();
    if (tier === 'none') return;

    const mount = (): void => {
        import('./background/AmbientScene')
            .then(({ createAmbientScene }) => createAmbientScene({ intensity, tier }))
            .catch(() => { /* background is a progressive enhancement — never break the page */ });
    };

    const whenIdle = (): void => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(mount, { timeout: 3000 });
        } else {
            setTimeout(mount, 350);
        }
    };

    if (tier === 'low') {
        const events: (keyof WindowEventMap)[] = ['scroll', 'pointerdown', 'keydown'];
        const onFirstInteraction = (): void => {
            events.forEach(e => window.removeEventListener(e, onFirstInteraction));
            whenIdle();
        };
        events.forEach(e => window.addEventListener(e, onFirstInteraction, { passive: true, once: false }));
        return;
    }

    if (document.readyState === 'complete') {
        whenIdle();
    } else {
        window.addEventListener('load', whenIdle, { once: true });
    }
}

/**
 * Initialize common layout components for a page
 * This should be called on every page for consistency
 */
export function initializeLayout(options: LayoutOptions = {}): void {
    const {
        includeAOS = true,
        includeTheme = true,
        background = { intensity: 'subtle' as const }
    } = options;

    // Add header and footer
    initializeHeader();
    initializeFooter();

    // Initialize AOS animations
    if (includeAOS) {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }

    // Initialize theme
    if (includeTheme) {
        initializeTheme();
    }

    // Track page visit for journey system
    markPageAsVisited();

    // Ambient WebGL background (lazy, capability-gated)
    if (background.intensity !== 'off') {
        scheduleAmbientBackground(background.intensity);
    }

    console.log('✅ Layout initialized');
}
