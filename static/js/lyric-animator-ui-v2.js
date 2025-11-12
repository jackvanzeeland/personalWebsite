/**
 * UI Logic for Lyrics Animator V2
 * Handles file upload, playback controls, and v2-specific features
 */

(function() {
    'use strict';

    // Audio validation constants (Issue #9 fix)
    const VALID_AUDIO_TYPES = [
        'audio/mpeg',      // .mp3
        'audio/mp4',       // .m4a
        'audio/wav',       // .wav
        'audio/ogg',       // .ogg
        'audio/webm',      // .webm
        'audio/aac',       // .aac
        'audio/flac'       // .flac
    ];

    // Audio retry management (Issue #17 fix)
    let audioRetryCount = 0;
    const MAX_AUDIO_RETRIES = 3;

    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const status = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const lyricsContainer = document.getElementById('lyrics-container');
    const uploadArea = document.getElementById('upload-area');

    // V2 specific controls
    const animationPreset = document.getElementById('animation-preset');
    const layoutMode = document.getElementById('layout-mode');
    const backgroundStyle = document.getElementById('background-style');
    const audioUploadSection = document.getElementById('audio-upload-section');
    const audioFileInput = document.getElementById('audio-file');
    const v2ThemeColorPicker = document.getElementById('v2-theme-color-picker');

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        } else {
            status.textContent = 'Please select a valid LRC file.';
        }
    });

    // ===== Drag-and-Drop File Upload =====
    let dragCounter = 0; // Track nested drag events

    uploadArea.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter++;

        if (dragCounter === 1) {
            uploadArea.classList.add('drag-active');
        }
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if file is LRC
        const items = e.dataTransfer.items;
        let hasLrcFile = false;

        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file') {
                    const file = items[i].getAsFile();
                    if (file && file.name.toLowerCase().endsWith('.lrc')) {
                        hasLrcFile = true;
                        break;
                    }
                }
            }
        }

        // Show appropriate visual feedback
        uploadArea.classList.remove('drag-invalid');
        uploadArea.classList.add('drag-over');

        if (!hasLrcFile && e.dataTransfer.types.includes('Files')) {
            uploadArea.classList.add('drag-invalid');
            uploadArea.classList.remove('drag-over');
        }
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter = Math.max(0, dragCounter - 1);  // Prevent negative (Issue #19 fix)

        if (dragCounter === 0) {
            uploadArea.classList.remove('drag-active', 'drag-over', 'drag-invalid');
        }
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Reset drag state
        dragCounter = 0;
        uploadArea.classList.remove('drag-active', 'drag-over', 'drag-invalid');

        const files = e.dataTransfer.files;

        if (files.length === 0) {
            if (window.NotificationManager) {
                window.NotificationManager.show('No file dropped', 'warning', 3000);
            }
            return;
        }

        const file = files[0];

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.lrc')) {
            if (window.NotificationManager) {
                window.NotificationManager.show('Only .lrc files are supported', 'error', 5000);
            }

            // Brief invalid state animation
            uploadArea.classList.add('drag-invalid');
            setTimeout(() => {
                uploadArea.classList.remove('drag-invalid');
            }, 600);

            return;
        }

        // Process the file
        handleFileUpload(file);
    });

    // Reset drag counter on dragend (safety net) (Issue #19 fix)
    uploadArea.addEventListener('dragend', () => {
        dragCounter = 0;
        uploadArea.classList.remove('drag-active', 'drag-over', 'drag-invalid');
    });

    /**
     * Unified file upload handler for both drag-drop and button upload
     */
    function handleFileUpload(file) {
        status.textContent = 'Parsing lyrics...';

        if (window.parseAndAnimateLyrics && typeof window.parseAndAnimateLyrics === 'function') {
            window.parseAndAnimateLyrics(file);
            window.LyricAnimatorState.setLrcLoaded(true);
            uploadBtn.style.display = 'none';
            resetBtn.style.display = 'inline-block';

            // Show success notification
            if (window.NotificationManager) {
                window.NotificationManager.show(
                    `File uploaded: ${file.name}`,
                    'success',
                    4000
                );
            }
        } else {
            status.textContent = 'Error: lyrics-animator-v2.js failed to load.';
            alert('JS not loaded—check path to lyrics-animator-v2.js!');
        }
    }

    resetBtn.addEventListener('click', () => {
        // Issue #43 fix: Clear localStorage before reset
        localStorage.removeItem('lyricAnimatorVersion');
        localStorage.removeItem('debug');
        // Issue #47 fix: Clear layout mode from localStorage
        localStorage.removeItem('layoutMode');
        // Issue #44 fix: Reset audio file input
        if (audioFileInput) {
            audioFileInput.value = '';
        }
        location.reload();
    });

    // Animation preset selector with instant preview
    if (animationPreset) {
        animationPreset.addEventListener('change', (e) => {
            window.currentAnimation = e.target.value;

            // Instant preview on current lyric line
            if (window.currentDisplayIndex >= 0) {
                const container = document.getElementById('lyrics-container');
                const lines = container.querySelectorAll('.karaoke-line');
                const currentLine = lines[window.currentDisplayIndex];

                if (currentLine) {
                    const chars = currentLine.querySelectorAll('.karaoke-char');

                    // Clear existing animations
                    if (typeof clearTypewriterTimeouts === 'function') {
                        clearTypewriterTimeouts();
                    }

                    // Complete reset of all animation artifacts
                    chars.forEach(char => {
                        char.classList.remove('visible', 'animated');
                        // Remove ALL inline styles to prevent state corruption
                        char.removeAttribute('style');
                    });

                    // Force reflow to ensure clean slate
                    void currentLine.offsetWidth;

                    // Apply new animation after brief delay
                    setTimeout(() => {
                        if (window.LyricsAnimations && window.LyricsAnimations[window.currentAnimation]) {
                            window.LyricsAnimations[window.currentAnimation](chars, false);
                        }
                    }, 50);
                }
            }

            // Show notification
            const animationName = e.target.options[e.target.selectedIndex].text;
            if (window.NotificationManager) {
                window.NotificationManager.show(
                    `Animation changed to: ${animationName}`,
                    'info',
                    3000
                );
            }

            console.log('Animation changed to:', window.currentAnimation);
        });
    }

    // Layout mode selector
    if (layoutMode) {
        layoutMode.addEventListener('change', (e) => {
            const newLayout = e.target.value;
            const oldLayout = window.currentLayout;
            window.currentLayout = newLayout;
            console.log('Layout changed from', oldLayout, 'to:', newLayout);

            // Reset container styles (Issue #16 fix)
            const container = document.getElementById('lyrics-container');
            if (container) {
                // Reset ALL layout-specific styles
                container.style.cssText = '';

                // Also reset all line styles
                const allLines = container.querySelectorAll('.karaoke-line');
                allLines.forEach(line => {
                    line.style.cssText = '';
                    // Preserve data attributes
                    const time = line.dataset.time;
                    const text = line.dataset.text;
                    if (time) line.dataset.time = time;
                    if (text) line.dataset.text = text;
                });
            }

            // Show notification
            const layoutName = e.target.options[e.target.selectedIndex].text;
            if (window.NotificationManager) {
                window.NotificationManager.show(
                    `Layout changed to: ${layoutName}`,
                    'info',
                    3000
                );
            }

            // Re-render with new layout if lyrics are loaded
            if (window.currentDisplayIndex >= 0 && typeof updateLyricsDisplay === 'function') {
                // Force re-render by temporarily clearing display index
                const tempIndex = window.currentDisplayIndex;
                window.currentDisplayIndex = -1;
                window.currentDisplayIndex = tempIndex;
                // Get lyric data from DOM
                const lines = container.querySelectorAll('.karaoke-line');
                const lyricData = Array.from(lines).map(line => ({
                    time: parseFloat(line.dataset.time),
                    text: line.textContent
                }));
                updateLyricsDisplay(lyricData);
            }
        });
    }

    // Background style selector
    if (backgroundStyle) {
        backgroundStyle.addEventListener('change', (e) => {
            const selectedBg = e.target.value;
            console.log('Background changed to:', selectedBg);

            // Show notification
            const backgroundName = e.target.options[e.target.selectedIndex].text;
            if (window.NotificationManager) {
                window.NotificationManager.show(
                    `Background changed to: ${backgroundName}`,
                    'info',
                    3000
                );
            }

            // Hide all background-specific controls
            document.querySelectorAll('.background-controls').forEach(control => {
                control.style.display = 'none';
            });

            // Show controls for selected background (Issue #25 fix)
            const bgControls = document.getElementById(`${selectedBg}-controls`);
            if (bgControls) {
                bgControls.style.display = 'block';
            } else {
                console.warn(`No controls found for background: ${selectedBg}`);

                // Show message to user
                const controlsContainer = document.getElementById('background-controls-container');
                if (controlsContainer) {
                    const noControlsMsg = document.createElement('div');
                    noControlsMsg.className = 'info-message';
                    noControlsMsg.textContent = 'ℹ️ No customization options available for this background';
                    noControlsMsg.style.padding = '1rem';
                    noControlsMsg.style.textAlign = 'center';
                    noControlsMsg.style.color = 'var(--text-secondary, #888)';

                    controlsContainer.innerHTML = '';
                    controlsContainer.appendChild(noControlsMsg);
                }
            }

            // Load the selected background
            if (window.BackgroundManager) {
                window.BackgroundManager.load(selectedBg);
            }
            window.LyricAnimatorState.setBackgroundStyle(selectedBg);
        });

        // Initialize: show controls for the default/saved background
        const savedBg = localStorage.getItem('lyricAnimatorV2Background') || 'bg1';
        const initialControls = document.getElementById(`${savedBg}-controls`);
        if (initialControls) {
            initialControls.style.display = 'block';
        }
    }

    // Audio file input for audio-reactive visualizer
    if (audioFileInput) {
        audioFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate MIME type (Issue #9 fix)
            if (!VALID_AUDIO_TYPES.includes(file.type)) {
                console.error(`Invalid audio file type: ${file.type}`);

                if (window.NotificationManager) {
                    window.NotificationManager.showError('invalidAudioType', {
                        type: file.type,
                        validTypes: 'MP3, WAV, OGG, M4A, AAC, FLAC, WebM'
                    });
                }

                // Reset input
                audioFileInput.value = '';
                return;
            }

            // Valid audio file
            const audioElement = new Audio(URL.createObjectURL(file));
            if (window.BackgroundManager) {
                window.BackgroundManager.setAudio(audioElement);
            }
            window.LyricAnimatorState.setAudioLoaded(true);
            console.log('Audio file loaded:', file.name);
        });
    }

    // V2 theme color picker integration with BackgroundManager
    if (v2ThemeColorPicker) {
        v2ThemeColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            if (window.BackgroundManager) {
                window.BackgroundManager.updateTheme(color);
            }

            // Show notification (debounced to avoid spam)
            if (window.NotificationManager) {
                clearTimeout(v2ThemeColorPicker._notificationTimeout);
                v2ThemeColorPicker._notificationTimeout = setTimeout(() => {
                    window.NotificationManager.show(
                        `Theme color updated to ${color}`,
                        'info',
                        2000
                    );
                }, 500); // Wait 500ms after user stops adjusting color
            }

            console.log('V2 theme color changed to:', color);
        });
    }

    // ===== BG1: Mesh Gradient Customizations =====
    const bg1AnimSpeed = document.getElementById('bg1-animation-speed');
    const bg1NoiseScale = document.getElementById('bg1-noise-scale');
    const bg1ColorCount = document.getElementById('bg1-color-count');

    if (bg1AnimSpeed) {
        bg1AnimSpeed.addEventListener('input', (e) => {
            if (window.BackgroundBG1 && window.BackgroundBG1.setAnimationSpeed) {
                window.BackgroundBG1.setAnimationSpeed(parseFloat(e.target.value));
            }
        });
    }

    if (bg1NoiseScale) {
        bg1NoiseScale.addEventListener('input', (e) => {
            if (window.BackgroundBG1 && window.BackgroundBG1.setNoiseScale) {
                window.BackgroundBG1.setNoiseScale(parseFloat(e.target.value));
            }
        });
    }

    if (bg1ColorCount) {
        bg1ColorCount.addEventListener('change', (e) => {
            if (window.BackgroundBG1 && window.BackgroundBG1.setColorCount) {
                window.BackgroundBG1.setColorCount(parseInt(e.target.value));
            }
        });
    }

    // ===== BG2: CSS Gradient Customizations =====
    const bg2GradientStyle = document.getElementById('bg2-gradient-style');
    const bg2AnimSpeed = document.getElementById('bg2-animation-speed');
    const bg2ColorStops = document.getElementById('bg2-color-stops');

    if (bg2GradientStyle) {
        bg2GradientStyle.addEventListener('change', (e) => {
            if (window.BackgroundBG2 && window.BackgroundBG2.setGradientStyle) {
                window.BackgroundBG2.setGradientStyle(e.target.value);
            }
        });
    }

    if (bg2AnimSpeed) {
        bg2AnimSpeed.addEventListener('input', (e) => {
            if (window.BackgroundBG2 && window.BackgroundBG2.setAnimationSpeed) {
                window.BackgroundBG2.setAnimationSpeed(parseFloat(e.target.value));
            }
        });
    }

    if (bg2ColorStops) {
        bg2ColorStops.addEventListener('input', (e) => {
            if (window.BackgroundBG2 && window.BackgroundBG2.setColorStops) {
                window.BackgroundBG2.setColorStops(parseInt(e.target.value));
            }
        });
    }

    // ===== BG3: Audio Visualizer Customizations =====
    const bg3VisualizerStyle = document.getElementById('bg3-visualizer-style');
    const bg3Sensitivity = document.getElementById('bg3-sensitivity');
    const bg3BarCount = document.getElementById('bg3-bar-count');

    if (bg3VisualizerStyle) {
        bg3VisualizerStyle.addEventListener('change', (e) => {
            if (window.BackgroundBG3 && window.BackgroundBG3.setStyle) {
                window.BackgroundBG3.setStyle(e.target.value);
            }
        });
    }

    if (bg3Sensitivity) {
        bg3Sensitivity.addEventListener('input', (e) => {
            if (window.BackgroundBG3 && window.BackgroundBG3.setSensitivity) {
                window.BackgroundBG3.setSensitivity(parseFloat(e.target.value));
            }
        });
    }

    if (bg3BarCount) {
        bg3BarCount.addEventListener('input', (e) => {
            if (window.BackgroundBG3 && window.BackgroundBG3.setBarCount) {
                window.BackgroundBG3.setBarCount(parseInt(e.target.value));
            }
        });
    }

    // ===== BG4: 3D Particles Customizations =====
    const bg4ParticleCount = document.getElementById('bg4-particle-count');
    const bg4ParticleSize = document.getElementById('bg4-particle-size');
    const bg4RotationSpeed = document.getElementById('bg4-rotation-speed');
    const bg4CameraSpeed = document.getElementById('bg4-camera-speed');
    const bg4FogDensity = document.getElementById('bg4-fog-density');

    if (bg4ParticleCount) {
        bg4ParticleCount.addEventListener('input', (e) => {
            if (window.BackgroundBG4 && window.BackgroundBG4.setParticleCount) {
                window.BackgroundBG4.setParticleCount(parseInt(e.target.value));
            }
        });
    }

    if (bg4ParticleSize) {
        bg4ParticleSize.addEventListener('input', (e) => {
            if (window.BackgroundBG4 && window.BackgroundBG4.setParticleSize) {
                window.BackgroundBG4.setParticleSize(parseFloat(e.target.value));
            }
        });
    }

    if (bg4RotationSpeed) {
        bg4RotationSpeed.addEventListener('input', (e) => {
            if (window.BackgroundBG4 && window.BackgroundBG4.setRotationSpeed) {
                window.BackgroundBG4.setRotationSpeed(parseFloat(e.target.value));
            }
        });
    }

    if (bg4CameraSpeed) {
        bg4CameraSpeed.addEventListener('input', (e) => {
            if (window.BackgroundBG4 && window.BackgroundBG4.setCameraSpeed) {
                window.BackgroundBG4.setCameraSpeed(parseFloat(e.target.value));
            }
        });
    }

    if (bg4FogDensity) {
        bg4FogDensity.addEventListener('input', (e) => {
            if (window.BackgroundBG4 && window.BackgroundBG4.setFogDensity) {
                window.BackgroundBG4.setFogDensity(parseFloat(e.target.value));
            }
        });
    }

    // ===== BG5: Hybrid Effects Customizations =====
    const bg5BlobCount = document.getElementById('bg5-blob-count');
    const bg5BlobSize = document.getElementById('bg5-blob-size');
    const bg5RayCount = document.getElementById('bg5-ray-count');
    const bg5MovementSpeed = document.getElementById('bg5-movement-speed');

    if (bg5BlobCount) {
        bg5BlobCount.addEventListener('input', (e) => {
            if (window.BackgroundBG5 && window.BackgroundBG5.setBlobCount) {
                window.BackgroundBG5.setBlobCount(parseInt(e.target.value));
            }
        });
    }

    if (bg5BlobSize) {
        bg5BlobSize.addEventListener('input', (e) => {
            if (window.BackgroundBG5 && window.BackgroundBG5.setBlobSize) {
                window.BackgroundBG5.setBlobSize(parseFloat(e.target.value));
            }
        });
    }

    if (bg5RayCount) {
        bg5RayCount.addEventListener('input', (e) => {
            if (window.BackgroundBG5 && window.BackgroundBG5.setRayCount) {
                window.BackgroundBG5.setRayCount(parseInt(e.target.value));
            }
        });
    }

    if (bg5MovementSpeed) {
        bg5MovementSpeed.addEventListener('input', (e) => {
            if (window.BackgroundBG5 && window.BackgroundBG5.setMovementSpeed) {
                window.BackgroundBG5.setMovementSpeed(parseFloat(e.target.value));
            }
        });
    }

    window.startTime = null; // Safety

    // ===== Tabbed Interface for V2 Controls =====
    (function initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');

        if (tabButtons.length === 0) return; // Not on v2

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                const targetPanel = document.getElementById(`${targetTab}-panel`);

                // Deactivate all tabs and panels
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                tabPanels.forEach(panel => {
                    panel.classList.remove('active');
                    panel.style.display = 'none';
                });

                // Activate clicked tab and its panel
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                targetPanel.classList.add('active');
                targetPanel.style.display = 'block';

                console.log('Switched to tab:', targetTab);
            });
        });

        // Sync duplicate controls between Essentials and other panels
        const syncControls = [
            { essentials: 'animation-preset', detail: 'animation-preset-detail' },
            { essentials: 'layout-mode', detail: 'layout-mode-detail' },
            { essentials: 'background-style', detail: 'background-style-detail' }
        ];

        syncControls.forEach(({ essentials, detail }) => {
            const essentialsControl = document.getElementById(essentials);
            const detailControl = document.getElementById(detail);

            if (essentialsControl && detailControl) {
                let isSyncing = false;  // Flag to prevent recursive triggers

                // Sync from essentials to detail
                essentialsControl.addEventListener('change', (e) => {
                    if (isSyncing) return;  // Prevent recursion

                    isSyncing = true;
                    detailControl.value = e.target.value;
                    detailControl.dispatchEvent(new Event('change'));
                    isSyncing = false;
                });

                // Sync from detail to essentials
                detailControl.addEventListener('change', (e) => {
                    if (isSyncing) return;  // Prevent recursion

                    isSyncing = true;
                    essentialsControl.value = e.target.value;
                    essentialsControl.dispatchEvent(new Event('change'));
                    isSyncing = false;
                });
            }
        });

        console.log('V2 tabbed interface initialized');
    })();

    // Animation preset detail selector (in Animation tab) - same instant preview
    const animationPresetDetail = document.getElementById('animation-preset-detail');
    if (animationPresetDetail) {
        animationPresetDetail.addEventListener('change', (e) => {
            window.currentAnimation = e.target.value;

            // Instant preview on current lyric line
            if (window.currentDisplayIndex >= 0) {
                const container = document.getElementById('lyrics-container');
                const lines = container.querySelectorAll('.karaoke-line');
                const currentLine = lines[window.currentDisplayIndex];

                if (currentLine) {
                    const chars = currentLine.querySelectorAll('.karaoke-char');

                    // Clear existing animations
                    if (typeof clearTypewriterTimeouts === 'function') {
                        clearTypewriterTimeouts();
                    }

                    // Complete reset of all animation artifacts
                    chars.forEach(char => {
                        char.classList.remove('visible', 'animated');
                        // Remove ALL inline styles to prevent state corruption
                        char.removeAttribute('style');
                    });

                    // Force reflow to ensure clean slate
                    void currentLine.offsetWidth;

                    // Apply new animation after brief delay
                    setTimeout(() => {
                        if (window.LyricsAnimations && window.LyricsAnimations[window.currentAnimation]) {
                            window.LyricsAnimations[window.currentAnimation](chars, false);
                        }
                    }, 50);
                }
            }

            // Show notification
            const animationName = e.target.options[e.target.selectedIndex].text;
            if (window.NotificationManager) {
                window.NotificationManager.show(
                    `Animation changed to: ${animationName}`,
                    'info',
                    3000
                );
            }

            console.log('Animation changed to:', window.currentAnimation);
        });
    }

    // ===== ARIA Label Updates for Range Sliders =====
    /**
     * Initialize ARIA updates for all range sliders
     */
    function initializeSliderAriaUpdates() {
        // List of all slider IDs
        const sliderIds = [
            'particle-count', 'particle-size', 'particle-speed',
            'bg1-animation-speed', 'bg1-noise-scale',
            'bg2-animation-speed', 'bg2-color-stops',
            'bg3-sensitivity', 'bg3-bar-count',
            'bg4-particle-count', 'bg4-particle-size', 'bg4-rotation-speed', 'bg4-camera-speed', 'bg4-fog-density',
            'bg5-blob-count', 'bg5-blob-size', 'bg5-ray-count', 'bg5-movement-speed'
        ];

        sliderIds.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(`${sliderId}-value`);

            if (slider && valueDisplay) {
                slider.addEventListener('input', (e) => {
                    const value = e.target.value;

                    // Update ARIA attributes
                    e.target.setAttribute('aria-valuenow', value);

                    // Generate appropriate valuetext based on slider type
                    let valueText = value;
                    if (sliderId.includes('count')) {
                        if (sliderId === 'particle-count') valueText = `${value} particles`;
                        else if (sliderId === 'bg3-bar-count') valueText = `${value} bars`;
                        else if (sliderId === 'bg4-particle-count') valueText = `${value} particles`;
                        else if (sliderId === 'bg5-blob-count') valueText = `${value} blobs`;
                        else if (sliderId === 'bg1-color-count') valueText = `${value} colors`;
                    } else if (sliderId.includes('size')) {
                        if (sliderId === 'particle-size') valueText = `${value} pixels`;
                        else valueText = `Size ${value}`;
                    } else if (sliderId.includes('speed')) {
                        valueText = `Speed ${value}`;
                    } else if (sliderId.includes('scale')) {
                        valueText = `Scale ${value}`;
                    } else if (sliderId.includes('sensitivity')) {
                        valueText = `Sensitivity ${value}`;
                    } else if (sliderId === 'bg2-color-stops') {
                        valueText = `${value} stops`;
                    } else if (sliderId === 'bg4-fog-density') {
                        valueText = `Density ${value}`;
                    } else if (sliderId === 'bg5-ray-count') {
                        valueText = `${value} rays`;
                    }

                    e.target.setAttribute('aria-valuetext', valueText);

                    // Update visible value display
                    valueDisplay.textContent = value;
                });
            }
        });
    }

    // Initialize ARIA updates on page load
    initializeSliderAriaUpdates();

    // ===== YouTube Download Handler with Progress =====
    const youtubeVideoIdInput = document.getElementById('youtube-video-id');
    const youtubeDownloadBtn = document.getElementById('youtube-download-btn');
    const youtubeStatus = document.getElementById('youtube-status');
    const youtubeProgress = document.getElementById('youtube-progress');
    const youtubeProgressFill = document.getElementById('youtube-progress-fill');
    const youtubeProgressText = document.getElementById('youtube-progress-text');
    const progressPercent = document.getElementById('progress-percent');
    const cancelDownloadBtn = document.getElementById('cancel-download-btn');

    let currentDownloadController = null;

    if (youtubeDownloadBtn && youtubeVideoIdInput) {
        youtubeDownloadBtn.addEventListener('click', async () => {
            const videoId = youtubeVideoIdInput.value.trim();

            if (!videoId) {
                if (window.NotificationManager) {
                    window.NotificationManager.showError('invalidVideoId');
                }
                return;
            }

            // Validate format (11 characters)
            // Accept 10-13 character IDs to cover edge cases (Issue #29 fix)
            const youtubeIdPattern = /^[a-zA-Z0-9_-]{10,13}$/;
            if (!youtubeIdPattern.test(videoId)) {
                if (window.NotificationManager) {
                    window.NotificationManager.showError('invalidVideoId', {
                        providedId: videoId,
                        expectedFormat: '10-13 alphanumeric characters, hyphens, and underscores'
                    });
                }
                return;
            }

            // Setup UI for download
            youtubeDownloadBtn.disabled = true;
            youtubeDownloadBtn.classList.add('loading');
            youtubeStatus.textContent = '';
            youtubeProgress.style.display = 'block';

            // Create abort controller for cancellation
            currentDownloadController = new AbortController();

            // Use indeterminate progress (Issue #11 fix - no fake progress)
            youtubeProgressFill.style.width = '100%';
            youtubeProgressFill.classList.add('indeterminate');
            progressPercent.textContent = '';
            youtubeStatus.textContent = 'Downloading audio... (this may take 30-60 seconds)';
            youtubeStatus.style.color = '';

            try {
                // Call backend API
                const response = await fetch('/api/download-youtube-audio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ video_id: videoId }),
                    signal: currentDownloadController.signal
                });

                // Remove indeterminate progress (Issue #11 fix)
                youtubeProgressFill.classList.remove('indeterminate');

                const result = await response.json();

                if (result.success) {
                    // Complete progress bar
                    youtubeProgressFill.style.width = '100%';
                    progressPercent.textContent = '100%';
                    youtubeProgressText.textContent = 'Download complete! Loading audio...';

                    youtubeStatus.textContent = 'Audio file downloaded successfully';
                    youtubeStatus.style.color = '#4caf50';

                    // Hide progress after 1 second
                    setTimeout(() => {
                        youtubeProgress.style.display = 'none';
                    }, 1000);

                    // Load the downloaded audio file
                    const audioElement = new Audio(result.file_url);

                    // Set audio when loaded
                    audioElement.addEventListener('canplaythrough', () => {
                        if (window.BackgroundManager) {
                            window.BackgroundManager.setAudio(audioElement);
                            window.LyricAnimatorState.setAudioLoaded(true);
                        }

                        youtubeStatus.textContent = 'Audio loaded and ready to play!';

                        // Store file path for cleanup later
                        window.tempAudioFilePath = result.file_path;
                    });

                    audioElement.addEventListener('error', (e) => {
                        const error = e.target.error;
                        let errorMessage = 'Unknown error loading audio';

                        // Decode error type (Issue #17 fix)
                        if (error) {
                            switch (error.code) {
                                case error.MEDIA_ERR_ABORTED:
                                    errorMessage = 'Audio loading was aborted';
                                    break;
                                case error.MEDIA_ERR_NETWORK:
                                    errorMessage = 'Network error loading audio';
                                    break;
                                case error.MEDIA_ERR_DECODE:
                                    errorMessage = 'Audio file is corrupted or unsupported format';
                                    break;
                                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                    errorMessage = 'Audio format not supported by your browser';
                                    break;
                            }
                        }

                        console.error('Audio load error:', errorMessage, error);

                        // Try retry for network errors
                        if (error && error.code === error.MEDIA_ERR_NETWORK && audioRetryCount < MAX_AUDIO_RETRIES) {
                            audioRetryCount++;
                            youtubeStatus.textContent = `Network error. Retrying (${audioRetryCount}/${MAX_AUDIO_RETRIES})...`;
                            youtubeStatus.style.color = '#ffa500';

                            setTimeout(() => {
                                audioElement.load();
                            }, 2000);
                            return;
                        }

                        // Show error
                        youtubeStatus.textContent = errorMessage;
                        youtubeStatus.style.color = '#ff6b6b';
                        youtubeProgress.style.display = 'none';

                        // Reset retry count
                        audioRetryCount = 0;

                        // Notify user
                        if (window.NotificationManager) {
                            window.NotificationManager.showError('audioLoadError', {
                                message: errorMessage
                            });
                        }
                    });

                } else {
                    youtubeProgressFill.style.width = '0%';
                    youtubeProgress.style.display = 'none';

                    // Show appropriate error notification
                    if (window.NotificationManager) {
                        const errorKey = result.message && result.message.includes('not found') ? 'videoNotFound' : 'downloadFailed';
                        window.NotificationManager.showError(errorKey);
                    }

                    youtubeStatus.textContent = result.message || 'Download failed';
                    youtubeStatus.style.color = '#ff6b6b';
                }
            } catch (error) {
                // Remove indeterminate progress (Issue #11 fix)
                youtubeProgressFill.classList.remove('indeterminate');

                if (error.name === 'AbortError') {
                    youtubeStatus.textContent = 'Download cancelled';
                    youtubeStatus.style.color = '#ff8e53';
                } else {
                    console.error('YouTube download error:', error);

                    // Show error notification
                    if (window.NotificationManager) {
                        window.NotificationManager.showError('downloadFailed');
                    }

                    youtubeStatus.textContent = 'Network error. Please try again.';
                    youtubeStatus.style.color = '#ff6b6b';
                }

                youtubeProgress.style.display = 'none';
            } finally {
                // Re-enable button
                youtubeDownloadBtn.disabled = false;
                youtubeDownloadBtn.classList.remove('loading');
                currentDownloadController = null;
            }
        });

        // Cancel button handler
        if (cancelDownloadBtn) {
            cancelDownloadBtn.addEventListener('click', () => {
                if (currentDownloadController) {
                    currentDownloadController.abort();
                    youtubeProgressText.textContent = 'Cancelling download...';
                }
            });
        }
    }

    // Cleanup temporary audio file when page unloads
    window.addEventListener('beforeunload', () => {
        if (window.tempAudioFilePath) {
            const data = JSON.stringify({ file_path: window.tempAudioFilePath });

            // Try sendBeacon first (most reliable for page unload)
            if (navigator.sendBeacon) {
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon('/api/cleanup-audio', blob);
            } else {
                // Fallback to keepalive fetch for older browsers
                fetch('/api/cleanup-audio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: data,
                    keepalive: true
                }).catch(() => {
                    console.warn('Cleanup request failed - server cleanup will handle it');
                });
            }
        }
    });

    // Also cleanup when user switches away from tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && window.tempAudioFilePath) {
            const data = JSON.stringify({ file_path: window.tempAudioFilePath });
            if (navigator.sendBeacon) {
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon('/api/cleanup-audio', blob);
            }
        }
    });

    // ===== Initialize ARIA attributes for all sliders (Issue #15 fix) =====
    function initializeSliderAriaUpdates() {
        const sliderIds = [
            'particle-count', 'particle-size', 'particle-speed',
            'particle-opacity', 'particle-line-opacity',
            'h-slider', 's-slider', 'l-slider',
            'v2-particle-count', 'v2-particle-size', 'v2-particle-speed'
        ];

        sliderIds.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            if (!slider) return;  // Slider doesn't exist, skip

            const valueDisplay = document.getElementById(`${sliderId}-value`);

            // Update ARIA on input
            slider.addEventListener('input', (e) => {
                const value = e.target.value;

                // Always update ARIA attributes
                slider.setAttribute('aria-valuenow', value);

                // Format value text for screen readers
                let valueText = value;

                // Special formatting for specific sliders
                if (sliderId.includes('opacity')) {
                    valueText = `${(parseFloat(value) * 100).toFixed(0)}%`;
                } else if (sliderId === 'h-slider') {
                    valueText = `${value} degrees`;
                } else if (sliderId === 's-slider' || sliderId === 'l-slider') {
                    valueText = `${value}%`;
                }

                slider.setAttribute('aria-valuetext', valueText);

                // Update value display if it exists
                if (valueDisplay) {
                    valueDisplay.textContent = valueText;
                }
            });

            // Set initial ARIA values
            slider.setAttribute('aria-valuenow', slider.value);
            slider.setAttribute('aria-valuemin', slider.min || '0');
            slider.setAttribute('aria-valuemax', slider.max || '100');

            // Ensure slider has label
            if (!slider.getAttribute('aria-label') && !slider.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${sliderId}"]`);
                if (label) {
                    slider.setAttribute('aria-labelledby', label.id || `${sliderId}-label`);
                    if (!label.id) label.id = `${sliderId}-label`;
                } else {
                    // Fallback: generate label from ID
                    const labelText = sliderId
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                    slider.setAttribute('aria-label', labelText);
                }
            }
        });
    }

    // Initialize ARIA on page load
    initializeSliderAriaUpdates();

    console.log('lyric-animator-ui-v2.js loaded successfully!');
})();
