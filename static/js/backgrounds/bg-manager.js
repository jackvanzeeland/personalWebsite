/**
 * Background Manager for Lyrics Animator V2
 * Handles loading, switching, and managing different background styles
 */

window.BackgroundManager = (function() {
    'use strict';

    let currentBackground = null;
    let currentBgId = null;
    let container = null;

    // Background registry
    const backgrounds = {
        bg1: {
            name: 'Mesh Gradient',
            scripts: ['/static/js/backgrounds/bg1-mesh-gradient.js'],
            css: ['/static/css/backgrounds/bg1-mesh-gradient.css'],
            instance: null
        },
        bg2: {
            name: 'CSS Gradient',
            scripts: ['/static/js/backgrounds/bg2-css-gradient.js'],
            css: ['/static/css/backgrounds/bg2-css-gradient.css'],
            instance: null
        },
        bg3: {
            name: 'Audio Visualizer',
            scripts: ['/static/js/backgrounds/bg3-audio-visualizer.js'],
            css: ['/static/css/backgrounds/bg3-audio-visualizer.css'],
            instance: null
        },
        bg4: {
            name: '3D Particles',
            scripts: [
                'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js',
                '/static/js/backgrounds/bg4-threejs-particles.js'
            ],
            css: ['/static/css/backgrounds/bg4-threejs-particles.css'],
            instance: null
        },
        bg5: {
            name: 'Hybrid Effects',
            scripts: ['/static/js/backgrounds/bg5-hybrid.js'],
            css: ['/static/css/backgrounds/bg5-hybrid.css'],
            instance: null
        }
    };

    // Track loaded resources
    const loadedScripts = new Set();
    const loadedStyles = new Set();

    /**
     * Load a script dynamically
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (loadedScripts.has(src)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loadedScripts.add(src);
                resolve();
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    /**
     * Load a stylesheet dynamically
     */
    function loadStylesheet(href) {
        return new Promise((resolve, reject) => {
            if (loadedStyles.has(href)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => {
                loadedStyles.add(href);
                resolve();
            };
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    /**
     * Initialize the background manager
     */
    function init(containerElement) {
        container = containerElement || document.getElementById('particles-js');

        // Load saved preference
        const savedBg = localStorage.getItem('lyricAnimatorV2Background') || 'bg1';

        console.log('BackgroundManager initialized with container:', container);
        return load(savedBg);
    }

    /**
     * Load a background by ID
     */
    async function load(bgId) {
        console.log(`Loading background: ${bgId}`);

        if (!backgrounds[bgId]) {
            console.error(`Background ${bgId} not found`);
            return;
        }

        // Cleanup current background
        await cleanup();

        const bg = backgrounds[bgId];

        try {
            // Load CSS first
            for (const css of bg.css) {
                await loadStylesheet(css);
            }

            // Load scripts
            for (const script of bg.scripts) {
                await loadScript(script);
            }

            // Wait a bit for scripts to fully initialize
            await new Promise(resolve => setTimeout(resolve, 100));

            // CRITICAL FIX: Ensure container exists before initializing
            // Re-query if container is null (defensive programming)
            if (!container) {
                container = document.getElementById('particles-js');
                console.warn('BackgroundManager: container was null, re-querying DOM');
            }

            if (!container) {
                throw new Error('Container element #particles-js not found in DOM');
            }

            // Initialize the background
            const bgClass = window[`Background${bgId.toUpperCase()}`];
            if (bgClass && typeof bgClass.init === 'function') {
                bg.instance = bgClass;
                console.log(`Initializing ${bgId} with container:`, container);
                await bgClass.init(container);
                currentBackground = bgClass;
                currentBgId = bgId;

                // Save preference
                localStorage.setItem('lyricAnimatorV2Background', bgId);

                console.log(`Background ${bgId} loaded successfully`);
            } else {
                console.error(`Background class for ${bgId} not found or missing init method`);
            }
        } catch (error) {
            console.error(`Error loading background ${bgId}:`, error);
        }
    }

    /**
     * Cleanup current background
     */
    async function cleanup() {
        if (currentBackground && typeof currentBackground.destroy === 'function') {
            console.log(`Cleaning up background: ${currentBgId}`);
            await currentBackground.destroy();
            currentBackground = null;
        }

        // Clear the container
        if (container) {
            container.innerHTML = '';
        }
    }

    /**
     * Update theme color for current background
     */
    function updateTheme(color) {
        if (currentBackground && typeof currentBackground.updateTheme === 'function') {
            currentBackground.updateTheme(color);
        }
    }

    /**
     * Set audio source for audio-reactive backgrounds
     */
    function setAudio(audioElement) {
        if (currentBackground && typeof currentBackground.setAudio === 'function') {
            currentBackground.setAudio(audioElement);
        }
    }

    /**
     * Pause background animations
     */
    function pause() {
        if (currentBackground && typeof currentBackground.pause === 'function') {
            currentBackground.pause();
        }
    }

    /**
     * Resume background animations
     */
    function play() {
        if (currentBackground && typeof currentBackground.play === 'function') {
            currentBackground.play();
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        if (currentBackground && typeof currentBackground.resize === 'function') {
            currentBackground.resize();
        }
    }

    // Listen for resize events
    window.addEventListener('resize', handleResize);

    // Public API
    return {
        init,
        load,
        cleanup,
        updateTheme,
        setAudio,
        pause,
        play,
        getCurrentBackground: () => currentBgId,
        getBackgrounds: () => Object.keys(backgrounds).map(id => ({
            id,
            name: backgrounds[id].name
        })),

        // NEW: Audio playback controls for syncing with lyrics
        playAudio: function() {
            if (currentBackground && typeof currentBackground.playAudio === 'function') {
                currentBackground.playAudio();
            }
        },

        pauseAudio: function() {
            if (currentBackground && typeof currentBackground.pauseAudio === 'function') {
                currentBackground.pauseAudio();
            }
        }
    };
})();

console.log('bg-manager.js loaded successfully!');
