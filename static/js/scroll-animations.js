/**
 * Scroll Animation Fallback Module
 * Provides Intersection Observer fallback for browsers without scroll-timeline support
 */

const ScrollAnimations = (function() {
    'use strict';

    // Check for native scroll-timeline support
    const supportsScrollTimeline = CSS.supports('animation-timeline', 'view()');

    /**
     * Initialize fallback animations using Intersection Observer
     */
    function initFallback() {
        if (supportsScrollTimeline) {
            console.log('✨ Native scroll-timeline supported, no fallback needed');
            return;
        }

        console.log('📱 Using Intersection Observer fallback for scroll animations');

        const animatedElements = document.querySelectorAll(
            '.scroll-fade-up, .scroll-fade-left, .scroll-fade-right, ' +
            '.scroll-scale, .scroll-rotate, .scroll-blur-focus, .scroll-stagger-item'
        );

        if (animatedElements.length === 0) {
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-visible');
                    // Optional: unobserve after animation to improve performance
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Apply scroll animation classes to elements
     */
    function applyAnimation(element, animationType) {
        if (!element) return;

        const validTypes = [
            'scroll-fade-up',
            'scroll-fade-left',
            'scroll-fade-right',
            'scroll-scale',
            'scroll-rotate',
            'scroll-blur-focus',
            'scroll-parallax',
            'scroll-stagger-item'
        ];

        if (validTypes.includes(animationType)) {
            element.classList.add(animationType);
        }
    }

    /**
     * Initialize scroll animations
     */
    function init() {
        // Initialize fallback if needed
        initFallback();

        // Log support info
        if (supportsScrollTimeline) {
            console.log('✨ Using native CSS scroll-driven animations');
        } else {
            console.log('📱 Using Intersection Observer fallback');
        }
    }

    // Public API
    return {
        init,
        applyAnimation,
        supportsNative: () => supportsScrollTimeline
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', ScrollAnimations.init);

// Expose for use by other modules
window.ScrollAnimations = ScrollAnimations;
