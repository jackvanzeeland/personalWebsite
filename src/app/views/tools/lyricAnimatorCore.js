/**
 * Lyric Animator core — extracted verbatim from the inline script in
 * pages/projects/lyric-animator.html. Plain JS on purpose: legacy code
 * kept behavior-identical, untyped (allowJs), lint-exempt like other
 * ported .js components.
 *
 * @param {AbortSignal} signal - document-level listeners bind with this
 *   signal so the SPA view can abort them on unmount.
 */
/* eslint-disable */
export function initLyricAnimatorCore(signal) {


        // ── Generate CSS particles ──
        (function generateParticles() {
            var container = document.getElementById('particles');
            for (var i = 0; i < 30; i++) {
                var p = document.createElement('div');
                p.className = 'particle';
                var size = Math.random() * 4 + 1;
                p.style.width = size + 'px';
                p.style.height = size + 'px';
                p.style.left = Math.random() * 100 + '%';
                p.style.animationDuration = (Math.random() * 12 + 8) + 's';
                p.style.animationDelay = (Math.random() * 10) + 's';
                container.appendChild(p);
            }
        })();

        // ── Generate twinkling stars (enhanced with varied sizes + colors) ──
        (function generateStars() {
            var container = document.getElementById('stars');
            var themeColors = ['#fff', '#fff', '#fff', 'var(--primary)', 'var(--glow)', 'var(--accent)'];
            for (var i = 0; i < 80; i++) {
                var s = document.createElement('div');
                s.className = 'star';
                var size = Math.random() * 2.5 + 0.5; // 0.5-3px
                s.style.width = size + 'px';
                s.style.height = size + 'px';
                s.style.left = Math.random() * 100 + '%';
                s.style.top = Math.random() * 100 + '%';
                s.style.background = themeColors[Math.floor(Math.random() * themeColors.length)];
                s.style.animationDuration = (Math.random() * 3 + 2) + 's';
                s.style.animationDelay = (Math.random() * 3) + 's';
                container.appendChild(s);
            }
        })();

        // ── Shooting stars ──
        function spawnShootingStar() {
            var el = document.createElement('div');
            el.className = 'shooting-star';
            el.style.top = Math.random() * 50 + '%';
            el.style.left = Math.random() * 60 + '%';
            el.style.transform = 'rotate(' + (Math.random() * 20 + 20) + 'deg)';
            el.style.width = (Math.random() * 60 + 40) + 'px';
            document.body.appendChild(el);
            setTimeout(function() { el.remove(); }, 1600);
        }
        // Random shooting stars every 4-10s — chain stops on unmount, or it
        // would keep appending stars to document.body on every other page.
        var shootingStarTimer = null;
        (function scheduleShootingStar() {
            var delay = Math.random() * 6000 + 4000;
            shootingStarTimer = setTimeout(function() {
                if (signal.aborted) return;
                spawnShootingStar();
                scheduleShootingStar();
            }, delay);
        })();
        signal.addEventListener('abort', function() {
            clearTimeout(shootingStarTimer);
        });

        // ── State ──
        var lyricData = null;
        var isPlaying = false;
        var virtualTime = 0;
        var lastFrameTime = 0;
        var animFrameId = null;
        var typewriterTimeouts = [];
        var wasDragging = false;
        var isDragging = false;
        var currentDisplayIndex = -1;

        // ── Particle burst system ──
        var burstCanvas = document.getElementById('burst-canvas');
        var burstCtx = burstCanvas.getContext('2d');
        var burstParticles = [];

        function resizeBurstCanvas() {
            burstCanvas.width = window.innerWidth;
            burstCanvas.height = window.innerHeight;
        }
        resizeBurstCanvas();
        window.addEventListener('resize', resizeBurstCanvas, { signal: signal });

        function createBurst(x, y) {
            var colors = [
                getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
                getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
                getComputedStyle(document.documentElement).getPropertyValue('--glow').trim(),
                '#ffffff'
            ];
            var count = 25 + Math.floor(Math.random() * 15);
            for (var i = 0; i < count; i++) {
                var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
                var speed = Math.random() * 3 + 1.5;
                burstParticles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1,
                    size: Math.random() * 3 + 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 1,
                    decay: 0.012 + Math.random() * 0.01
                });
            }
        }

        function updateBurstParticles() {
            for (var i = burstParticles.length - 1; i >= 0; i--) {
                var p = burstParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.04; // gravity
                p.life -= p.decay;
                if (p.life <= 0) {
                    burstParticles.splice(i, 1);
                }
            }
        }

        function drawBurstParticles() {
            burstCtx.clearRect(0, 0, burstCanvas.width, burstCanvas.height);
            for (var i = 0; i < burstParticles.length; i++) {
                var p = burstParticles[i];
                burstCtx.save();
                burstCtx.globalAlpha = p.life;
                burstCtx.shadowColor = p.color;
                burstCtx.shadowBlur = 12;
                burstCtx.fillStyle = p.color;
                burstCtx.beginPath();
                burstCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                burstCtx.fill();
                burstCtx.restore();
            }
        }

        // ── DOM refs ──
        var uploadArea = document.getElementById('upload-area');
        var uploadBtn = document.getElementById('upload-btn');
        var fileInput = document.getElementById('file-input');
        var lyricsContainer = document.getElementById('lyrics-container');
        var controls = document.getElementById('controls');
        var playPauseBtn = document.getElementById('play-pause-btn');
        var newSongBtn = document.getElementById('new-song-btn');
        var progressBar = document.getElementById('progress-bar');
        var progressFill = document.getElementById('progress-fill');
        var timeCurrent = document.getElementById('time-current');
        var timeTotal = document.getElementById('time-total');
        var statusText = document.getElementById('status-text');
        var resetBtn = document.getElementById('reset-btn');
        var themeColor = document.getElementById('theme-color');
        var songTitle = document.getElementById('song-title');
        var orbs = document.querySelectorAll('.gradient-bg .orb');

        // ── Color helpers ──
        function hexToRgb(hex) {
            var r = parseInt(hex.slice(1,3), 16);
            var g = parseInt(hex.slice(3,5), 16);
            var b = parseInt(hex.slice(5,7), 16);
            return { r: r, g: g, b: b };
        }

        function hexToHsl(hex) {
            var rgb = hexToRgb(hex);
            var rn = rgb.r/255, gn = rgb.g/255, bn = rgb.b/255;
            var max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
            var h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max) {
                    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
                    case gn: h = ((bn - rn) / d + 2) / 6; break;
                    case bn: h = ((rn - gn) / d + 4) / 6; break;
                }
            }
            return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        }

        function hslToHex(h, s, l) {
            s /= 100; l /= 100;
            var a = s * Math.min(l, 1-l);
            var f = function(n) {
                var k = (n + h/30) % 12;
                var color = l - a * Math.max(Math.min(k-3, 9-k, 1), -1);
                return Math.round(255 * color).toString(16).padStart(2, '0');
            };
            return '#' + f(0) + f(8) + f(4);
        }

        function applyTheme(hex) {
            var hsl = hexToHsl(hex);
            var rgb = hexToRgb(hex);

            var accentH = (hsl.h - 20 + 360) % 360;
            var accentL = Math.min(100, hsl.l + 5);
            var accentHex = hslToHex(accentH, hsl.s, accentL);
            var accentRgb = hexToRgb(accentHex);

            var glowH = (hsl.h + 31) % 360;
            var glowL = Math.max(0, hsl.l - 16);
            var glowHex = hslToHex(glowH, hsl.s, glowL);
            var glowRgb = hexToRgb(glowHex);

            var root = document.documentElement;
            root.style.setProperty('--primary', hex);
            root.style.setProperty('--primary-rgb', rgb.r + ',' + rgb.g + ',' + rgb.b);
            root.style.setProperty('--accent', accentHex);
            root.style.setProperty('--accent-rgb', accentRgb.r + ',' + accentRgb.g + ',' + accentRgb.b);
            root.style.setProperty('--glow', glowHex);
            root.style.setProperty('--glow-rgb', glowRgb.r + ',' + glowRgb.g + ',' + glowRgb.b);
        }

        themeColor.addEventListener('input', function() { applyTheme(this.value); });

        // Theme vars live inline on <html>; drop them on unmount so the
        // lyric palette can't bleed into the rest of the site. --accent is
        // NOT removed: the router owns it and has already set the next
        // route's value by the time this abort handler runs — removing it
        // would expose this stylesheet's :root fallback site-wide.
        signal.addEventListener('abort', function() {
            ['--primary', '--primary-rgb', '--accent-rgb', '--glow', '--glow-rgb']
                .forEach(function(prop) { document.documentElement.style.removeProperty(prop); });
        });

        // ── LRC Parser ──
        function parseLRC(text) {
            var lines = text.split('\n');
            var parsed = [];
            var timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/;

            for (var idx = 0; idx < lines.length; idx++) {
                var line = lines[idx];
                var match = line.match(timeRegex);
                if (!match) continue;
                var minutes = parseInt(match[1], 10);
                var seconds = parseInt(match[2], 10);
                var ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
                var time = minutes * 60 + seconds + ms / 1000;
                var lyricText = line.replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, '').trim();
                if (lyricText) {
                    parsed.push({ time: time, text: lyricText });
                }
            }
            parsed.sort(function(a, b) { return a.time - b.time; });
            return parsed;
        }

        // ── Build karaoke DOM (word-aware for proper spacing) ──
        function buildLyricsDom(data) {
            lyricsContainer.innerHTML = '';
            data.forEach(function(item, i) {
                var div = document.createElement('div');
                div.className = 'lyric-line';
                div.dataset.index = i;

                // Split text into words, wrap each word, split chars within
                var words = item.text.split(' ');
                words.forEach(function(word, wIdx) {
                    var wordSpan = document.createElement('span');
                    wordSpan.className = 'word';

                    word.split('').forEach(function(ch) {
                        var charSpan = document.createElement('span');
                        charSpan.className = 'char';
                        charSpan.textContent = ch;
                        wordSpan.appendChild(charSpan);
                    });

                    div.appendChild(wordSpan);

                    // Add a real space text node between words
                    if (wIdx < words.length - 1) {
                        div.appendChild(document.createTextNode(' '));
                    }
                });

                lyricsContainer.appendChild(div);
            });
        }

        // ── Smooth transition: upload → playback ──
        function showPlaybackView(fileName) {
            // Fade out upload area
            uploadArea.classList.add('fade-out');

            setTimeout(function() {
                uploadArea.style.display = 'none';

                // Show song title with fade-in
                songTitle.textContent = fileName;
                songTitle.style.display = 'block';
                // Force reflow before adding visible class
                songTitle.offsetHeight;
                songTitle.classList.add('visible');

                // Show lyrics container with fade-in
                lyricsContainer.style.display = 'flex';
                lyricsContainer.offsetHeight;
                lyricsContainer.classList.add('visible');

                // Show controls with slide-up
                controls.style.display = 'block';
                controls.offsetHeight;
                controls.classList.add('visible');

                // Inside the detail page the controls land below the fold —
                // bring the whole playback view (lyrics + controls) on screen.
                controls.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 400);
        }

        // ── Reset to upload (no page reload) ──
        function resetToUpload() {
            // Stop playback
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }
            isPlaying = false;
            virtualTime = 0;
            lastFrameTime = 0;
            currentDisplayIndex = -1;
            lyricData = null;
            clearTypewriterTimeouts();
            burstParticles.length = 0;

            // Hide playback elements
            songTitle.classList.remove('visible');
            lyricsContainer.classList.remove('visible');
            controls.classList.remove('visible');

            setTimeout(function() {
                songTitle.style.display = 'none';
                songTitle.textContent = '';
                lyricsContainer.style.display = 'none';
                lyricsContainer.innerHTML = '';
                controls.style.display = 'none';

                // Reset controls state
                playPauseBtn.innerHTML = '&#9654; Play';
                playPauseBtn.classList.add('paused');
                progressFill.style.width = '0%';
                timeCurrent.textContent = '0:00';
                timeTotal.textContent = '0:00';
                statusText.textContent = 'Ready \u2014 upload an .lrc file to begin';

                // Show upload area
                uploadArea.style.display = '';
                uploadArea.classList.remove('fade-out');

                // Reset file input so same file can be re-selected
                fileInput.value = '';
            }, 400);
        }

        // ── Parse and animate ──
        function parseAndAnimateLyrics(file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var parsed = parseLRC(e.target.result);
                if (parsed.length === 0) {
                    statusText.textContent = 'No valid LRC timestamps found in file';
                    return;
                }
                lyricData = {
                    lyrics: parsed,
                    totalTime: parsed[parsed.length - 1].time + 5
                };

                var fileName = file.name;
                var nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

                buildLyricsDom(parsed);
                timeTotal.textContent = formatTime(lyricData.totalTime);
                statusText.textContent = 'Loaded: ' + file.name + ' (' + parsed.length + ' lines)';

                // Smooth transition
                showPlaybackView(nameWithoutExt);

                // Auto-play after transition
                setTimeout(function() {
                    startPlayback();
                }, 600);
            };
            reader.readAsText(file);
        }

        // ── Typewriter ──
        function clearTypewriterTimeouts() {
            typewriterTimeouts.forEach(function(t) { clearTimeout(t); });
            typewriterTimeouts = [];
        }

        function typewriteLine(lineEl, duration) {
            clearTypewriterTimeouts();
            var chars = lineEl.querySelectorAll('.char');
            if (chars.length === 0) return;
            var delay = Math.min(duration * 1000 / chars.length, 60);
            var totalChars = chars.length;
            chars.forEach(function(ch, i) {
                var tid = setTimeout(function() {
                    ch.classList.add('revealed');
                    // Update progress underline
                    var progress = ((i + 1) / totalChars) * 100;
                    lineEl.style.setProperty('--line-progress', progress);
                }, i * delay);
                typewriterTimeouts.push(tid);
            });
        }

        // ── Orb pulse on line change ──
        function pulseOrbs() {
            orbs.forEach(function(orb) {
                orb.classList.add('orb-pulse');
            });
            setTimeout(function() {
                orbs.forEach(function(orb) {
                    orb.classList.remove('orb-pulse');
                });
            }, 1000);
        }

        // ── Update display (focused view — only ~7 nearby lines) ──
        function updateLyricsDisplay() {
            if (!lyricData) return;
            var lyrics = lyricData.lyrics;
            var lines = lyricsContainer.querySelectorAll('.lyric-line');
            var activeIdx = -1;

            for (var i = lyrics.length - 1; i >= 0; i--) {
                if (virtualTime >= lyrics[i].time) {
                    activeIdx = i;
                    break;
                }
            }

            var lineChanged = (activeIdx !== currentDisplayIndex);
            if (lineChanged) {
                clearTypewriterTimeouts();
                currentDisplayIndex = activeIdx;

                // Fire particle burst from center of screen
                if (activeIdx >= 0) {
                    createBurst(burstCanvas.width / 2, burstCanvas.height * 0.42);
                    pulseOrbs();
                }
            }

            lines.forEach(function(line, i) {
                line.classList.remove('active', 'past', 'visible-line', 'near-1');
                line.style.setProperty('--line-progress', 0);
                line.querySelectorAll('.char').forEach(function(ch) { ch.classList.remove('revealed'); });

                var distance = Math.abs(i - activeIdx);

                // Only show 3 lines: previous, active, next
                if (distance > 1 && activeIdx >= 0) {
                    line.style.display = 'none';
                    return;
                }
                line.style.display = '';

                if (i === activeIdx) {
                    line.classList.add('active', 'visible-line');
                    if (lineChanged && isPlaying) {
                        var nextTime = (i + 1 < lyrics.length) ? lyrics[i + 1].time : lyrics[i].time + 3;
                        var lineDuration = nextTime - lyrics[i].time;
                        typewriteLine(line, lineDuration);
                    } else if (!isPlaying) {
                        line.querySelectorAll('.char').forEach(function(ch) { ch.classList.add('revealed'); });
                        line.style.setProperty('--line-progress', 100);
                    } else {
                        // Re-reveal already typed chars based on elapsed time
                        var elapsed = virtualTime - lyrics[i].time;
                        var nextT = (i + 1 < lyrics.length) ? lyrics[i + 1].time : lyrics[i].time + 3;
                        var dur = nextT - lyrics[i].time;
                        var chars = line.querySelectorAll('.char');
                        var revealCount = Math.min(chars.length, Math.floor(chars.length * elapsed / dur));
                        for (var c = 0; c < revealCount; c++) { chars[c].classList.add('revealed'); }
                        var progress = chars.length > 0 ? (revealCount / chars.length) * 100 : 0;
                        line.style.setProperty('--line-progress', progress);
                    }
                } else if (i < activeIdx) {
                    line.classList.add('past', 'visible-line', 'near-1');
                    line.querySelectorAll('.char').forEach(function(ch) { ch.classList.add('revealed'); });
                } else {
                    // Upcoming (next line)
                    line.classList.add('visible-line', 'near-1');
                }
            });

            // If no active line yet, show first 2 lines
            if (activeIdx < 0) {
                lines.forEach(function(line, i) {
                    if (i < 2) {
                        line.style.display = '';
                        line.classList.add('visible-line', 'near-1');
                    } else {
                        line.style.display = 'none';
                    }
                });
            }
        }

        function updateTimeDisplay() {
            if (!lyricData) return;
            timeCurrent.textContent = formatTime(virtualTime);
            var pct = Math.min(100, (virtualTime / lyricData.totalTime) * 100);
            progressFill.style.width = pct + '%';
        }

        // ── Animation loop (shared with particle burst) ──
        function animateLyrics(timestamp) {
            if (!lastFrameTime) lastFrameTime = timestamp;
            var delta = (timestamp - lastFrameTime) / 1000;
            lastFrameTime = timestamp;

            if (isPlaying) {
                virtualTime += delta;
                if (virtualTime >= lyricData.totalTime) {
                    virtualTime = lyricData.totalTime;
                    pausePlayback();
                    statusText.textContent = 'Complete! Hit New Song to try another.';
                }
            }

            updateLyricsDisplay();
            updateTimeDisplay();

            // Update and draw particle burst
            updateBurstParticles();
            drawBurstParticles();

            animFrameId = requestAnimationFrame(animateLyrics);
        }

        function startPlayback() {
            isPlaying = true;
            lastFrameTime = 0;
            playPauseBtn.innerHTML = '&#10074;&#10074; Pause';
            playPauseBtn.classList.remove('paused');
            animFrameId = requestAnimationFrame(animateLyrics);
        }

        function pausePlayback() {
            isPlaying = false;
            playPauseBtn.innerHTML = '&#9654; Play';
            playPauseBtn.classList.add('paused');
            clearTypewriterTimeouts();
        }

        function togglePlayback() {
            if (isPlaying) {
                pausePlayback();
            } else {
                lastFrameTime = 0;
                isPlaying = true;
                playPauseBtn.innerHTML = '&#10074;&#10074; Pause';
                playPauseBtn.classList.remove('paused');
                if (!animFrameId) {
                    animFrameId = requestAnimationFrame(animateLyrics);
                }
            }
        }

        function seekTo(fraction) {
            if (!lyricData) return;
            virtualTime = fraction * lyricData.totalTime;
            currentDisplayIndex = -1;
            clearTypewriterTimeouts();
            updateLyricsDisplay();
            updateTimeDisplay();
        }

        // ── Helpers ──
        function formatTime(sec) {
            var m = Math.floor(sec / 60);
            var s = Math.floor(sec % 60);
            return m + ':' + (s < 10 ? '0' : '') + s;
        }

        // ── UI handlers ──
        uploadBtn.addEventListener('click', function() { fileInput.click(); });
        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                parseAndAnimateLyrics(e.target.files[0]);
            }
        });

        // Drag-and-drop — without preventDefault the browser navigates to
        // the dropped file, dumping the user out of the site entirely.
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', function() {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer && e.dataTransfer.files.length) {
                parseAndAnimateLyrics(e.dataTransfer.files[0]);
            }
        });
        playPauseBtn.addEventListener('click', togglePlayback);
        newSongBtn.addEventListener('click', resetToUpload);
        resetBtn.addEventListener('click', resetToUpload);

        // Progress bar seek
        progressBar.addEventListener('mousedown', function(e) {
            isDragging = true;
            wasDragging = isPlaying;
            if (isPlaying) pausePlayback();
            var rect = progressBar.getBoundingClientRect();
            seekTo((e.clientX - rect.left) / rect.width);
        });
        document.addEventListener('mousemove', /* cleaned on unmount */ function(e) {
            if (!isDragging) return;
            var rect = progressBar.getBoundingClientRect();
            var frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seekTo(frac);
        }, { signal: signal });
        document.addEventListener('mouseup', /* cleaned on unmount */ function() {
            if (!isDragging) return;
            isDragging = false;
            if (wasDragging) {
                lastFrameTime = 0;
                isPlaying = true;
                playPauseBtn.innerHTML = '&#10074;&#10074; Pause';
                playPauseBtn.classList.remove('paused');
            }
        }, { signal: signal });

        // Touch support
        progressBar.addEventListener('touchstart', function(e) {
            isDragging = true;
            wasDragging = isPlaying;
            if (isPlaying) pausePlayback();
            var rect = progressBar.getBoundingClientRect();
            var touch = e.touches[0];
            seekTo((touch.clientX - rect.left) / rect.width);
        }, { passive: true });
        document.addEventListener('touchmove', /* cleaned on unmount */ function(e) {
            if (!isDragging) return;
            var rect = progressBar.getBoundingClientRect();
            var touch = e.touches[0];
            var frac = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
            seekTo(frac);
        }, { passive: true, signal: signal });
        document.addEventListener('touchend', /* cleaned on unmount */ function() {
            if (!isDragging) return;
            isDragging = false;
            if (wasDragging) {
                lastFrameTime = 0;
                isPlaying = true;
                playPauseBtn.innerHTML = '&#10074;&#10074; Pause';
                playPauseBtn.classList.remove('paused');
            }
        }, { signal: signal });

    
}
