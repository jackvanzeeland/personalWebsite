/**
 * Project Interaction Tracker
 *
 * Adds analytics tracking to all project card interactions.
 * Tracks: title clicks, action button clicks (YouTube, TikTok, Demo, Webpage, GitHub)
 *
 * Dependencies: analytics-logger.js must be loaded first
 * Auto-initializes on DOMContentLoaded
 */

(function() {
    'use strict';

    /**
     * Initialize tracking for all project interactions
     * Can be called multiple times safely (removes old listeners)
     */
    function initProjectTracking() {
        // Track project title clicks
        attachTitleTracking();

        // Track action button clicks
        attachButtonTracking();
    }

    /**
     * Attach click tracking to project title links
     * Handles both internal project pages and external GitHub links
     */
    function attachTitleTracking() {
        document.querySelectorAll('.project-title-link').forEach(link => {
            // Remove existing listener if present (prevents duplicates)
            link.removeEventListener('click', handleTitleClick);
            link.addEventListener('click', handleTitleClick);
        });
    }

    /**
     * Handle project title click events
     */
    function handleTitleClick(event) {
        const projectTitle = this.textContent.trim();
        const isExternalLink = this.getAttribute('href')?.startsWith('http');
        const interactionType = isExternalLink ? 'github_click' : 'title_click';

        trackInteraction(projectTitle, interactionType);
    }

    /**
     * Attach click tracking to all action buttons
     * Identifies button type by icon class
     */
    function attachButtonTracking() {
        document.querySelectorAll('.project-card-wrapper .btn').forEach(button => {
            // Skip if button is not an action button
            const card = button.closest('.project-card-wrapper');
            if (!card) return;

            // Remove existing listener if present (prevents duplicates)
            button.removeEventListener('click', handleButtonClick);
            button.addEventListener('click', handleButtonClick);
        });
    }

    /**
     * Handle action button click events
     */
    function handleButtonClick(event) {
        const card = this.closest('.project-card-wrapper');
        if (!card) return;

        const titleLink = card.querySelector('.project-title-link');
        const projectTitle = titleLink ? titleLink.textContent.trim() : 'Unknown Project';

        // Determine button type from icon classes
        let interactionType = 'button_click'; // fallback

        if (this.querySelector('.fa-youtube')) {
            interactionType = 'youtube_click';
        } else if (this.querySelector('.fa-tiktok')) {
            interactionType = 'tiktok_click';
        } else if (this.querySelector('.fa-play')) {
            interactionType = 'demo_click';
        } else if (this.querySelector('.fa-link')) {
            interactionType = 'webpage_click';
        } else if (this.querySelector('.fa-github')) {
            interactionType = 'github_click';
        }

        trackInteraction(projectTitle, interactionType);
    }

    /**
     * Track project interaction if AnalyticsLogger is available
     */
    function trackInteraction(projectTitle, interactionType) {
        if (window.AnalyticsLogger && typeof window.AnalyticsLogger.trackProjectInteraction === 'function') {
            window.AnalyticsLogger.trackProjectInteraction(projectTitle, interactionType);
        } else {
            // Silent fail - don't break page functionality
            console.debug('AnalyticsLogger not available for tracking:', projectTitle, interactionType);
        }
    }

    /**
     * Re-initialize tracking after project filter changes
     */
    function reinitializeAfterFilter() {
        setTimeout(initProjectTracking, 100);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectTracking);
    } else {
        initProjectTracking();
    }

    // Hook into filter events
    document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('projectsFiltered', reinitializeAfterFilter);

        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(reinitializeAfterFilter, 250);
        });
    });

    // Expose init function for manual re-initialization
    window.ProjectInteractionTracker = {
        init: initProjectTracking,
        version: '1.0.0'
    };

})();
