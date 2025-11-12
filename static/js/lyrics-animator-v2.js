Logger.debug('lyrics-animator-v2.js loaded successfully!');

// Configuration constants (Issue #32 fix)
const CONFIG = {
    LYRIC_END_BUFFER_SECONDS: 5,      // Extra time after last lyric
    ANIMATION_DELAY_MS: 50,            // Delay between character animations
    TIME_UPDATE_THROTTLE_MS: 1000,    // Throttle time display updates
    SCROLL_DEBOUNCE_MS: 100,           // Debounce scroll events
    MS_TO_SECONDS: 1000,              // Milliseconds to seconds conversion
};

// V2 Global state
window.isPlaying = false;
window.currentTime = 0;
window.lastFrameTime = null;
window.totalTime = 0;
window.typewriterTimeouts = [];
window.currentDisplayIndex = -1;
window.currentAnimation = 'typewriter'; // Default animation
window.currentLayout = 'classic'; // Default layout

// Time display throttling (Issue #30 fix)
let lastTimeUpdate = 0;
let lastDisplayedTime = -1;

// Scroll tracking for multiline layout (Issue #23 fix)
let lastScrolledLineIndex = -1;

// Standardized error handler (Issue #33 fix)
function handleError(errorType, details = {}) {
    // Log to console (always)
    Logger.error(`[${errorType}]`, details);

    // Show user-friendly notification if NotificationManager is available
    if (window.NotificationManager) {
        window.NotificationManager.showError(errorType);
    }

    // Fallback to status element if NotificationManager not available
    const statusElement = document.getElementById('status');
    if (statusElement && !window.NotificationManager) {
        statusElement.textContent = `Error: ${errorType}`;
        statusElement.style.color = 'var(--error, #ff4444)';
    }
}

// Helper to format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Debounce function for scroll (Issue #23 fix)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced scroll function (Issue #23 fix)
const scrollToCurrentLine = debounce((line, currentIndex) => {
    // Only scroll if line changed
    if (currentIndex !== lastScrolledLineIndex) {
        lastScrolledLineIndex = currentIndex;

        line.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    }
}, CONFIG.SCROLL_DEBOUNCE_MS);  // Scroll debounce

// Clear pending timeouts
function clearTypewriterTimeouts() {
    window.typewriterTimeouts.forEach(timeout => clearTimeout(timeout));
    window.typewriterTimeouts.length = 0; // Clear array properly to prevent memory leak
}

window.parseAndAnimateLyrics = async function (file) {
    Logger.info('Starting parseAndAnimateLyrics V2 for', file.name);

    // Clear any existing timeouts from previous session
    clearTypewriterTimeouts();

    const fileName = file.name;
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    document.getElementById('upload-title').textContent = nameWithoutExt;

    // Hide upload instructions & Inputs
    document.getElementById('upload-instructions').style.display = 'none';
    document.getElementById('user-inputs').style.display = 'none';

    // Show loading skeleton
    const skeleton = document.getElementById('lyrics-skeleton');
    if (skeleton) {
        skeleton.style.display = 'flex';
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() && line.includes('['));
    const lyricData = [];

    lines.forEach((line, index) => {
        const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseFloat(match[2]);
            const text = match[3].trim();
            const timeInSeconds = minutes * 60 + seconds;
            lyricData.push({ time: timeInSeconds, text });
        } else {
            Logger.warn('Skipped invalid line:', line);
        }
    });

    if (lyricData.length === 0) {
        handleError('noTimestamps', { file: file.name });
        document.getElementById('status').textContent = 'Upload a valid LRC file to continue';
        return;
    }

    Logger.info('Parsed', lyricData.length, 'valid lyric lines');
    lyricData.sort((a, b) => a.time - b.time);

    // Calculate total time
    window.totalTime = lyricData[lyricData.length - 1].time + CONFIG.LYRIC_END_BUFFER_SECONDS;

    const container = document.getElementById('lyrics-container');
    container.innerHTML = '';

    // Hide loading skeleton
    if (skeleton) {
        skeleton.style.display = 'none';
    }

    // Build lyric elements
    lyricData.forEach((lyric, index) => {
        const div = document.createElement('div');
        div.className = 'karaoke-line';
        div.dataset.index = index;
        div.dataset.time = lyric.time;

        lyric.text.split(' ').forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'karaoke-word';
            wordSpan.style.whiteSpace = 'nowrap';

            word.split('').forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'karaoke-char';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
            });

            div.appendChild(wordSpan);

            // Add space after word
            if (wordIndex < lyric.text.split(' ').length - 1) {
                div.appendChild(document.createTextNode(' '));
            }
        });

        container.appendChild(div);
    });

    // Show controls
    const controls = document.getElementById('controls');
    controls.style.display = 'block';
    const progressBar = document.getElementById('progress-bar');
    progressBar.max = window.totalTime;
    progressBar.value = 0;

    // Time display
    document.getElementById('time-display').textContent = `${formatTime(0)} / ${formatTime(window.totalTime)}`;

    // Play/Pause button
    const playPauseBtn = document.getElementById('play-pause');
    const buttonTextSpan = playPauseBtn.querySelector('.button-text');
    const buttonIconSpan = playPauseBtn.querySelector('[aria-hidden]');

    // Initialize button state
    if (buttonTextSpan) buttonTextSpan.textContent = 'Play';
    if (buttonIconSpan) buttonIconSpan.textContent = '�';

    playPauseBtn.onclick = () => {
        window.isPlaying = !window.isPlaying;

        // Update button text, icon, and ARIA attributes
        if (window.isPlaying) {
            if (buttonTextSpan) buttonTextSpan.textContent = 'Pause';
            if (buttonIconSpan) buttonIconSpan.textContent = '�';
            playPauseBtn.setAttribute('aria-label', 'Pause lyrics animation');
            playPauseBtn.setAttribute('aria-pressed', 'true');
        } else {
            if (buttonTextSpan) buttonTextSpan.textContent = 'Play';
            if (buttonIconSpan) buttonIconSpan.textContent = '�';
            playPauseBtn.setAttribute('aria-label', 'Play lyrics animation');
            playPauseBtn.setAttribute('aria-pressed', 'false');
        }

        if (window.isPlaying) {
            // Track achievement on first play only
            if (window.currentTime === 0 && window.AchievementSystem) {
                window.AchievementSystem.trackAction('interactive_used');
            }
            window.lastFrameTime = performance.now();
            requestAnimationFrame(() => window.animateLyrics(lyricData));

            // NEW: Start audio playback if available (BG3 audio visualizer)
            if (window.BackgroundManager && window.BackgroundManager.playAudio) {
                window.BackgroundManager.playAudio();
            }
        } else {
            clearTypewriterTimeouts();
            updateLyricsDisplay(lyricData);

            // NEW: Pause audio playback if available
            if (window.BackgroundManager && window.BackgroundManager.pauseAudio) {
                window.BackgroundManager.pauseAudio();
            }
        }
    };

    // Progress bar seeking
    let seekTimeout;
    let wasPlayingBeforeSeek = false;

    progressBar.addEventListener('mousedown', () => {
        wasPlayingBeforeSeek = window.isPlaying;
        window.isPlaying = false;
        lastScrolledLineIndex = -1;  // Reset scroll tracking (Issue #23 fix)
        clearTypewriterTimeouts();
    });

    progressBar.addEventListener('touchstart', () => {
        wasPlayingBeforeSeek = window.isPlaying;
        window.isPlaying = false;
        clearTypewriterTimeouts();
    });

    progressBar.addEventListener('input', (e) => {
        clearTimeout(seekTimeout);
        seekTimeout = setTimeout(() => {
            window.currentTime = parseFloat(e.target.value);
            updateTimeDisplay();
            updateLyricsDisplay(lyricData);
        }, 50);
    });

    progressBar.addEventListener('mouseup', () => {
        if (wasPlayingBeforeSeek) {
            window.isPlaying = true;
            window.lastFrameTime = performance.now();
            requestAnimationFrame(() => window.animateLyrics(lyricData));
        }
    });

    progressBar.addEventListener('touchend', () => {
        if (wasPlayingBeforeSeek) {
            window.isPlaying = true;
            window.lastFrameTime = performance.now();
            requestAnimationFrame(() => window.animateLyrics(lyricData));
        }
    });

    // Progress bar tooltip
    let progressTooltip = null;

    progressBar.addEventListener('mouseenter', () => {
        // Create tooltip element if it doesn't exist
        if (!progressTooltip) {
            progressTooltip = document.createElement('div');
            progressTooltip.className = 'progress-tooltip';
            progressTooltip.setAttribute('role', 'tooltip');
            progressTooltip.setAttribute('aria-live', 'polite');
            const controlsDiv = document.getElementById('controls');
            if (controlsDiv) {
                controlsDiv.style.position = 'relative';
                controlsDiv.appendChild(progressTooltip);
            } else {
                Logger.warn('Controls div not found - progress tooltip disabled');
                // Don't create tooltip if there's no container
                progressTooltip = null;
            }
        }
    });

    progressBar.addEventListener('mousemove', (e) => {
        if (!progressTooltip) return;

        // Calculate time based on mouse position
        const rect = progressBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
        const hoverTime = percentage * window.totalTime;

        // Update tooltip content
        progressTooltip.textContent = formatTime(hoverTime);
        progressTooltip.classList.add('visible');

        // Calculate tooltip position with bounds checking (Issue #18 fix)
        const tooltipWidth = progressTooltip.offsetWidth || 60;  // Approximate width
        let tooltipX = offsetX - (tooltipWidth / 2);  // Center on cursor

        // Keep tooltip within progress bar bounds
        const minX = 0;
        const maxX = rect.width - tooltipWidth;
        tooltipX = Math.max(minX, Math.min(maxX, tooltipX));

        progressTooltip.style.left = `${tooltipX}px`;
    });

    progressBar.addEventListener('mouseleave', () => {
        if (progressTooltip) {
            progressTooltip.classList.remove('visible');
        }
    });

    // Show initial lyric
    updateLyricsDisplay(lyricData);
    updateTimeDisplay();

    document.getElementById('status').textContent = '';
    Logger.info('V2 Controls ready; initial lyric displayed');
};

function updateLyricsDisplay(lyricData) {
    const container = document.getElementById('lyrics-container');
    const lines = document.querySelectorAll('.karaoke-line');
    let currentIndex = 0;

    // Find current line
    while (currentIndex < lyricData.length && window.currentTime >= lyricData[currentIndex].time) {
        currentIndex++;
    }
    const displayIndex = Math.max(0, currentIndex - 1);

    // Clear timeouts if line changed
    if (displayIndex !== window.currentDisplayIndex) {
        clearTypewriterTimeouts();
        window.currentDisplayIndex = displayIndex;
    }

    // Apply layout first
    const layoutMode = window.currentLayout || 'classic';
    if (window.LyricsLayouts && window.LyricsLayouts[layoutMode]) {
        window.LyricsLayouts[layoutMode].apply(container, lyricData, displayIndex);
    }

    // Apply animations to current line
    lines.forEach((line, i) => {
        const chars = line.querySelectorAll('.karaoke-char');

        if (i === displayIndex) {
            line.classList.add('current');
            line.classList.remove('fade-out');

            // Smooth scroll to current line (for multiline layouts) (Issue #23 fix)
            if (layoutMode === 'multiline' && window.isPlaying) {
                scrollToCurrentLine(line, currentDisplayIndex);
            }

            // Apply selected animation with error boundary
            const animationPreset = window.currentAnimation || 'typewriter';
            if (window.LyricsAnimations && window.LyricsAnimations[animationPreset]) {
                try {
                    window.LyricsAnimations[animationPreset](chars, window.isPlaying);
                } catch (error) {
                    handleError('animationError', { animation: animationPreset, error: error.message });

                    // Fallback to simple display
                    chars.forEach(char => char.classList.add('visible'));

                    // Reset to typewriter (safe fallback)
                    window.currentAnimation = 'typewriter';

                    // Update UI if possible
                    const animationSelect = document.getElementById('animation-preset') ||
                                            document.getElementById('v2-animation-preset');
                    if (animationSelect) {
                        animationSelect.value = 'typewriter';
                    }
                }
            } else {
                // Fallback to making chars visible
                chars.forEach(char => char.classList.add('visible'));
            }
        } else {
            line.classList.remove('current');
            line.classList.add('fade-out');
            chars.forEach(char => {
                char.classList.remove('visible');
                char.style.animation = 'none';
            });
        }
    });
}

function updateTimeDisplay() {
    const now = Date.now();
    const currentTimeSeconds = Math.floor(window.currentTime);

    // Throttle: only update display once per second (Issue #30 fix)
    if (now - lastTimeUpdate < CONFIG.TIME_UPDATE_THROTTLE_MS && currentTimeSeconds === lastDisplayedTime) {
        // Still update progress bar (smooth animation)
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.value = window.currentTime;
            // Issue #41 fix: Update aria attributes for screen readers
            progressBar.setAttribute('aria-valuenow', window.currentTime.toFixed(1));
            progressBar.setAttribute('aria-valuetext', `${formatTime(window.currentTime)} of ${formatTime(window.totalTime)}`);
        }
        return;
    }

    lastTimeUpdate = now;
    lastDisplayedTime = currentTimeSeconds;

    // Update time display (only once per second)
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
        timeDisplay.textContent = `${formatTime(window.currentTime)} / ${formatTime(window.totalTime)}`;
    }

    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.value = window.currentTime;
        // Issue #41 fix: Update aria attributes for screen readers
        progressBar.setAttribute('aria-valuenow', window.currentTime.toFixed(1));
        progressBar.setAttribute('aria-valuetext', `${formatTime(window.currentTime)} of ${formatTime(window.totalTime)}`);
    }
}

window.animateLyrics = function (lyricData) {
    if (!window.isPlaying) return;

    const now = performance.now();
    if (window.lastFrameTime) {
        const delta = (now - window.lastFrameTime) / CONFIG.MS_TO_SECONDS;
        window.currentTime = Math.min(window.currentTime + delta, window.totalTime);
    }
    window.lastFrameTime = now;

    updateLyricsDisplay(lyricData);
    updateTimeDisplay();

    if (window.currentTime < window.totalTime) {
        requestAnimationFrame(() => window.animateLyrics(lyricData));
    } else {
        Logger.info('V2 Animation completed');
        document.getElementById('status').textContent = 'Song complete! Reset to replay.';
        window.isPlaying = false;
        lastScrolledLineIndex = -1;  // Reset scroll tracking (Issue #23 fix)

        // Update Play/Pause button state
        const playPauseBtn = document.getElementById('play-pause');
        const buttonTextSpan = playPauseBtn.querySelector('.button-text');
        const buttonIconSpan = playPauseBtn.querySelector('[aria-hidden]');

        if (buttonTextSpan) buttonTextSpan.textContent = 'Play';
        if (buttonIconSpan) buttonIconSpan.textContent = '�';
        playPauseBtn.setAttribute('aria-label', 'Play lyrics animation');
        playPauseBtn.setAttribute('aria-pressed', 'false');

        clearTypewriterTimeouts();
        updateLyricsDisplay(lyricData);
    }
};
