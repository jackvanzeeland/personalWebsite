/**
 * About Page Entry Point
 */

import '../styles/color-scheme.css';
import '../styles/main.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';

import { initializeLayout } from '../components/Layout';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 About page initializing...');

    // Initialize layout components
    initializeLayout();

    console.log('✅ About page ready');
});
