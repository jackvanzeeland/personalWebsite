"""
Centralized configuration for the personal website.
All environment variables and paths defined here.
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Main configuration class"""

    # Security
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable is required")

    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

    # Dual AI Assistants
    OPENAI_ASSISTANT_ID_RESUME = os.getenv('OPENAI_ASSISTANT_ID_RESUME',
                                           os.getenv('OPENAI_ASSISTANT_ID'))  # Fallback for backward compatibility
    OPENAI_ASSISTANT_ID_PORTFOLIO = os.getenv('OPENAI_ASSISTANT_ID_PORTFOLIO')

    # Email Configuration
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

    # File Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    STATIC_DIR = os.path.join(BASE_DIR, 'static')
    TEMPLATES_DIR = os.path.join(BASE_DIR, 'templates')
    LOGS_DIR = os.path.join(BASE_DIR, 'logs')

    # Static File Subdirectories
    IMAGES_DIR = os.path.join(STATIC_DIR, 'images')
    FILES_DIR = os.path.join(STATIC_DIR, 'files')

    # Wordle Specific
    WORDLE_GUESSES_FILE = os.path.join(FILES_DIR, 'wordleGuesses.json')
    WORDLE_REMAINING_FILE = os.path.join(FILES_DIR, 'wordleRemaining.json')
    WORDLE_PLOT_OUTPUT = os.path.join(IMAGES_DIR, 'remaining.png')

    # Beyond The Code
    BEYOND_CODE_PHOTOS_DIR = os.path.join(IMAGES_DIR, 'beyondTheCodePhotos')

    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

    @classmethod
    def validate(cls):
        """Validate that all required configuration is present"""
        required = {
            'SECRET_KEY': cls.SECRET_KEY,
            'OPENAI_API_KEY': cls.OPENAI_API_KEY,
            'OPENAI_ASSISTANT_ID_RESUME': cls.OPENAI_ASSISTANT_ID_RESUME,
            'OPENAI_ASSISTANT_ID_PORTFOLIO': cls.OPENAI_ASSISTANT_ID_PORTFOLIO
        }

        missing = [key for key, value in required.items() if not value]

        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}\n"
                "Please create a .env file based on .env.example:\n"
                "  cp .env.example .env\n"
                "Then edit .env with your actual values."
            )

        return True

class DevelopmentConfig(Config):
    """Development-specific configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production-specific configuration for PythonAnywhere"""
    DEBUG = False

# Default configuration
config = Config
