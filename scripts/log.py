"""
Production-grade logging with rotation and levels
"""
import logging
import os
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime
import sys

# Add parent directory to path for config import
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import Config

def setup_logger(name='app'):
    """
    Setup production-ready logger with file rotation

    Features:
    - Daily log rotation
    - Keeps last 30 days of logs
    - Configurable log level via environment variable
    - Both file and console output
    """
    logger = logging.getLogger(name)

    # Prevent duplicate handlers if called multiple times
    if logger.handlers:
        return logger

    logger.setLevel(getattr(logging, Config.LOG_LEVEL, logging.INFO))

    # Ensure logs directory exists
    os.makedirs(Config.LOGS_DIR, exist_ok=True)

    # File handler with daily rotation (keep 30 days)
    log_file = os.path.join(Config.LOGS_DIR, 'app.log')
    file_handler = TimedRotatingFileHandler(
        log_file,
        when='midnight',
        interval=1,
        backupCount=30,
        encoding='utf-8'
    )
    file_handler.suffix = '%Y-%m-%d'
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    ))

    # Console handler (for development/debugging)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(
        '%(levelname)s - %(message)s'
    ))

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger

# Initialize default logger
_default_logger = setup_logger()

def log_text(message):
    """
    Backward-compatible wrapper for existing code
    Logs at INFO level
    """
    _default_logger.info(message)

def log_error(message):
    """Log error message"""
    _default_logger.error(message)

def log_warning(message):
    """Log warning message"""
    _default_logger.warning(message)

def log_debug(message):
    """Log debug message"""
    _default_logger.debug(message)
