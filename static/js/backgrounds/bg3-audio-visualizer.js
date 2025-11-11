/**
 * BG3: Audio-Reactive Visualizer Background
 * Web Audio API frequency visualization with multiple styles
 */

window.BackgroundBG3 = (function() {
    'use strict';

    let canvas = null;
    let ctx = null;
    let animationId = null;
    let audioElement = null;
    let audioContext = null;
    let analyser = null;
    let sourceNode = null; // Store the MediaElementSource
    let dataArray = null;
    let bufferLength = null;
    let currentThemeColor = '#ff8e53';
    let visualizerStyle = 'bars'; // bars, circular, waveform, particles

    // Customization parameters
    let sensitivity = 5;
    let barCount = 256;

    // Waiting state tracking
    let waitingStateActive = false;
    let waitingStateTimeout = null;

    /**
     * Initialize the audio visualizer background
     */
    function init(containerElement) {
        console.log('BG3: Initializing Audio Visualizer');

        // CRITICAL: Validate container exists
        if (!containerElement) {
            console.error('BG3: CRITICAL ERROR - container is null or undefined');
            throw new Error('BG3 init() requires a valid container element');
        }

        // Create canvas
        canvas = document.createElement('canvas');
        canvas.id = 'bg3-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';

        ctx = canvas.getContext('2d');
        resize();

        containerElement.appendChild(canvas);

        // Start with waiting state message
        waitingStateActive = true;
        drawWaitingState();

        console.log('BG3: Audio Visualizer initialized');
    }

    /**
     * Set audio source
     */
    function setAudio(audio) {
        try {
            // CRITICAL: Check if this is a new audio element or same one
            const isNewAudio = (audioElement !== audio);

            if (isNewAudio && sourceNode) {
                // New audio element - need to close old context and create fresh one
                if (audioContext) {
                    audioContext.close();
                }
                audioContext = null;
                analyser = null;
                sourceNode = null;
                dataArray = null;
            } else if (!isNewAudio && sourceNode) {
                // Same audio element, already connected - just reuse existing setup
                return;
            }

            audioElement = audio;

            // Create audio context
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            // Connect audio element to analyser
            sourceNode = audioContext.createMediaElementSource(audioElement);
            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);

            // CRITICAL: Explicitly pause audio after connection
            // createMediaElementSource may trigger playback if AudioContext is 'running'
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0; // Reset to beginning
            }

            // Stop default animation - will start when both files ready
            if (animationId) {
                cancelAnimationFrame(animationId);
            }

            console.log('BG3: Audio connected to visualizer');
        } catch (error) {
            console.error('BG3: ERROR setting up audio context:', error);
        }
    }

    /**
     * Default animation (no audio)
     */
    function animateDefault() {
        if (!ctx) return;

        const time = Date.now() / 1000;

        // Clear canvas with fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw animated bars
        const barCount = 64;
        const barWidth = canvas.width / barCount;
        const rgb = hexToRgb(currentThemeColor);

        for (let i = 0; i < barCount; i++) {
            // Create wave pattern
            const height = Math.sin(time + i * 0.2) * 100 + 150;
            const x = i * barWidth;
            const y = canvas.height - height;

            // Gradient
            const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth - 2, height);
        }

        animationId = requestAnimationFrame(animateDefault);
    }

    /**
     * Draw waiting state message
     */
    function drawWaitingState() {
        if (!ctx || !waitingStateActive) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw message
        ctx.fillStyle = 'rgba(255, 142, 83, 0.5)';
        ctx.font = '24px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('Upload LRC + Audio to start visualizer',
                     canvas.width / 2,
                     canvas.height / 2);

        // Re-draw every second to maintain message (only if still waiting)
        if (waitingStateActive) {
            waitingStateTimeout = setTimeout(drawWaitingState, 1000);
        }
    }

    /**
     * Start rendering (called when both files are ready)
     */
    function startRendering() {
        // Stop waiting state message
        waitingStateActive = false;
        if (waitingStateTimeout) {
            clearTimeout(waitingStateTimeout);
            waitingStateTimeout = null;
        }

        // Clear any existing animation loops
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        // Show default animation until user clicks Play
        // (audio-reactive will start when audio plays)
        animateDefault();
        console.log('BG3: Default animation started');
    }

    /**
     * Audio-reactive animation
     */
    function animateAudioReactive() {
        if (!ctx || !analyser) {
            console.error('BG3: animateAudioReactive() - Missing ctx or analyser');
            return;
        }

        analyser.getByteFrequencyData(dataArray);

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Choose visualization style
        switch (visualizerStyle) {
            case 'bars':
                drawBars();
                break;
            case 'circular':
                drawCircular();
                break;
            case 'waveform':
                drawWaveform();
                break;
            case 'particles':
                drawParticles();
                break;
            default:
                drawBars();
        }

        animationId = requestAnimationFrame(animateAudioReactive);
    }

    /**
     * Draw frequency bars
     */
    function drawBars() {
        const barWidth = canvas.width / bufferLength;
        const rgb = hexToRgb(currentThemeColor);

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
            const x = i * barWidth;
            const y = canvas.height - barHeight;

            // Color based on frequency
            const hue = (i / bufferLength) * 60;
            const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
            gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
    }

    /**
     * Draw circular visualizer
     */
    function drawCircular() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.3;
        const rgb = hexToRgb(currentThemeColor);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        for (let i = 0; i < bufferLength; i++) {
            const angle = (i / bufferLength) * Math.PI * 2;
            const barHeight = (dataArray[i] / 255) * radius;

            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);

            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${rgb.r + 50}, ${rgb.g - 30}, ${rgb.b + 30}, 0.4)`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = (canvas.width / bufferLength) * 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }

    /**
     * Draw waveform
     */
    function drawWaveform() {
        const rgb = hexToRgb(currentThemeColor);
        const sliceWidth = canvas.width / bufferLength;

        ctx.lineWidth = 3;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`;
        ctx.beginPath();

        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 255.0;
            const y = v * canvas.height;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        ctx.stroke();

        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    /**
     * Draw reactive particles
     */
    function drawParticles() {
        const rgb = hexToRgb(currentThemeColor);

        for (let i = 0; i < bufferLength; i += 2) {
            const size = (dataArray[i] / 255) * 20 + 2;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Update theme colors
     */
    function updateTheme(hexColor) {
        currentThemeColor = hexColor;
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
     * Handle window resize
     */
    function resize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    /**
     * Change visualizer style
     */
    function setStyle(style) {
        visualizerStyle = style;
    }

    /**
     * Pause
     */
    function pause() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (audioElement) {
            audioElement.pause();
        }
    }


    /**
     * Cleanup
     */
    function destroy() {
        // Stop waiting state
        waitingStateActive = false;
        if (waitingStateTimeout) {
            clearTimeout(waitingStateTimeout);
            waitingStateTimeout = null;
        }

        pause();

        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }

        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }

        canvas = null;
        ctx = null;
        analyser = null;
        sourceNode = null;
        dataArray = null;
        audioElement = null;

        console.log('BG3: Audio Visualizer destroyed');
    }

    // Public API
    return {
        init,
        destroy,
        updateTheme,
        resize,
        setAudio,
        setStyle,
        pause,
        // play, // REMOVED - use playAudio instead
        startRendering,

        // NEW: Audio playback controls (separate from visualization)
        playAudio: function() {
            if (audioElement && audioContext && analyser) {
                // Stop default animation if running
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }

                // CRITICAL FIX: Resume AudioContext if suspended
                // Browser autoplay policies often suspend AudioContext by default
                if (audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {
                        console.log('BG3: AudioContext resumed');
                        audioElement.play().then(() => {
                            console.log('BG3: Audio playing');
                        }).catch(err => {
                            console.error('BG3: Error playing audio:', err);
                        });

                        // Start audio-reactive animation
                        animateAudioReactive();
                    }).catch(err => {
                        console.error('BG3: Error resuming AudioContext:', err);
                    });
                } else {
                    // AudioContext already running
                    audioElement.play().then(() => {
                        console.log('BG3: Audio playing');
                    }).catch(err => {
                        console.error('BG3: Error playing audio:', err);
                    });

                    animateAudioReactive();
                }
            } else {
                console.error('BG3: Missing required components for audio playback');
            }
        },

        pauseAudio: function() {
            if (audioElement) {
                // Pause audio
                audioElement.pause();

                // Stop audio-reactive animation if running
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }

                // Switch back to default animation
                animateDefault();

                console.log('BG3: Audio paused');
            }
        },

        // Customization setters
        setSensitivity: (value) => {
            sensitivity = value;
        },
        setBarCount: (count) => {
            barCount = count;
            if (analyser) {
                analyser.fftSize = count * 2;
                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
            }
        }
    };
})();

console.log('bg3-audio-visualizer.js loaded successfully!');
