"""
Script to clean up old log files
Run manually or set up as cron job
"""
import os
from datetime import datetime, timedelta
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

def cleanup_old_logs(days_to_keep=30):
    """
    Remove log files older than specified days
    """
    logs_dir = Config.LOGS_DIR
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)

    removed_count = 0
    removed_size = 0

    print(f"Cleaning up logs older than {days_to_keep} days...")
    print(f"Cutoff date: {cutoff_date.strftime('%Y-%m-%d')}")

    for filename in os.listdir(logs_dir):
        filepath = os.path.join(logs_dir, filename)

        # Only process .log files
        if not filename.endswith('.log'):
            continue

        # Skip current app.log
        if filename == 'app.log':
            continue

        # Check file modification time
        file_mtime = datetime.fromtimestamp(os.path.getmtime(filepath))

        if file_mtime < cutoff_date:
            file_size = os.path.getsize(filepath)
            os.remove(filepath)
            removed_count += 1
            removed_size += file_size
            print(f"Removed: {filename} ({file_size} bytes)")

    print(f"\nTotal removed: {removed_count} files ({removed_size / 1024:.2f} KB)")

if __name__ == '__main__':
    cleanup_old_logs()
