/**
 * Analytics Logger Module
 * Tracks user interactions and sends to backend
 */

const AnalyticsLogger = (function() {
    'use strict';

    const STORAGE_KEY = 'session_id';
    const BATCH_SIZE = 10;
    const BATCH_INTERVAL = 30000; // 30 seconds

    let eventQueue = [];
    let sessionId = null;
    let pageStartTime = null;
    let maxScrollDepth = 0;

    /**
     * Generate or retrieve session ID
     */
    function getSessionId() {
        if (sessionId) return sessionId;

        // Check for existing session (expires after 30 minutes)
        const stored = StorageHelper.get(STORAGE_KEY);
        if (stored && stored.expires > Date.now()) {
            sessionId = stored.id;
            return sessionId;
        }

        // Generate new session ID
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        StorageHelper.set(STORAGE_KEY, {
            id: sessionId,
            expires: Date.now() + (30 * 60 * 1000) // 30 minutes
        });

        return sessionId;
    }

    /**
     * Log event to queue
     */
    function logEvent(eventType, eventData = {}) {
        const event = {
            session_id: getSessionId(),
            event_type: eventType,
            event_data: eventData,
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_width: window.screen.width,
            screen_height: window.screen.height
        };

        eventQueue.push(event);

        // Send batch if queue is full
        if (eventQueue.length >= BATCH_SIZE) {
            sendBatch();
        }
    }

    /**
     * Send batch of events to backend
     */
    async function sendBatch() {
        if (eventQueue.length === 0) return;

        const batch = [...eventQueue];
        eventQueue = [];

        try {
            await APIClient.post('/api/analytics/events', {
                events: batch
            });
        } catch (error) {
            console.error('Analytics batch failed:', error);
            // Re-add to queue on failure
            eventQueue.unshift(...batch);
        }
    }

    /**
     * Calculate scroll depth percentage
     */
    function getScrollDepth() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const maxScroll = documentHeight - windowHeight;

        if (maxScroll <= 0) return 100;

        return Math.min(100, Math.floor((scrollTop / maxScroll) * 100));
    }

    /**
     * Track page view
     */
    function trackPageView() {
        pageStartTime = Date.now();
        maxScrollDepth = 0;

        logEvent('page_view', {
            referrer: document.referrer,
            title: document.title
        });
    }

    /**
     * Track page exit and time spent
     */
    function trackPageExit() {
        if (!pageStartTime) return;

        const timeSpent = Math.floor((Date.now() - pageStartTime) / 1000); // seconds

        logEvent('page_exit', {
            time_spent: timeSpent,
            scroll_depth: maxScrollDepth
        });

        // Send remaining events immediately
        sendBatch();
    }

    /**
     * Track project interaction
     */
    function trackProjectInteraction(projectName, interactionType) {
        logEvent('project_interaction', {
            project: projectName,
            interaction_type: interactionType
        });
    }

    /**
     * Track filter usage
     */
    function trackFilterUsage(filterTag) {
        logEvent('filter_used', {
            tag: filterTag
        });
    }

    /**
     * Track theme switch
     */
    function trackThemeSwitch(newTheme) {
        logEvent('theme_switched', {
            theme: newTheme
        });
    }

    /**
     * Track achievement unlock
     */
    function trackAchievementUnlock(achievementId) {
        logEvent('achievement_unlocked', {
            achievement: achievementId
        });
    }

    /**
     * Initialize analytics
     */
    function init() {
        // Track initial page view
        trackPageView();

        // Track page exit
        window.addEventListener('beforeunload', trackPageExit);

        // Periodic batch sending
        setInterval(sendBatch, BATCH_INTERVAL);

        // Track scroll depth at intervals
        window.addEventListener('scroll', () => {
            const currentDepth = getScrollDepth();
            if (currentDepth > maxScrollDepth && currentDepth % 25 === 0) {
                maxScrollDepth = currentDepth;
                logEvent('scroll_depth', { depth: currentDepth });
            }
        });
    }

    // Public API
    return {
        init,
        trackPageView,
        trackProjectInteraction,
        trackFilterUsage,
        trackThemeSwitch,
        trackAchievementUnlock,
        logEvent
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', AnalyticsLogger.init);

// Expose for use by other modules
window.AnalyticsLogger = AnalyticsLogger;
