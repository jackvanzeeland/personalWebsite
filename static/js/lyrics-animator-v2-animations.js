/**
 * Animation Presets for Lyrics Animator V2
 * Provides various animation styles for displaying lyrics
 */

// Animation state machine to prevent corruption
window.animationState = window.animationState || {
    isRunning: false,
    currentAnimation: null
};

window.LyricsAnimations = {
    /**
     * Classic typewriter effect - characters appear one by one
     * @param {NodeList} chars - Character elements to animate
     * @param {boolean} shouldAnimate - Whether to animate or show immediately
     */
    typewriter: function(chars, shouldAnimate) {
        // Cancel running animation first
        if (window.animationState.isRunning) {
            if (typeof clearTypewriterTimeouts === 'function') {
                clearTypewriterTimeouts();
            }
            window.animationState.isRunning = false;
        }

        // Clean up previous state
        chars.forEach(char => {
            char.classList.remove('visible', 'animated');
            char.removeAttribute('style');
        });

        if (shouldAnimate && !window.animationState.isRunning) {
            window.animationState.isRunning = true;
            window.animationState.currentAnimation = 'typewriter';

            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.classList.add('visible');
                    // Mark as complete when last char animates
                    if (charIndex === chars.length - 1) {
                        window.animationState.isRunning = false;
                    }
                }, charIndex * 50);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!shouldAnimate) {
            chars.forEach(char => char.classList.add('visible'));
        }
    },

    /**
     * Slide-in animation - characters slide in from the left
     * @param {NodeList} chars - Character elements to animate
     * @param {boolean} shouldAnimate - Whether to animate or show immediately
     */
    slideIn: function(chars, shouldAnimate) {
        // Cancel running animation first
        if (window.animationState.isRunning) {
            if (typeof clearTypewriterTimeouts === 'function') {
                clearTypewriterTimeouts();
            }
            window.animationState.isRunning = false;
        }

        // Clean up previous state
        chars.forEach(char => {
            char.classList.remove('visible', 'animated');
            char.removeAttribute('style');
        });

        if (shouldAnimate && !window.animationState.isRunning) {
            window.animationState.isRunning = true;
            window.animationState.currentAnimation = 'slideIn';

            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'slideInLeft 0.5s ease forwards';
                    char.classList.add('visible', 'animated');
                    // Mark as complete when last char animates
                    if (charIndex === chars.length - 1) {
                        window.animationState.isRunning = false;
                    }
                }, charIndex * 30);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!shouldAnimate) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    /**
     * Bounce animation - characters bounce in with elastic effect
     * @param {NodeList} chars - Character elements to animate
     * @param {boolean} shouldAnimate - Whether to animate or show immediately
     */
    bounce: function(chars, shouldAnimate) {
        // Cancel running animation first
        if (window.animationState.isRunning) {
            if (typeof clearTypewriterTimeouts === 'function') {
                clearTypewriterTimeouts();
            }
            window.animationState.isRunning = false;
        }

        // Clean up previous state
        chars.forEach(char => {
            char.classList.remove('visible', 'animated');
            char.removeAttribute('style');
        });

        if (shouldAnimate && !window.animationState.isRunning) {
            window.animationState.isRunning = true;
            window.animationState.currentAnimation = 'bounce';

            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
                    char.classList.add('visible', 'animated');
                    // Mark as complete when last char animates
                    if (charIndex === chars.length - 1) {
                        window.animationState.isRunning = false;
                    }
                }, charIndex * 40);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!shouldAnimate) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    /**
     * Fade wave animation - characters fade in with upward motion in waves
     * @param {NodeList} chars - Character elements to animate
     * @param {boolean} shouldAnimate - Whether to animate or show immediately
     */
    fadeWave: function(chars, shouldAnimate) {
        // Cancel running animation first
        if (window.animationState.isRunning) {
            if (typeof clearTypewriterTimeouts === 'function') {
                clearTypewriterTimeouts();
            }
            window.animationState.isRunning = false;
        }

        // Clean up previous state
        chars.forEach(char => {
            char.classList.remove('visible', 'animated');
            char.removeAttribute('style');
        });

        if (shouldAnimate && !window.animationState.isRunning) {
            window.animationState.isRunning = true;
            window.animationState.currentAnimation = 'fadeWave';

            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'fadeInUp 0.8s ease forwards';
                    char.classList.add('visible', 'animated');
                    // Mark as complete when last char animates
                    if (charIndex === chars.length - 1) {
                        window.animationState.isRunning = false;
                    }
                }, charIndex * 60);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!shouldAnimate) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    /**
     * Scale pop animation - characters scale up from small with elastic bounce
     * @param {NodeList} chars - Character elements to animate
     * @param {boolean} shouldAnimate - Whether to animate or show immediately
     */
    scalePop: function(chars, shouldAnimate) {
        // Cancel running animation first
        if (window.animationState.isRunning) {
            if (typeof clearTypewriterTimeouts === 'function') {
                clearTypewriterTimeouts();
            }
            window.animationState.isRunning = false;
        }

        // Clean up previous state
        chars.forEach(char => {
            char.classList.remove('visible', 'animated');
            char.removeAttribute('style');
        });

        if (shouldAnimate && !window.animationState.isRunning) {
            window.animationState.isRunning = true;
            window.animationState.currentAnimation = 'scalePop';

            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'scalePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                    char.classList.add('visible', 'animated');
                    // Mark as complete when last char animates
                    if (charIndex === chars.length - 1) {
                        window.animationState.isRunning = false;
                    }
                }, charIndex * 35);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!shouldAnimate) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    /**
     * Rotate flip animation - characters rotate and flip in 3D space
     * @param {NodeList} chars - Character elements to animate
     * @param {boolean} shouldAnimate - Whether to animate or show immediately
     */
    rotateFlip: function(chars, shouldAnimate) {
        // Cancel running animation first
        if (window.animationState.isRunning) {
            if (typeof clearTypewriterTimeouts === 'function') {
                clearTypewriterTimeouts();
            }
            window.animationState.isRunning = false;
        }

        // Clean up previous state
        chars.forEach(char => {
            char.classList.remove('visible', 'animated');
            char.removeAttribute('style');
        });

        if (shouldAnimate && !window.animationState.isRunning) {
            window.animationState.isRunning = true;
            window.animationState.currentAnimation = 'rotateFlip';

            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'rotateFlip 0.7s ease forwards';
                    char.classList.add('visible', 'animated');
                    // Mark as complete when last char animates
                    if (charIndex === chars.length - 1) {
                        window.animationState.isRunning = false;
                    }
                }, charIndex * 45);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!shouldAnimate) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    /**
     * Glow pulse animation - characters fade in with glowing pulse effect
     * @param {NodeList} chars - Character elements to animate
     * @param {boolean} shouldAnimate - Whether to animate or show immediately
     */
    glowPulse: function(chars, shouldAnimate) {
        // Cancel running animation first
        if (window.animationState.isRunning) {
            if (typeof clearTypewriterTimeouts === 'function') {
                clearTypewriterTimeouts();
            }
            window.animationState.isRunning = false;
        }

        // Clean up previous state
        chars.forEach(char => {
            char.classList.remove('visible', 'animated');
            char.removeAttribute('style');
        });

        if (shouldAnimate && !window.animationState.isRunning) {
            window.animationState.isRunning = true;
            window.animationState.currentAnimation = 'glowPulse';

            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'glowPulse 1s ease forwards';
                    char.classList.add('visible', 'animated');
                    // Mark as complete when last char animates
                    if (charIndex === chars.length - 1) {
                        window.animationState.isRunning = false;
                    }
                }, charIndex * 50);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!shouldAnimate) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    }
};

Logger.debug('lyrics-animator-v2-animations.js loaded successfully!');
