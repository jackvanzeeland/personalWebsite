/**
 * Users Journey Tracker Module
 *
 * Server-side tracking system:
 * - Server session is the ONLY source of truth
 * - Automatic tracking via Flask @app.after_request
 * - Client only reads and displays server data
 */

const UserJourney = (function() {
    'use strict';

    // Server data injected by Flask (read-only)
    const JOURNEY_DATA = window.JOURNEY_DATA || {
        visitedPages: [],
        totalPages: 13,
        allPages: []
    };

    const visitedPages = JOURNEY_DATA.visitedPages;
    const TOTAL_PAGES = JOURNEY_DATA.totalPages;

    /**
     * Initialize journey display (read-only from server)
     */
    function init() {
        const topBarWrapper = DOMHelpers.query('.top-bar-wrapper');
        if (!topBarWrapper) {
            console.warn('Top bar wrapper not found');
            return;
        }

        // Adjust body padding for top bar
        document.body.style.paddingTop = `${topBarWrapper.offsetHeight}px`;

        // Clear old localStorage data (migration to server-only tracking)
        clearOldLocalStorage();

        // Update UI from server data
        updateProgressBar();

        // Sync achievements with server journey data
        if (window.AchievementSystem) {
            AchievementSystem.syncWithJourneyData();
        }
    }

    /**
     * Clear old localStorage journey data (one-time migration)
     */
    function clearOldLocalStorage() {
        const oldData = StorageHelper.get('visitedPages', null);
        if (oldData !== null) {
            StorageHelper.remove('visitedPages');
            console.log('Journey: Cleared old localStorage data. Server is now source of truth.');
        }
    }

    /**
     * Update progress bar in top navigation (read from server data)
     */
    function updateProgressBar() {
        const progressBar = DOMHelpers.getById('page-progress-bar');
        const progressText = DOMHelpers.getById('progress-text');
        if (!progressBar) return;

        // Calculate progress (exclude /journey from count)
        const contentPagesVisited = visitedPages.filter(path => path !== '/journey');
        const progress = Math.min((contentPagesVisited.length / TOTAL_PAGES) * 100, 100);

        progressBar.style.width = `${progress}%`;

        if (progressText) {
            const percentage = Math.round(progress);

            // Update both full and mobile text spans
            const fullText = progressText.querySelector('.progress-full-text');
            const mobileText = progressText.querySelector('.progress-mobile-text');

            if (fullText) {
                fullText.textContent = `User's Journey: ${percentage}% - Click to view details`;
            }
            if (mobileText) {
                mobileText.textContent = `Journey: ${percentage}%`;
            }
        }

        console.log(`Journey: Progress ${Math.round(progress)}% (${contentPagesVisited.length}/${TOTAL_PAGES} pages)`);
    }

    // Public API
    return {
        init
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', UserJourney.init);
