/**
 * Generic Project Page Entry Point
 * Used by all individual project pages
 */

import '../styles/color-scheme.css';
import '../styles/main.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';

import { initializeLayout } from '../components/Layout';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Project page initializing...');

    // Initialize layout components
    initializeLayout();

    // Log project page info (no analytics tracking)
    const projectName = window.location.pathname.split('/').pop()?.replace('.html', '') || 'unknown';
    console.log(`📂 Project page ready: ${projectName}`);
});
