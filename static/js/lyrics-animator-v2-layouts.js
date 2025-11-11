/**
 * Layout Modes for Lyrics Animator V2
 * Provides different display layouts for lyrics
 */

window.LyricsLayouts = {
    // Classic karaoke - single centered line
    classic: {
        apply: function(container, lyricData, displayIndex) {
            const lines = container.querySelectorAll('.karaoke-line');

            lines.forEach((line, i) => {
                if (i === displayIndex) {
                    line.style.display = 'block';
                    line.style.fontSize = 'var(--text-xl)';  // 24-40px fluid
                    line.style.textAlign = 'center';
                    line.style.position = 'absolute';
                    line.style.top = '50%';
                    line.style.left = '50%';
                    line.style.transform = 'translate(-50%, -50%)';
                    line.style.width = '80%';
                } else {
                    line.style.display = 'none';
                }
            });
        }
    },

    // Full screen - very large text
    fullscreen: {
        apply: function(container, lyricData, displayIndex) {
            const lines = container.querySelectorAll('.karaoke-line');

            lines.forEach((line, i) => {
                if (i === displayIndex) {
                    line.style.display = 'block';
                    line.style.fontSize = 'var(--text-2xl)';  // 32-56px fluid
                    line.style.textAlign = 'center';
                    line.style.position = 'absolute';
                    line.style.top = '50%';
                    line.style.left = '50%';
                    line.style.transform = 'translate(-50%, -50%)';
                    line.style.width = '90%';
                    line.style.lineHeight = '1.2';
                } else {
                    line.style.display = 'none';
                }
            });
        }
    },

    // Multi-line context - show previous, current, next lines
    multiline: {
        apply: function(container, lyricData, displayIndex) {
            const lines = container.querySelectorAll('.karaoke-line');

            lines.forEach((line, i) => {
                line.style.position = 'relative';
                line.style.left = 'auto';
                line.style.top = 'auto';
                line.style.transform = 'none';
                line.style.width = '100%';
                line.style.textAlign = 'center';
                line.style.transition = 'all 0.3s ease';

                // Show previous, current, and next lines
                if (i === displayIndex) {
                    // Current line - large and prominent
                    line.style.display = 'block';
                    line.style.fontSize = 'var(--text-xl)';  // 24-40px fluid
                    line.style.opacity = '1';
                    line.style.marginTop = '2rem';
                    line.style.marginBottom = '2rem';
                } else if (i === displayIndex - 1) {
                    // Previous line - smaller and faded
                    line.style.display = 'block';
                    line.style.fontSize = 'var(--text-base)';  // 16-18px fluid
                    line.style.opacity = '0.65';  // Improved from 0.5 (better contrast)
                    line.classList.remove('current');
                    line.classList.add('multiline-context');
                } else if (i === displayIndex + 1) {
                    // Next line - smaller and faded
                    line.style.display = 'block';
                    line.style.fontSize = 'var(--text-base)';  // 16-18px fluid
                    line.style.opacity = '0.65';  // Improved from 0.5 (better contrast)
                    line.classList.add('multiline-context');
                } else {
                    line.style.display = 'none';
                }
            });

            // Center the container
            container.style.position = 'absolute';
            container.style.top = '50%';
            container.style.left = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            container.style.width = '80%';
        }
    },

    // Bottom bar - lyrics at bottom like subtitles
    bottomBar: {
        apply: function(container, lyricData, displayIndex) {
            const lines = container.querySelectorAll('.karaoke-line');

            lines.forEach((line, i) => {
                line.style.transform = 'none';
                line.style.left = 'auto';
                line.style.top = 'auto';
                line.style.width = '100%';

                if (i === displayIndex) {
                    line.style.display = 'block';
                    line.style.fontSize = 'var(--text-xl)';  // 24-40px fluid
                    line.style.textAlign = 'center';
                    line.style.position = 'fixed';
                    line.style.bottom = '80px';
                    line.style.left = '50%';
                    line.style.transform = 'translateX(-50%)';
                    line.style.width = '90%';
                    line.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    line.style.padding = '20px';
                    line.style.borderRadius = '10px';
                } else {
                    line.style.display = 'none';
                }
            });

            // Reset container positioning
            container.style.position = 'relative';
            container.style.top = 'auto';
            container.style.left = 'auto';
            container.style.transform = 'none';
        }
    }
};

console.log('lyrics-animator-v2-layouts.js loaded successfully!');
