console.log('lyrics-animator.js loaded successfully!'); // Debug log

window.isPlaying = false; // Play state
window.currentTime = 0; // Virtual current time in seconds
window.lastFrameTime = null; // For delta time in animation
window.totalTime = 0; // Song duration
window.typewriterTimeouts = []; // Track typewriter timeouts
window.currentDisplayIndex = -1; // Track current lyric line index

// Helper to format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Clear pending typewriter timeouts
function clearTypewriterTimeouts() {
    window.typewriterTimeouts.forEach(timeout => clearTimeout(timeout));
    window.typewriterTimeouts = [];
}

window.parseAndAnimateLyrics = async function (file) {
    console.info(`[${new Date().toISOString()}] Starting parseAndAnimateLyrics for ${file.name}`);
    const fileName = file.name;
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    document.getElementById('upload-title').textContent = nameWithoutExt;
    // Hide upload instructions & Inputs
    document.getElementById('upload-instructions').style.display = 'none';
    document.getElementById('user-inputs').style.display = 'none';

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
            console.log(`[${new Date().toISOString()}] Parsed line ${index}: time=${timeInSeconds}s, text="${text}"`);
        } else {
            console.warn(`[${new Date().toISOString()}] Skipped invalid line ${index}: ${line}`);
        }
    });

    if (lyricData.length === 0) {
        console.error(`[${new Date().toISOString()}] No valid timestamps found in file`);
        document.getElementById('status').textContent = 'No valid timestamps found. Try a proper LRC file.';
        return;
    }

    console.info(`[${new Date().toISOString()}] Parsed ${lyricData.length} valid lyric lines`);
    lyricData.sort((a, b) => a.time - b.time);

    // Calculate total time (last lyric time + buffer, e.g., 5s)
    window.totalTime = lyricData[lyricData.length - 1].time + 5;

    const container = document.getElementById('lyrics-container');
    container.innerHTML = '';
    lyricData.forEach((lyric, index) => {
        const div = document.createElement('div');
        div.className = 'karaoke-line';
        div.dataset.index = index;
        div.dataset.time = lyric.time;
        lyric.text.split(' ').forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'karaoke-word';
            wordSpan.style.whiteSpace = 'nowrap'; // keep word chars together

            word.split('').forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.className = 'karaoke-char';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
            });

            div.appendChild(wordSpan);

            // Add a space after the word
            if (wordIndex < lyric.text.split(' ').length - 1) {
                div.appendChild(document.createTextNode(' '));
            }
        });

        // <— Add this line:
        container.appendChild(div);

    });

    // Show controls and set up progress bar
    const controls = document.getElementById('controls');
    controls.style.display = 'block';
    const progressBar = document.getElementById('progress-bar');
    progressBar.max = window.totalTime;
    progressBar.value = 0;

    // Time display
    document.getElementById('time-display').textContent = `${formatTime(0)} / ${formatTime(window.totalTime)}`;

    // Play/Pause button listener
    const playPauseBtn = document.getElementById('play-pause');
    playPauseBtn.textContent = 'Play';
    playPauseBtn.addEventListener('click', () => {
        window.isPlaying = !window.isPlaying;
        playPauseBtn.textContent = window.isPlaying ? 'Pause' : 'Play';
        if (window.isPlaying) {
            window.lastFrameTime = performance.now();
            requestAnimationFrame(() => window.animateLyrics(lyricData)); // Start animation
        } else {
            clearTypewriterTimeouts(); // Clear typewriter effects on pause
            updateLyricsDisplay(lyricData); // Ensure current lyric stays visible
        }
    });

    // Progress bar seeking with debouncing
    let seekTimeout;
    let wasPlayingBeforeSeek = false; // New: Track play state before seeking
    progressBar.addEventListener('mousedown', () => {
        wasPlayingBeforeSeek = window.isPlaying; // Save state
        window.isPlaying = false; // Pause animation during drag
        clearTypewriterTimeouts(); // Clear typewriter effects
    });
    progressBar.addEventListener('touchstart', () => {
        wasPlayingBeforeSeek = window.isPlaying; // Save state for touch
        window.isPlaying = false; // Pause animation during drag
        clearTypewriterTimeouts(); // Clear typewriter effects
    });
    progressBar.addEventListener('input', (e) => {
        clearTimeout(seekTimeout);
        seekTimeout = setTimeout(() => {
            window.currentTime = parseFloat(e.target.value);
            updateTimeDisplay();
            updateLyricsDisplay(lyricData); // Update lyrics on seek
        }, 50); // 50ms debounce
    });
    progressBar.addEventListener('mouseup', () => {
        if (wasPlayingBeforeSeek) {
            window.isPlaying = true; // Resume if playing before
            window.lastFrameTime = performance.now(); // Reset for smooth delta
            requestAnimationFrame(() => window.animateLyrics(lyricData));
        }
    });
    progressBar.addEventListener('touchend', () => {
        if (wasPlayingBeforeSeek) {
            window.isPlaying = true; // Resume if playing before
            window.lastFrameTime = performance.now(); // Reset for smooth delta
            requestAnimationFrame(() => window.animateLyrics(lyricData));
        }
    });

    // Show initial lyric
    updateLyricsDisplay(lyricData);
    updateTimeDisplay();

    document.getElementById('status').textContent = '';
    console.info(`[${new Date().toISOString()}] Controls ready; initial lyric displayed`);
};

function updateLyricsDisplay(lyricData) {
    const lines = document.querySelectorAll('.karaoke-line');
    let currentIndex = 0;

    // Find the current line
    while (currentIndex < lyricData.length && window.currentTime >= lyricData[currentIndex].time) {
        currentIndex++;
    }
    const displayIndex = Math.max(0, currentIndex - 1);

    // Only clear timeouts and update if the line has changed
    if (displayIndex !== window.currentDisplayIndex) {
        clearTypewriterTimeouts();
        window.currentDisplayIndex = displayIndex;
    }

    lines.forEach((line, i) => {
        const chars = line.querySelectorAll('.karaoke-char');

        if (i === displayIndex) {
            line.classList.add('current');
            line.classList.remove('fade-out');
            // Typewriter effect only if playing and timeouts are empty
            if (window.isPlaying && window.typewriterTimeouts.length === 0) {
                chars.forEach(char => char.classList.remove('visible'));
                chars.forEach((char, charIndex) => {
                    const timeout = setTimeout(() => {
                        char.classList.add('visible');
                    }, charIndex * 50);
                    window.typewriterTimeouts.push(timeout);
                });
            } else if (!window.isPlaying) {
                // Show all characters immediately when paused or seeking
                chars.forEach(char => char.classList.add('visible'));
            }
        } else {
            line.classList.remove('current');
            line.classList.add('fade-out');
            chars.forEach(char => char.classList.remove('visible'));
        }
    });
}

function updateTimeDisplay() {
    document.getElementById('time-display').textContent = `${formatTime(window.currentTime)} / ${formatTime(window.totalTime)}`;
    document.getElementById('progress-bar').value = window.currentTime;
}

window.animateLyrics = function (lyricData) {
    if (!window.isPlaying) return; // Stop if paused

    const now = performance.now();
    if (window.lastFrameTime) {
        const delta = (now - window.lastFrameTime) / 1000;
        window.currentTime = Math.min(window.currentTime + delta, window.totalTime); // Clamp to end
    }
    window.lastFrameTime = now;

    console.debug(`[${new Date().toISOString()}] Current time: ${window.currentTime.toFixed(2)}s`);

    updateLyricsDisplay(lyricData);
    updateTimeDisplay();

    if (window.currentTime < window.totalTime) {
        requestAnimationFrame(() => window.animateLyrics(lyricData));
    } else {
        console.info(`[${new Date().toISOString()}] Animation completed`);
        document.getElementById('status').textContent = 'Song complete! Reset to replay.';
        window.isPlaying = false;
        document.getElementById('play-pause').textContent = 'Play';
        clearTypewriterTimeouts();
        updateLyricsDisplay(lyricData); // Ensure final lyric stays visible
    }
};