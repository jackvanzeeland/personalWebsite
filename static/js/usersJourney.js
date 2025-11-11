/**
 * Users Journey Tracker Module
 *
 * Hybrid server/client tracking system:
 * - Server session is source of truth (handles redirects)
 * - localStorage is cache for offline/performance
 * - Always syncs with server data on page load
 */

const UserJourney = (function() {
    'use strict';

    // Use server data as source of truth
    const JOURNEY_DATA = window.JOURNEY_DATA || {
        visitedPages: [],
        totalPages: 13,
        allPages: []
    };

    let visitedPages = JOURNEY_DATA.visitedPages;
    const TOTAL_PAGES = JOURNEY_DATA.totalPages;

    /**
     * Initialize journey tracking
     */
    function init() {
        const topBarWrapper = DOMHelpers.query('.top-bar-wrapper');
        if (!topBarWrapper) {
            console.warn('Top bar wrapper not found');
            return;
        }

        // Adjust body padding for top bar
        document.body.style.paddingTop = `${topBarWrapper.offsetHeight}px`;

        // Sync localStorage with server data (server is authoritative)
        syncWithServer();

        // Track current page client-side (as backup)
        trackCurrentPage();

        // Update UI
        updateProgressBar();
    }

    /**
     * Sync localStorage with server session data
     */
    function syncWithServer() {
        if (JOURNEY_DATA.visitedPages && JOURNEY_DATA.visitedPages.length > 0) {
            // Server has data - use it and update localStorage
            visitedPages = JOURNEY_DATA.visitedPages;
            StorageHelper.set('visitedPages', visitedPages);
            console.log(`Journey: Synced ${visitedPages.length} pages from server`);
        } else {
            // Server has no data - try localStorage
            const localPages = StorageHelper.get('visitedPages', []);
            if (localPages.length > 0) {
                visitedPages = localPages;
                console.log(`Journey: Using ${localPages.length} pages from localStorage`);
            }
        }
    }

    /**
     * Track current page visit (client-side backup)
     */
    function trackCurrentPage() {
        const currentPage = window.location.pathname;

        // Don't track /journey itself
        if (currentPage === '/journey') {
            return;
        }

        // Check if page is trackable
        const isTrackable = JOURNEY_DATA.allPages.some(page => page.path === currentPage);

        if (isTrackable && !visitedPages.includes(currentPage)) {
            // Add to local tracking (will be synced with server on next page load)
            visitedPages.push(currentPage);
            StorageHelper.set('visitedPages', visitedPages);

            // Sync achievements with updated journey data (single source of truth)
            if (window.AchievementSystem) {
                AchievementSystem.syncWithJourneyData();
            }

            console.log(`Journey: Tracked ${currentPage} (${visitedPages.length}/${TOTAL_PAGES})`);
        }
    }

    /**
     * Update progress bar in top navigation
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
