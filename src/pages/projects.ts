/**
 * Projects Page Entry Point
 */

import '../styles/color-scheme.css';
import '../styles/main.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';
import '../styles/components/projects.css';

import { initializeLayout } from '../components/Layout';
import { loadProjects, initializeFiltering } from '../components/ProjectGrid';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📂 Projects page initializing...');

    // Initialize layout components
    initializeLayout();

    // Load projects and initialize filtering
    loadProjects().then(() => {
        initializeFiltering();
        console.log('✅ Projects page ready');
    });
});
