/**
 * Notification Manager
 * Handles toast notifications, error messages, and user feedback
 */

window.NotificationManager = (function() {
    'use strict';

    let notifications = [];
    let container = null;

    /**
     * Error messages with actionable guidance
     */
    const errorMessages = {
        noTimestamps: {
            title: 'No lyrics found in file',
            message: 'LRC files must contain timestamps in the format [MM:SS.SS]',
            action: 'Download LRC files from <a href="https://www.lyricsify.com/" target="_blank">Lyricsify</a> or check the file format.',
            example: '[00:12.34]First line of lyrics\n[00:15.78]Second line of lyrics',
            severity: 'error'
        },
        invalidVideoId: {
            title: 'Invalid YouTube video ID',
            message: 'Video IDs are exactly 11 characters (letters, numbers, dashes, and underscores)',
            action: 'Copy the ID from your YouTube URL after "v="',
            example: 'https://youtube.com/watch?v=dQw4w9WgXcQ\n                                    ^^^^^^^^^^^',
            severity: 'error'
        },
        videoNotFound: {
            title: 'Video not found',
            message: 'The video may be private, deleted, or age-restricted',
            action: 'Try a different video or verify the URL is correct',
            severity: 'error'
        },
        downloadFailed: {
            title: 'Download failed',
            message: 'Unable to download audio from YouTube',
            action: 'Check your internet connection and try again. If the problem persists, the video may not be available.',
            severity: 'error'
        },
        fileTooBig: {
            title: 'File too large',
            message: 'Audio file exceeds 50MB limit',
            action: 'Try a shorter video or use a different audio source',
            severity: 'error'
        }
    };

    /**
     * Initialize notification system
     */
    function init() {
        // Create container if it doesn't exist
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-stack';
            container.setAttribute('role', 'region');
            container.setAttribute('aria-label', 'Notifications');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
    }

    /**
     * Show a notification
     * @param {string} message - Plain text message or error key
     * @param {string} type - 'info' | 'success' | 'warning' | 'error'
     * @param {number} duration - Auto-dismiss after ms (0 = persistent)
     */
    function show(message, type = 'info', duration = 5000) {
        init();

        const id = Date.now() + Math.random();
        const notification = {
            id,
            message,
            type,
            duration
        };

        notifications.push(notification);
        render();

        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }

        return id;
    }

    /**
     * Show an error with rich content
     * @param {string} errorKey - Key from errorMessages object
     * @param {object} details - Additional context
     */
    function showError(errorKey, details = {}) {
        init();

        const error = errorMessages[errorKey];
        if (!error) {
            // Fallback to simple error
            return show(errorKey, 'error', 8000);
        }

        const id = Date.now() + Math.random();

        const errorHTML = `
            <div class="notification notification--${error.severity}" data-id="${id}">
                <div class="notification-header">
                    <span class="notification-icon">${getIcon(error.severity)}</span>
                    <h3 class="notification-title">${error.title}</h3>
                    <button class="notification-close" onclick="window.NotificationManager.dismiss(${id})" aria-label="Close notification">
                        
                    </button>
                </div>
                <p class="notification-message">${error.message}</p>
                ${error.action ? `<p class="notification-action">${error.action}</p>` : ''}
                ${error.example ? `<pre class="notification-example">${escapeHtml(error.example)}</pre>` : ''}
            </div>
        `;

        container.insertAdjacentHTML('beforeend', errorHTML);

        // Auto-dismiss after 12 seconds for errors
        setTimeout(() => dismiss(id), 12000);

        return id;
    }

    /**
     * Dismiss a notification
     */
    function dismiss(id) {
        const notification = container.querySelector(`[data-id="${id}"]`);
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notification.remove();
                notifications = notifications.filter(n => n.id !== id);
            }, 300);
        }
    }

    /**
     * Render notifications
     */
    function render() {
        // Simple notifications (not errors)
        const simpleNotifications = notifications.filter(n =>
            typeof n.message === 'string' && !errorMessages[n.message]
        );

        const html = simpleNotifications.map(n => `
            <div class="notification notification--${n.type}" data-id="${n.id}">
                <span class="notification-icon">${getIcon(n.type)}</span>
                <p class="notification-message">${escapeHtml(n.message)}</p>
                <button class="notification-close" onclick="window.NotificationManager.dismiss(${n.id})" aria-label="Close notification">
                    
                </button>
            </div>
        `).join('');

        // Only update if there are simple notifications
        if (html && container) {
            const existingSimple = container.querySelectorAll('.notification:not([class*="--error"])');
            existingSimple.forEach(el => el.remove());
            container.insertAdjacentHTML('beforeend', html);
        }
    }

    /**
     * Get icon for notification type
     */
    function getIcon(type) {
        const icons = {
            info: '9',
            success: '',
            warning: ' ',
            error: ''
        };
        return icons[type] || icons.info;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear all notifications
     */
    function clearAll() {
        notifications = [];
        if (container) {
            container.innerHTML = '';
        }
    }

    // Public API
    return {
        show,
        showError,
        dismiss,
        clearAll,
        // Expose error keys for autocomplete
        ERROR_KEYS: Object.keys(errorMessages)
    };
})();

console.log('notification-manager.js loaded successfully!');
