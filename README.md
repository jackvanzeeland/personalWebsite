# Personal Portfolio Website

A professional portfolio website built with Flask, showcasing technical projects, automation solutions, and software engineering skills. The application features interactive project demonstrations, AI-powered chat, and a comprehensive project catalog.

🌐 **Live Site**: [jackvz2002.pythonanywhere.com](https://jackvz2002.pythonanywhere.com)

## Features

- **Interactive Project Showcase**: 10+ projects with detailed descriptions and live demos
- **AI-Powered Chat**: OpenAI Assistant integration for interactive conversations
- **Real-time Chat Board**: Socket.IO-powered open chat platform
- **Promo Manager Analytics**: TikTok campaign analytics with algorithmic lead qualification
- **Analytics Dashboard**: Event tracking and visualization with Chart.js
- **Lyric Animator V2**: Enhanced music visualization with particle effects and modular animations
- **Responsive Design**: Mobile-friendly interface with modern CSS
- **User Journey Tracking**: Progress tracking across site pages
- **Beyond The Code**: Personal photo slideshow and interests
- **Production Ready**: Professional logging, error handling, and deployment configuration

## Tech Stack

- **Backend**: Flask 3.1.0 (Python 3.12+)
- **Frontend**: HTML5, CSS3 (with CSS Custom Properties), JavaScript (ES6+)
- **AI Integration**: OpenAI API 1.78.1 (GPT-based Assistant)
- **Data Processing**: Pandas 2.0.3 (for promo analytics)
- **Real-time**: Flask-SocketIO 5.4.1, Socket.IO
- **Deployment**: PythonAnywhere
- **Server**: Gunicorn + Eventlet (production) / Flask dev server (development)

## Project Architecture

The codebase follows modern software engineering practices with clean separation of concerns:

```
personalWebsite/
├── app.py                      # Main Flask application
├── config.py                   # Centralized configuration
├── wsgi.py.example             # WSGI config template for deployment
├── gunicorn.conf.py            # Gunicorn server configuration
├── setup.sh                    # Automated setup script
├── requirements.txt            # Python dependencies (7 packages)
│
├── data/                       # Application data
│   ├── projects.json           # Project metadata and content
│   ├── analytics/              # Daily analytics JSON files
│   └── promoManager/           # TikTok lead qualification data (CSV)
│
├── utils/                      # Utility modules
│   ├── __init__.py
│   ├── project_loader.py       # Project data loader
│   ├── analytics_storage.py    # Analytics event storage and aggregation
│   └── promo_data_processor.py # TikTok lead qualification processor
│
├── scripts/                    # Backend logic and utilities
│   ├── ai_projects.py          # AI project definitions
│   ├── cleanup_logs.py         # Log maintenance utility
│   ├── log.py                  # Production logging with rotation
│   ├── matching.py             # Secret Santa algorithm
│   └── wordle.py               # Wordle solver algorithm
│
├── static/                     # Static assets
│   ├── css/
│   │   ├── lyric-animator.css, lyric-animator-v2.css
│   │   ├── promo-dashboard.css, promo-analytics.css
│   │   ├── analytics-viewer.css
│   │   ├── secret-santa.css
│   │   └── backgrounds/        # Background effect styles
│   ├── js/
│   │   ├── utils/              # Shared JavaScript utilities
│   │   │   ├── api-client.js   # Fetch wrapper
│   │   │   ├── dom-helpers.js  # DOM manipulation utilities
│   │   │   └── storage.js      # localStorage wrapper
│   │   ├── lyrics-animator-v2.js, lyrics-animator-v2-animations.js
│   │   ├── lyrics-animator-v2-layouts.js, lyric-animator-particles-v2.js
│   │   ├── lyric-animator-ui-v2.js
│   │   ├── promo-dashboard.js, promo-analytics.js
│   │   ├── analytics-logger.js, analytics-viewer.js
│   │   ├── backgrounds/        # Background effect scripts
│   │   ├── animateCards.js
│   │   ├── beyondTheCode_slideshow.js
│   │   ├── secret-santa.js
│   │   └── usersJourney.js     # Progress tracking
│   ├── images/                 # Project images and assets
│   └── files/                  # Static files (PDFs, JSON)
│
├── templates/                  # Jinja2 templates
│   ├── layouts/                # Base layouts
│   │   └── project_detail.html # Reusable project layout
│   ├── _macros.html            # Reusable template components
│   ├── base.html               # Main base template
│   ├── home.html               # Portfolio landing page
│   ├── about.html              # About page
│   ├── beyondTheCode.html      # Personal interests
│   ├── ai_innovations_portal.html
│   ├── analyticsViewerDashboard.html # Analytics dashboard
│   ├── lyricAnimator.html      # Lyric Animator V2
│   ├── promoManagerAnalytics.html # TikTok campaign analytics
│   ├── matching.html           # Secret Santa
│   ├── wordle.html             # Wordle solver
│   ├── basketball.html
│   ├── budget.html
│   ├── superbowl.html
│   └── ... (additional project pages)
│
├── logs/                       # Application logs (auto-rotating)
│   ├── .gitkeep
│   └── app.log                 # Current log file
│
├── DEPLOYMENT.md               # PythonAnywhere deployment guide
├── CHECKLIST.md                # Pre-deployment checklist
├── PLAYBOOK.md                 # Development workflow guide
└── .env                        # Environment variables (not in git)
```

## Featured Projects

### Interactive Projects
- **Wordle Algorithm Solver** - AI that recommends optimal Wordle guesses (87% win rate)
- **Secret Santa Matching** - Constraint-based partner matching system
- **Lyric Animator V2** - Enhanced music visualization with particle effects, modular animations
- **Promo Manager Analytics** - TikTok campaign analytics with lead qualification (215/6,156 qualified)
- **Analytics Dashboard** - Event tracking visualization with Chart.js

### Automation & Optimization
- **Budgeting Automation** - UiPath bot for bank statement processing
- **Basketball Lineup Optimization** - R-based team performance analyzer
- **Super Bowl Competition** - Prop bet scoring system

### AI & Web Development
- **AI Innovations Portal** - Hub for AI-generated projects
- **HTML Gems** - AI-powered HTML snippet discovery
- **Open Chat Board** - Real-time Socket.IO chat application

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/personalWebsite.git
cd personalWebsite
```

### 2. Create Virtual Environment

```bash
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_ASSISTANT_ID=asst-your-assistant-id
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
LOG_LEVEL=INFO
```

**Security Note**: Never commit the `.env` file to version control!

### 5. Validate Configuration

```bash
python -c "from config import Config; Config.validate(); print('✓ Config OK')"
```

### 6. Run the Application

**Development mode:**
```bash
flask run
```

**Production mode (with Gunicorn):**
```bash
gunicorn -c gunicorn.conf.py app:app
```

Visit: http://127.0.0.1:5000

## Development Workflow

### Project Structure Conventions

1. **Configuration**: All settings in `config.py`, environment variables in `.env`
2. **Data**: Project metadata in `data/projects.json`, loaded via `utils/project_loader.py`
3. **Templates**: Use `_macros.html` for reusable components, extend `layouts/project_detail.html` for project pages
4. **JavaScript**: Import utilities from `static/js/utils/` before application scripts
5. **CSS**: Use CSS custom properties defined in `static/style.css`
6. **Logging**: Use `from scripts.log import log_text, log_error, log_warning`

### Adding a New Project

1. Add project metadata to `data/projects.json`
2. Create template in `templates/` (extend `layouts/project_detail.html` if applicable)
3. Add route in `app.py` if needed
4. Add project images to `static/images/`
5. Test locally before deploying

### Code Quality Standards

- **Python**: Follow PEP 8, use type hints where appropriate
- **JavaScript**: Use ES6+ features, IIFE pattern for modules
- **CSS**: Use custom properties, avoid inline styles
- **Templates**: Use macros for repeated patterns, keep logic minimal

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete PythonAnywhere deployment instructions.

Quick summary:
1. Push code to GitHub
2. Clone to PythonAnywhere
3. Set up virtual environment
4. Configure `.env` file
5. Set up Web app with WSGI configuration
6. Reload and test

## Maintenance

### View Logs

```bash
tail -f logs/app.log
```

### Clean Old Logs

```bash
python scripts/cleanup_logs.py
```

### Update Deployed Site

```bash
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
# Reload via PythonAnywhere Web tab
```

## Performance Optimizations

- **Asset Caching**: Cache-busting query parameters on CSS/JS files
- **Log Rotation**: Automatic daily rotation, 30-day retention
- **DOM Caching**: Frequently accessed elements cached in JavaScript
- **Modular Loading**: Utilities loaded before application scripts
- **CSS Variables**: Single source of truth for theming

## Security Features

- Environment-based secret management (no hardcoded credentials)
- Input validation on all forms
- OpenAI API key isolation
- Secure session handling
- Production-grade error handling

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

## License

© 2025 Jack Van Zeeland. All rights reserved.

## Contact

- **Portfolio**: https://jackvz2002.pythonanywhere.com
- **LinkedIn**: [Jack Van Zeeland](https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/)
- **GitHub**: [@jackvanzeeland](https://github.com/jackvanzeeland)

---

**Built with Flask** 🐍 | **Deployed on PythonAnywhere** ☁️ | **Powered by AI** 🤖
