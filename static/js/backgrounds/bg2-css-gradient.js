/**
 * BG2: Pure CSS Animated Gradient Background
 * Lightweight CSS-only gradient with theme color support
 */

window.BackgroundBG2 = (function() {
    'use strict';

    let container = null;
    let gradientDiv = null;
    let currentThemeColor = '#ff8e53';

    // Customization parameters
    let gradientStyle = 'linear';
    let animationSpeed = 15;
    let colorStops = 4;

    /**
     * Initialize the CSS gradient background
     */
    function init(containerElement) {
        console.log('Initializing BG2: CSS Gradient');

        container = containerElement;

        // Create gradient div
        gradientDiv = document.createElement('div');
        gradientDiv.id = 'bg2-gradient';
        gradientDiv.className = 'bg2-gradient-container';

        container.appendChild(gradientDiv);

        // Set initial gradient
        updateTheme(currentThemeColor);

        console.log('BG2: CSS Gradient initialized successfully');
    }

    /**
     * Update theme colors
     */
    function updateTheme(hexColor) {
        currentThemeColor = hexColor;

        if (!gradientDiv) return;

        // Convert hex to RGB
        const rgb = hexToRgb(hexColor);

        // Generate complementary colors
        const color1 = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const color2 = `rgb(${Math.min(255, rgb.r + 50)}, ${Math.max(0, rgb.g - 30)}, ${Math.min(255, rgb.b + 30)})`;
        const color3 = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.min(255, rgb.g + 50)}, ${Math.max(0, rgb.b - 20)})`;
        const color4 = `rgb(${Math.min(255, rgb.r + 20)}, ${Math.min(255, rgb.g + 20)}, ${Math.min(255, rgb.b + 60)})`;

        // Set CSS custom properties for gradient colors
        gradientDiv.style.setProperty('--bg2-color1', color1);
        gradientDiv.style.setProperty('--bg2-color2', color2);
        gradientDiv.style.setProperty('--bg2-color3', color3);
        gradientDiv.style.setProperty('--bg2-color4', color4);
    }

    /**
     * Convert hex to RGB
     */
    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }

    /**
     * Cleanup
     */
    function destroy() {
        if (gradientDiv && gradientDiv.parentNode) {
            gradientDiv.parentNode.removeChild(gradientDiv);
        }

        gradientDiv = null;
        container = null;

        console.log('BG2: CSS Gradient destroyed');
    }

    /**
     * Pause animation (CSS animation)
     */
    function pause() {
        if (gradientDiv) {
            gradientDiv.style.animationPlayState = 'paused';
        }
    }

    /**
     * Resume animation
     */
    function play() {
        if (gradientDiv) {
            gradientDiv.style.animationPlayState = 'running';
        }
    }

    // Public API
    return {
        init,
        destroy,
        updateTheme,
        resize: () => {}, // No resize needed for CSS gradients
        pause,
        play,
        // Customization setters
        setGradientStyle: (style) => {
            gradientStyle = style;
            if (gradientDiv) {
                gradientDiv.className = `bg2-gradient-container bg2-${style}`;
            }
            console.log('BG2: Gradient style set to', style);
        },
        setAnimationSpeed: (speed) => {
            animationSpeed = speed;
            if (gradientDiv) {
                gradientDiv.style.animationDuration = `${speed}s`;
            }
            console.log('BG2: Animation speed set to', speed);
        },
        setColorStops: (stops) => {
            colorStops = stops;
            console.log('BG2: Color stops set to', stops);
            // Update theme to regenerate with new color stops
            updateTheme(currentThemeColor);
        }
    };
})();

console.log('bg2-css-gradient.js loaded successfully!');
