/**
 * Keyboard Shortcuts for Lyric Animator
 * Handles keyboard navigation and shortcuts
 */

window.KeyboardShortcuts = (function() {
    'use strict';

    let shortcuts = {};
    let enabled = true;

    /**
     * Initialize keyboard shortcuts
     */
    function init() {
        document.addEventListener('keydown', handleKeyPress);
        console.log('Keyboard shortcuts initialized');
    }

    /**
     * Handle keyboard events
     */
    function handleKeyPress(e) {
        if (!enabled) return;

        // Don't intercept if user is typing in input
        if (isTypingInInput()) return;

        // Space: Play/Pause
        if (e.code === 'Space') {
            e.preventDefault();
            const playPauseBtn = document.getElementById('play-pause');
            if (playPauseBtn) playPauseBtn.click();
            return;
        }

        // Arrow Left: Seek backward 5 seconds
        if (e.code === 'ArrowLeft') {
            e.preventDefault();
            seekBackward();
            return;
        }

        // Arrow Right: Seek forward 5 seconds
        if (e.code === 'ArrowRight') {
            e.preventDefault();
            seekForward();
            return;
        }

        // Escape: Cancel operations
        if (e.code === 'Escape') {
            handleEscape();
            return;
        }

        // K: Toggle play/pause (YouTube shortcut)
        if (e.code === 'KeyK') {
            e.preventDefault();
            const playPauseBtn = document.getElementById('play-pause');
            if (playPauseBtn) playPauseBtn.click();
            return;
        }

        // F: Toggle fullscreen layout (if on v2)
        if (e.code === 'KeyF' && isV2Active()) {
            e.preventDefault();
            const layoutMode = document.getElementById('layout-mode');
            if (layoutMode) {
                layoutMode.value = layoutMode.value === 'fullscreen' ? 'classic' : 'fullscreen';
                layoutMode.dispatchEvent(new Event('change'));
            }
            return;
        }

        // ?: Show keyboard shortcuts help
        if (e.shiftKey && e.code === 'Slash') {
            e.preventDefault();
            showShortcutsHelp();
            return;
        }
    }

    /**
     * Check if user is typing in an input field
     */
    function isTypingInInput() {
        const activeElement = document.activeElement;
        return ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName);
    }

    /**
     * Seek backward 5 seconds
     */
    function seekBackward() {
        if (typeof window.currentTime === 'undefined') return;

        window.currentTime = Math.max(0, window.currentTime - 5);

        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.value = window.currentTime;
        }

        // Update display
        if (typeof updateTimeDisplay === 'function') {
            updateTimeDisplay();
        }
        if (typeof updateLyricsDisplay === 'function' && window.lyricData) {
            updateLyricsDisplay(window.lyricData);
        }

        console.log('Seeked backward to', window.currentTime.toFixed(2));
    }

    /**
     * Seek forward 5 seconds
     */
    function seekForward() {
        if (typeof window.currentTime === 'undefined') return;
        if (typeof window.totalTime === 'undefined') return;

        window.currentTime = Math.min(window.totalTime, window.currentTime + 5);

        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.value = window.currentTime;
        }

        // Update display
        if (typeof updateTimeDisplay === 'function') {
            updateTimeDisplay();
        }
        if (typeof updateLyricsDisplay === 'function' && window.lyricData) {
            updateLyricsDisplay(window.lyricData);
        }

        console.log('Seeked forward to', window.currentTime.toFixed(2));
    }

    /**
     * Handle Escape key
     */
    function handleEscape() {
        // Cancel YouTube download if in progress
        const youtubeBtn = document.getElementById('youtube-download-btn');
        if (youtubeBtn && youtubeBtn.disabled) {
            console.log('Escape: Cancelling YouTube download (TODO: implement)');
            // TODO: Add actual cancellation logic when implementing download progress
        }
    }

    /**
     * Check if V2 is active
     */
    function isV2Active() {
        return localStorage.getItem('lyricAnimatorVersion') === '2';
    }

    /**
     * Show keyboard shortcuts help overlay
     */
    function showShortcutsHelp() {
        const helpHTML = `
            <div id="shortcuts-help-overlay" class="keyboard-shortcuts-help">
                <div class="shortcuts-help-content">
                    <h2>Keyboard Shortcuts</h2>
                    <button id="shortcuts-help-close" aria-label="Close help">✕</button>

                    <div class="shortcuts-section">
                        <h3>Playback</h3>
                        <dl>
                            <dt><kbd>Space</kbd> or <kbd>K</kbd></dt>
                            <dd>Play / Pause</dd>

                            <dt><kbd>←</kbd></dt>
                            <dd>Seek backward 5 seconds</dd>

                            <dt><kbd>→</kbd></dt>
                            <dd>Seek forward 5 seconds</dd>
                        </dl>
                    </div>

                    ${isV2Active() ? `
                    <div class="shortcuts-section">
                        <h3>V2 Controls</h3>
                        <dl>
                            <dt><kbd>F</kbd></dt>
                            <dd>Toggle fullscreen layout</dd>
                        </dl>
                    </div>
                    ` : ''}

                    <div class="shortcuts-section">
                        <h3>General</h3>
                        <dl>
                            <dt><kbd>Esc</kbd></dt>
                            <dd>Cancel operations</dd>

                            <dt><kbd>?</kbd></dt>
                            <dd>Show this help</dd>
                        </dl>
                    </div>
                </div>
            </div>
        `;

        // Remove existing overlay
        const existing = document.getElementById('shortcuts-help-overlay');
        if (existing) existing.remove();

        // Add new overlay
        document.body.insertAdjacentHTML('beforeend', helpHTML);

        // Close button handler
        document.getElementById('shortcuts-help-close').onclick = () => {
            document.getElementById('shortcuts-help-overlay').remove();
        };

        // Close on Escape
        const closeOnEscape = (e) => {
            if (e.code === 'Escape') {
                document.getElementById('shortcuts-help-overlay').remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);

        // Close on overlay click
        document.getElementById('shortcuts-help-overlay').onclick = (e) => {
            if (e.target.id === 'shortcuts-help-overlay') {
                document.getElementById('shortcuts-help-overlay').remove();
            }
        };
    }

    /**
     * Enable/disable shortcuts
     */
    function setEnabled(state) {
        enabled = state;
    }

    // Public API
    return {
        init,
        setEnabled
    };
})();

// Auto-initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.KeyboardShortcuts.init();
    });
} else {
    window.KeyboardShortcuts.init();
}

console.log('keyboard-shortcuts.js loaded successfully!');
