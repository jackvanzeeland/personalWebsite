"""
YouTube Audio Downloader Utility
Handles YouTube MP3 downloads using yt-dlp
"""

import os
import re
import subprocess
import time
from pathlib import Path
from typing import Tuple, Optional
from datetime import datetime, timedelta


class YouTubeDownloader:
    """Manages YouTube audio downloads with security and cleanup"""

    # YouTube video ID regex (11 characters, alphanumeric + _ and -)
    YOUTUBE_ID_PATTERN = re.compile(r'^[a-zA-Z0-9_-]{11}$')

    # Temporary download directory
    DOWNLOAD_DIR = Path('data/temp_audio')

    # Maximum file age before cleanup (15 minutes - aggressive cleanup)
    MAX_FILE_AGE = timedelta(minutes=15)

    # Maximum file size (50MB)
    MAX_FILE_SIZE = 50 * 1024 * 1024

    @classmethod
    def validate_youtube_id(cls, video_id: str) -> bool:
        """
        Validate YouTube video ID format

        Args:
            video_id: YouTube video ID to validate

        Returns:
            True if valid, False otherwise
        """
        if not video_id or len(video_id) != 11:
            return False
        return bool(cls.YOUTUBE_ID_PATTERN.match(video_id))

    @classmethod
    def download_audio(cls, video_id: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Download audio from YouTube video

        Args:
            video_id: YouTube video ID

        Returns:
            Tuple of (success, file_path, error_message)
        """
        # Validate video ID
        if not cls.validate_youtube_id(video_id):
            return False, None, "Invalid YouTube video ID format"

        # Ensure download directory exists
        cls.DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

        # Output filename with timestamp to avoid collisions
        timestamp = int(time.time())
        output_template = str(cls.DOWNLOAD_DIR / f"{video_id}_{timestamp}.%(ext)s")

        # YouTube URL
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"

        # yt-dlp command
        command = [
            'yt-dlp',
            '-x',  # Extract audio
            '--audio-format', 'mp3',
            '-o', output_template,
            '--no-playlist',  # Don't download playlists
            '--max-filesize', '50M',  # Limit file size
            youtube_url
        ]

        try:
            # Run yt-dlp
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )

            if result.returncode != 0:
                return False, None, f"Download failed: {result.stderr}"

            # Find the downloaded file
            downloaded_file = cls.DOWNLOAD_DIR / f"{video_id}_{timestamp}.mp3"

            if not downloaded_file.exists():
                return False, None, "Downloaded file not found"

            # Check file size
            if downloaded_file.stat().st_size > cls.MAX_FILE_SIZE:
                downloaded_file.unlink()  # Delete oversized file
                return False, None, "File too large (max 50MB)"

            return True, str(downloaded_file), None

        except subprocess.TimeoutExpired:
            return False, None, "Download timed out (max 2 minutes)"
        except Exception as e:
            return False, None, f"Unexpected error: {str(e)}"

    @classmethod
    def cleanup_old_files(cls) -> int:
        """
        Delete old temporary audio files

        Returns:
            Number of files deleted
        """
        if not cls.DOWNLOAD_DIR.exists():
            return 0

        deleted = 0
        current_time = datetime.now()

        for file_path in cls.DOWNLOAD_DIR.glob('*.mp3'):
            # Get file modification time
            file_mtime = datetime.fromtimestamp(file_path.stat().st_mtime)

            # Delete if older than MAX_FILE_AGE
            if current_time - file_mtime > cls.MAX_FILE_AGE:
                try:
                    file_path.unlink()
                    deleted += 1
                    print(f"Deleted old file: {file_path.name}")
                except Exception as e:
                    print(f"Error deleting {file_path.name}: {e}")

        return deleted

    @classmethod
    def cleanup_file(cls, file_path: str) -> bool:
        """
        Delete a specific file

        Args:
            file_path: Path to file to delete

        Returns:
            True if deleted, False otherwise
        """
        try:
            path = Path(file_path)
            if path.exists() and path.parent == cls.DOWNLOAD_DIR:
                path.unlink()
                return True
        except Exception as e:
            print(f"Error deleting file: {e}")
        return False
