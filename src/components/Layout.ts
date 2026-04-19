/**
 * Layout Component
 * Unified initialization for header, footer, and common page elements
 */

import { initializeHeader } from './Header';
import { initializeFooter } from './Footer';
import { initializeTheme } from '../utils/theme';
import { markPageAsVisited } from '../utils/journey';
import AOS from 'aos';

export interface LayoutOptions {
    includeAOS?: boolean;
    includeTheme?: boolean;
}

/**
 * Initialize common layout components for a page
 * This should be called on every page for consistency
 */
export function initializeLayout(options: LayoutOptions = {}): void {
    const {
        includeAOS = true,
        includeTheme = true
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

    console.log('✅ Layout initialized');
}
