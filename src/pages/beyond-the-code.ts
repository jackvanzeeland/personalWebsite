/**
 * Beyond the Code Page Entry Point
 */

import '../styles/color-scheme.css';
import '../styles/main.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';

import { initializeLayout } from '../components/Layout';

// Import components so Vite bundles them (they self-initialize)
import '../components/MediaAccordion';
import '../components/PhotoGallery';
import '../components/InstagramGallery';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Beyond the Code page initializing...');

    // Initialize layout components
    initializeLayout();

    console.log('✅ Beyond the Code page ready');
});
