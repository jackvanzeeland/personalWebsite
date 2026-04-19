/**
 * Artifacts Page Entry Point
 */

import '../styles/color-scheme.css';
import '../styles/main.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';
import '../styles/components/projects.css';

import { initializeLayout } from '../components/Layout';
import { renderArtifacts } from '../components/ArtifactGrid';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧩 Artifacts page initializing...');

    initializeLayout();
    renderArtifacts();

    console.log('✅ Artifacts page ready');
});
