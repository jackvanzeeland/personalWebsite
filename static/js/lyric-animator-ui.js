/**
 * UI Logic for Lyrics Animator
 * Handles file upload and playback controls
 */

(function() {
    'use strict';

    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const status = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    const lyricsContainer = document.getElementById('lyrics-container');

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            status.textContent = 'Parsing lyrics...';
            if (typeof parseAndAnimateLyrics === 'function') {
                parseAndAnimateLyrics(file);
                uploadBtn.style.display = 'none';
                resetBtn.style.display = 'inline-block';
            } else {
                status.textContent = 'Error: lyrics-animator.js failed to load.';
                alert('JS not loaded—check path to lyrics-animator.js!');
            }
        } else {
            status.textContent = 'Please select a valid LRC file.';
        }
    });

    resetBtn.addEventListener('click', () => {
        location.reload();
    });

    window.startTime = null; // Safety

})();
