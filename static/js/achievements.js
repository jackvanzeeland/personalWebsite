/**
 * Achievements System
 * Tracks and displays user achievements for portfolio engagement
 */

const AchievementSystem = (function() {
    'use strict';

    const STORAGE_KEY = 'portfolio_achievements';
    const STATS_KEY = 'achievement_stats';

    // Define all achievements
    const ACHIEVEMENTS = [
        {
            id: 'first_steps',
            title: 'First Steps',
            description: 'Visit your first project page',
            icon: '👶',
            requirement: { type: 'page_visit', count: 1 }
        },
        {
            id: 'explorer',
            title: 'Explorer',
            description: 'Visit 5 different pages',
            icon: '🗺️',
            requirement: { type: 'page_visit', count: 5 }
        },
        {
            id: 'completionist',
            title: 'Completionist',
            description: 'Visit all 14 pages',
            icon: '🏆',
            requirement: { type: 'page_visit', count: 14 }
        },
        {
            id: 'code_enthusiast',
            title: 'Code Enthusiast',
            description: 'Interact with 3 interactive projects',
            icon: '💻',
            requirement: { type: 'interactive_used', count: 3 }
        },
        {
            id: 'theme_switcher',
            title: 'Theme Switcher',
            description: 'Try both light and dark modes',
            icon: '🌗',
            requirement: { type: 'theme_switched', count: 2 }
        },
        {
            id: 'deep_dive',
            title: 'Deep Dive',
            description: 'Spend 5+ minutes on a project page',
            icon: '🤿',
            requirement: { type: 'time_spent', seconds: 300 }
        },
        {
            id: 'social_connector',
            title: 'Social Connector',
            description: 'View GitHub, YouTube, or TikTok links',
            icon: '🔗',
            requirement: { type: 'external_link', count: 1 }
        },
        {
            id: 'filter_master',
            title: 'Filter Master',
            description: 'Use project filter 3+ times',
            icon: '🔍',
            requirement: { type: 'filter_used', count: 3 }
        }
    ];

    /**
     * Get unlocked achievements from storage
     */
    function getUnlockedAchievements() {
        return StorageHelper.get(STORAGE_KEY, []);
    }

    /**
     * Get achievement stats from storage
     */
    function getStats() {
        return StorageHelper.get(STATS_KEY, {
            page_visit: 0,
            interactive_used: 0,
            theme_switched: 0,
            time_spent: 0,
            external_link: 0,
            filter_used: 0
        });
    }

    /**
     * Save stats to storage
     */
    function saveStats(stats) {
        StorageHelper.set(STATS_KEY, stats);
    }

    /**
     * Sync page_visit stat with actual journey progress
     * Single source of truth: journey tracking owns the data
     */
    function syncWithJourneyData() {
        const stats = getStats();

        // Get actual visited pages count from journey tracking
        let visitedPagesCount = 0;

        if (window.JOURNEY_DATA && window.JOURNEY_DATA.visitedPages) {
            // Use server data (authoritative)
            visitedPagesCount = window.JOURNEY_DATA.visitedPages.filter(p => p !== '/journey').length;
        } else {
            // Fallback to localStorage
            const localPages = StorageHelper.get('visitedPages', []);
            visitedPagesCount = localPages.filter(p => p !== '/journey').length;
        }

        // Update achievement stat to match reality
        if (stats.page_visit !== visitedPagesCount) {
            stats.page_visit = visitedPagesCount;
            saveStats(stats);
            console.log(`Achievements: Synced page_visit to ${visitedPagesCount}`);
        }

        return stats;
    }

    /**
     * Check if achievement is unlocked
     */
    function isUnlocked(achievementId) {
        const unlocked = getUnlockedAchievements();
        return unlocked.includes(achievementId);
    }

    /**
     * Unlock an achievement
     */
    function unlockAchievement(achievementId) {
        const unlocked = getUnlockedAchievements();

        if (!unlocked.includes(achievementId)) {
            unlocked.push(achievementId);
            StorageHelper.set(STORAGE_KEY, unlocked);

            // Find achievement details
            const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
            if (achievement) {
                showNotification(achievement);

                // Dispatch event for other systems to listen to
                document.dispatchEvent(new CustomEvent('achievement-unlocked', {
                    detail: { achievement }
                }));

                // Track analytics
                if (window.AnalyticsLogger) {
                    AnalyticsLogger.trackAchievementUnlock(achievementId);
                }
            }
        }
    }

    /**
     * Show achievement notification
     */
    function showNotification(achievement) {
        // Remove any existing notifications
        const existing = document.querySelector('.achievement-notification');
        if (existing) {
            existing.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Track an action and check for achievements
     */
    function trackAction(actionType, value = 1) {
        const stats = getStats();

        // Update stat
        if (actionType === 'time_spent') {
            stats[actionType] = Math.max(stats[actionType] || 0, value);
        } else {
            stats[actionType] = (stats[actionType] || 0) + value;
        }

        saveStats(stats);

        // Check achievements
        checkAchievements(stats);
    }

    /**
     * Check if any achievements should be unlocked
     */
    function checkAchievements(stats) {
        ACHIEVEMENTS.forEach(achievement => {
            if (isUnlocked(achievement.id)) return;

            const req = achievement.requirement;
            const statValue = stats[req.type] || 0;

            // Check if requirement is met
            let requirementMet = false;
            if (req.count !== undefined) {
                requirementMet = statValue >= req.count;
            } else if (req.seconds !== undefined) {
                requirementMet = statValue >= req.seconds;
            }

            if (requirementMet) {
                unlockAchievement(achievement.id);
            }
        });
    }

    /**
     * Get achievement progress
     */
    function getProgress() {
        const stats = getStats();
        const unlocked = getUnlockedAchievements();

        return ACHIEVEMENTS.map(achievement => {
            const req = achievement.requirement;
            const statValue = stats[req.type] || 0;
            const target = req.count || req.seconds;
            const progress = Math.min(100, (statValue / target) * 100);

            return {
                ...achievement,
                unlocked: unlocked.includes(achievement.id),
                progress: progress,
                current: statValue,
                target: target
            };
        });
    }

    /**
     * Initialize achievement system
     */
    function init() {
        // Sync with journey data first (single source of truth)
        const stats = syncWithJourneyData();

        // Check for achievements
        checkAchievements(stats);

        // Track page time for "Deep Dive" achievement
        let pageStartTime = Date.now();

        setInterval(() => {
            const timeSpent = Math.floor((Date.now() - pageStartTime) / 1000);
            trackAction('time_spent', timeSpent);
        }, 10000); // Check every 10 seconds

        // Track external link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[target="_blank"]');
            if (link) {
                const href = link.getAttribute('href');
                if (href && (href.includes('github.com') ||
                             href.includes('youtube.com') ||
                             href.includes('tiktok.com'))) {
                    trackAction('external_link');
                }
            }
        });
    }

    // Public API
    return {
        init,
        trackAction,
        getProgress,
        getUnlockedAchievements,
        isUnlocked,
        getAllAchievements: () => ACHIEVEMENTS,
        syncWithJourneyData  // Allow manual sync from journey tracking
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', AchievementSystem.init);

// Expose for other modules
window.AchievementSystem = AchievementSystem;
