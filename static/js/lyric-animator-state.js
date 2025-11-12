/**
 * Global state manager for Lyric Animator V2
 * Tracks file load states and manages conditional visualizer rendering
 */
window.LyricAnimatorState = {
    lrcFileLoaded: false,
    audioFileLoaded: false,
    currentBackgroundStyle: localStorage.getItem('lyricAnimatorV2Background') || 'bg1',
    _isCheckingVisualizer: false,  // Re-entry guard (Issue #26 fix)

    setLrcLoaded: function(loaded) {
        this.lrcFileLoaded = loaded;
        this.checkVisualizerReady();
    },

    setAudioLoaded: function(loaded) {
        this.audioFileLoaded = loaded;
        this.checkVisualizerReady();
    },

    setBackgroundStyle: function(style) {
        this.currentBackgroundStyle = style;
    },

    canRenderVisualizer: function() {
        // Only require both files for BG3 (audio visualizer)
        if (this.currentBackgroundStyle !== 'bg3') {
            return true; // Other backgrounds don't need files
        }
        return this.lrcFileLoaded && this.audioFileLoaded;
    },

    checkVisualizerReady: function() {
        // Issue #26 fix: Prevent re-entry to avoid circular dependencies
        if (this._isCheckingVisualizer) {
            console.warn('checkVisualizerReady called recursively, ignoring');
            return;
        }

        this._isCheckingVisualizer = true;

        try {
            if (this.canRenderVisualizer() && this.currentBackgroundStyle === 'bg3') {
                console.log('Both files ready! Starting audio visualizer...');

                // Trigger visualizer start
                if (window.BackgroundBG3 && window.BackgroundBG3.startRendering) {
                    window.BackgroundBG3.startRendering();
                }
            }
        } catch (error) {
            console.error('Error checking visualizer:', error);
        } finally {
            // Reset guard after execution
            this._isCheckingVisualizer = false;
        }
    }
};

console.log('lyric-animator-state.js loaded successfully!');
