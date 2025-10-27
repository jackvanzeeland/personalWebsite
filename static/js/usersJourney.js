/**
 * Users Journey Tracker Module
 */

const UserJourney = (function() {
    'use strict';

    // Private variables
    const TOTAL_PAGES = 14; // /, /about, /beyondTheCode, /project/wordle, /project/budget, /project/basketball, /project/matching, /project/superbowl, /project/ai_innovations_portal, /project/ai_innovations_portal/htmlGems, /project/ai_innovations_portal/chat, /case-study/wordle, /case-study/secret-santa, /case-study/basketball (excludes /journey meta page)
    let visitedPages = StorageHelper.get('visitedPages', []);

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

        // Track current page
        const currentPage = window.location.pathname;
        if (!visitedPages.includes(currentPage)) {
            visitedPages.push(currentPage);
            StorageHelper.set('visitedPages', visitedPages);

            // Track achievement
            if (window.AchievementSystem) {
                AchievementSystem.trackAction('page_visit');
            }
        }

        updateProgressBar();
    }

    /**
     * Update progress bar
     */
    function updateProgressBar() {
        const progressBar = DOMHelpers.getById('page-progress-bar');
        const progressText = DOMHelpers.getById('progress-text');
        if (!progressBar) return;

        // Exclude /journey from the count (it's a meta page, not content)
        const contentPagesVisited = visitedPages.filter(path => path !== '/journey');
        const progress = (contentPagesVisited.length / TOTAL_PAGES) * 100;
        progressBar.style.width = `${progress}%`;

        if (progressText) {
            progressText.textContent = `User's Journey: ${Math.round(progress)}% - Click to view details`;
        }
    }

    // Public API
    return {
        init
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', UserJourney.init);
