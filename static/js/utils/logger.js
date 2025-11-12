/**
 * Logger Utility for Lyric Animator V2
 * Provides conditional logging for development and production environments
 */
window.Logger = {
    /**
     * Debug-level logging (only shown in development)
     * @param {...any} args - Arguments to log
     */
    debug: (...args) => {
        if (window.DEBUG || localStorage.getItem('debug') === 'true') {
            console.log('[DEBUG]', ...args);
        }
    },

    /**
     * Info-level logging (only shown in development)
     * @param {...any} args - Arguments to log
     */
    info: (...args) => {
        if (window.DEBUG || localStorage.getItem('debug') === 'true') {
            console.info('[INFO]', ...args);
        }
    },

    /**
     * Warning-level logging (always shown)
     * @param {...any} args - Arguments to log
     */
    warn: (...args) => {
        console.warn('[WARN]', ...args);
    },

    /**
     * Error-level logging (always shown)
     * @param {...any} args - Arguments to log
     */
    error: (...args) => {
        console.error('[ERROR]', ...args);
    }
};

// Set DEBUG flag (false for production, can be overridden via localStorage)
window.DEBUG = false;
