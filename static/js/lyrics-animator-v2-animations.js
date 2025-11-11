/**
 * Animation Presets for Lyrics Animator V2
 * Provides various animation styles for displaying lyrics
 */

window.LyricsAnimations = {
    // Classic typewriter effect (same as v1)
    typewriter: function(chars, isPlaying) {
        if (isPlaying && window.typewriterTimeouts.length === 0) {
            chars.forEach(char => char.classList.remove('visible', 'animated'));
            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.classList.add('visible');
                }, charIndex * 50);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!isPlaying) {
            chars.forEach(char => char.classList.add('visible'));
        }
    },

    // Slide in from left
    slideIn: function(chars, isPlaying) {
        chars.forEach(char => char.classList.remove('visible', 'animated'));

        if (isPlaying && window.typewriterTimeouts.length === 0) {
            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'slideInLeft 0.5s ease forwards';
                    char.classList.add('visible', 'animated');
                }, charIndex * 30);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!isPlaying) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    // Bounce effect
    bounce: function(chars, isPlaying) {
        chars.forEach(char => char.classList.remove('visible', 'animated'));

        if (isPlaying && window.typewriterTimeouts.length === 0) {
            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
                    char.classList.add('visible', 'animated');
                }, charIndex * 40);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!isPlaying) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    // Fade wave effect
    fadeWave: function(chars, isPlaying) {
        chars.forEach(char => char.classList.remove('visible', 'animated'));

        if (isPlaying && window.typewriterTimeouts.length === 0) {
            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'fadeInUp 0.8s ease forwards';
                    char.classList.add('visible', 'animated');
                }, charIndex * 60);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!isPlaying) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    // Scale pop effect
    scalePop: function(chars, isPlaying) {
        chars.forEach(char => char.classList.remove('visible', 'animated'));

        if (isPlaying && window.typewriterTimeouts.length === 0) {
            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'scalePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                    char.classList.add('visible', 'animated');
                }, charIndex * 35);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!isPlaying) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    // Rotate flip effect
    rotateFlip: function(chars, isPlaying) {
        chars.forEach(char => char.classList.remove('visible', 'animated'));

        if (isPlaying && window.typewriterTimeouts.length === 0) {
            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'rotateFlip 0.7s ease forwards';
                    char.classList.add('visible', 'animated');
                }, charIndex * 45);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!isPlaying) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    },

    // Glow pulse effect
    glowPulse: function(chars, isPlaying) {
        chars.forEach(char => char.classList.remove('visible', 'animated'));

        if (isPlaying && window.typewriterTimeouts.length === 0) {
            chars.forEach((char, charIndex) => {
                const timeout = setTimeout(() => {
                    char.style.animation = 'glowPulse 1s ease forwards';
                    char.classList.add('visible', 'animated');
                }, charIndex * 50);
                window.typewriterTimeouts.push(timeout);
            });
        } else if (!isPlaying) {
            chars.forEach(char => {
                char.style.animation = 'none';
                char.classList.add('visible');
            });
        }
    }
};

console.log('lyrics-animator-v2-animations.js loaded successfully!');
