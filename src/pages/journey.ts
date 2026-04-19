/**
 * Journey Page Entry Point
 */

import '../styles/color-scheme.css';
import '../styles/main.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';

import { initializeLayout } from '../components/Layout';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Journey page initializing...');

    // Initialize layout components
    initializeLayout();

    // Note: Journey dashboard is initialized by JourneyDashboard.js
    // which handles all journey-specific UI and data management

    console.log('✅ Journey page ready');
});
