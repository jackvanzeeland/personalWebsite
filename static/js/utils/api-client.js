/**
 * API Client Utility
 * Standardized fetch wrapper for API calls
 */

const APIClient = (function() {
    'use strict';

    /**
     * Handle fetch response
     */
    async function handleResponse(response) {
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            throw error;
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }

        return response.text();
    }

    return {
        /**
         * POST request
         */
        async post(url, data = {}) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                return await handleResponse(response);
            } catch (error) {
                console.error('POST request failed:', error);
                throw error;
            }
        },

        /**
         * GET request
         */
        async get(url) {
            try {
                const response = await fetch(url);
                return await handleResponse(response);
            } catch (error) {
                console.error('GET request failed:', error);
                throw error;
            }
        }
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIClient;
}
