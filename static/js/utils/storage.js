/**
 * LocalStorage Utility
 * Safe wrapper for localStorage operations
 */

const StorageHelper = (function() {
    'use strict';

    return {
        /**
         * Get item from localStorage with JSON parsing
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error(`Error reading from localStorage (${key}):`, error);
                return defaultValue;
            }
        },

        /**
         * Set item in localStorage with JSON stringification
         * Handles QuotaExceededError by clearing old data
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                // Handle quota exceeded error
                if (error.name === 'QuotaExceededError') {
                    console.warn('localStorage quota exceeded, attempting to clear old data');
                    
                    // Try to clear old analytics data (older than 7 days)
                    this.clearOldAnalyticsData();
                    
                    // Retry after clearing
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        console.info('Successfully stored after clearing old data');
                        return true;
                    } catch (retryError) {
                        // Still failed - notify user
                        console.error('localStorage still full after cleanup:', retryError);
                        
                        // Notify user if notification manager available
                        if (window.NotificationManager) {
                            window.NotificationManager.show(
                                'Storage full. Some features may not work properly. Try clearing browser data.',
                                'warning',
                                10000
                            );
                        }
                        return false;
                    }
                }
                
                console.error(`Error writing to localStorage (${key}):`, error);
                return false;
            }
        },
        
        /**
         * Clear old analytics data (older than 7 days)
         * @private
         */
        clearOldAnalyticsData() {
            try {
                const now = Date.now();
                const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
                
                // Look for analytics-related keys
                const keysToCheck = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.startsWith('analytics_') || key.startsWith('event_'))) {
                        keysToCheck.push(key);
                    }
                }
                
                // Remove old entries
                let cleared = 0;
                keysToCheck.forEach(key => {
                    try {
                        const item = JSON.parse(localStorage.getItem(key) || '{}');
                        if (item.timestamp && item.timestamp < sevenDaysAgo) {
                            localStorage.removeItem(key);
                            cleared++;
                        }
                    } catch {
                        // Invalid JSON or no timestamp - skip
                    }
                });
                
                console.info(`Cleared ${cleared} old analytics entries`);
            } catch (error) {
                console.error('Error clearing old analytics data:', error);
            }
        },

        /**
         * Remove item from localStorage
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error(`Error removing from localStorage (${key}):`, error);
                return false;
            }
        },

        /**
         * Clear all localStorage
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageHelper;
}
