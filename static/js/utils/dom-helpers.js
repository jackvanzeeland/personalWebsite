/**
 * DOM Helper Utilities
 * Provides common DOM operations and element validation
 */

const DOMHelpers = (function() {
    'use strict';

    // Cache for frequently accessed elements
    const cache = new Map();

    return {
        /**
         * Get element by ID with optional caching
         */
        getById(id, useCache = true) {
            if (useCache && cache.has(id)) {
                return cache.get(id);
            }

            const element = document.getElementById(id);

            if (useCache && element) {
                cache.set(id, element);
            }

            return element;
        },

        /**
         * Get element by selector
         */
        query(selector) {
            return document.querySelector(selector);
        },

        /**
         * Get all elements matching selector
         */
        queryAll(selector) {
            return document.querySelectorAll(selector);
        },

        /**
         * Validate required elements exist
         * @param {Object} elementMap - Map of name -> element
         * @throws {Error} if any elements are missing
         */
        requireElements(elementMap) {
            const missing = [];

            for (const [name, element] of Object.entries(elementMap)) {
                if (!element) {
                    missing.push(name);
                    console.error(`Required element not found: ${name}`);
                }
            }

            if (missing.length > 0) {
                throw new Error(`Missing required elements: ${missing.join(', ')}`);
            }

            return true;
        },

        /**
         * Create element with options
         */
        create(tag, options = {}) {
            const element = document.createElement(tag);

            if (options.classes) {
                element.classList.add(...options.classes);
            }

            if (options.attrs) {
                Object.entries(options.attrs).forEach(([key, value]) => {
                    element.setAttribute(key, value);
                });
            }

            if (options.text) {
                element.textContent = options.text;
            }

            if (options.html) {
                element.innerHTML = options.html;
            }

            return element;
        },

        /**
         * Clear element cache
         */
        clearCache() {
            cache.clear();
        }
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMHelpers;
}
