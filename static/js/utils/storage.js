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
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error(`Error writing to localStorage (${key}):`, error);
                return false;
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
