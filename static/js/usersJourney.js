/**
 * Users Journey Tracker Module
 */

const UserJourney = (function() {
    'use strict';

    // Private variables
    const TOTAL_PAGES = 14; // about, basketball, budget, home, matching, beyondTheCode, superbowl, wordle, ai_innovations_portal, htmlGems, chatBoard, wordle_case_study, secret_santa_case_study, basketball_case_study
    let visitedPages = StorageHelper.get('visitedPages', []);

    /**
     * Format page pathname for display
     */
    function formatPageName(page) {
        if (page === '/') {
            return 'Home';
        }
        // Remove leading slash and .html extension
        let formatted = page.replace(/^\/|\.html$/g, '');
        // Insert space before capital letters for camelCase
        formatted = formatted.replace(/([A-Z])/g, ' $1');
        // Replace underscores and hyphens with spaces
        formatted = formatted.replace(/[_-]/g, ' ');
        // Capitalize the first letter of each word
        return formatted.replace(/\b\w/g, char => char.toUpperCase());
    }

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
        updateDropdown();
    }

    /**
     * Update progress bar
     */
    function updateProgressBar() {
        const progressBar = DOMHelpers.getById('page-progress-bar');
        if (!progressBar) return;

        const progress = (visitedPages.length / TOTAL_PAGES) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.innerHTML = `User's Journey: ${Math.round(progress)}%`;

        // Show reset button when journey is complete
        if (progress === 100) {
            const resetBtn = DOMHelpers.getById('reset-journey-btn');
            if (resetBtn) {
                resetBtn.style.display = 'inline-block';
            }
        }
    }

    /**
     * Update dropdown menu
     */
    function updateDropdown() {
        const dropdown = DOMHelpers.getById('journey-dropdown');
        if (!dropdown) return;

        dropdown.innerHTML = ''; // Clear existing items

        visitedPages.forEach(page => {
            const pageName = formatPageName(page);
            const link = DOMHelpers.create('a', {
                attrs: { href: page },
                text: pageName
            });
            dropdown.appendChild(link);
        });
    }

    /**
     * Toggle dropdown visibility
     */
    function toggleDropdown() {
        const dropdown = DOMHelpers.getById('journey-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    /**
     * Reset journey tracking
     */
    function resetJourney() {
        visitedPages = [];
        StorageHelper.remove('visitedPages');
        window.location.reload();
    }

    // Public API
    return {
        init,
        toggleDropdown,
        resetJourney
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', UserJourney.init);

// Expose functions needed by HTML onclick handlers
window.toggleDropdown = UserJourney.toggleDropdown;
window.resetJourney = UserJourney.resetJourney;
