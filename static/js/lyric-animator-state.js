/**
 * Global state manager for Lyric Animator V2
 * Tracks file load states and manages conditional visualizer rendering
 */
window.LyricAnimatorState = {
    lrcFileLoaded: false,
    audioFileLoaded: false,
    currentBackgroundStyle: localStorage.getItem('lyricAnimatorV2Background') || 'bg1',

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
        if (this.canRenderVisualizer() && this.currentBackgroundStyle === 'bg3') {
            console.log('Both files ready! Starting audio visualizer...');
            // Trigger visualizer start
            if (window.BackgroundBG3 && window.BackgroundBG3.startRendering) {
                window.BackgroundBG3.startRendering();
            }
        }
    }
};

console.log('lyric-animator-state.js loaded successfully!');
