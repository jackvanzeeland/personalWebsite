# Deployment Guide - PythonAnywhere

This guide covers deploying the personal website to PythonAnywhere.

## Prerequisites

- PythonAnywhere account (free or paid)
- Git repository access
- Environment variables (.env file values)

## Initial Setup

### 1. Clone Repository

```bash
# SSH into PythonAnywhere console
cd ~
git clone https://github.com/yourusername/personalWebsite.git
cd personalWebsite
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python3.13 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add the following (replace with your actual values):
```
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-your-key-here
OPENAI_ASSISTANT_ID=asst-your-id-here
LOG_LEVEL=INFO
```

Save and exit (Ctrl+X, Y, Enter)

### 4. Validate Configuration

```bash
# Test configuration
python -c "from config import Config; Config.validate(); print('Config OK')"

# Test application startup
python app.py
```

Exit with Ctrl+C if it starts successfully.

## PythonAnywhere Web App Setup

### 1. Configure Web App

1. Go to PythonAnywhere Dashboard → Web
2. Click "Add a new web app"
3. Choose "Manual configuration"
4. Select Python 3.13

### 2. Configure WSGI File

1. In Web tab, click on WSGI configuration file link
2. Copy contents from `wsgi.py.example`
3. Update `project_home` path to your actual path (e.g., `/home/yourusername/personalWebsite`)

### 3. Configure Virtual Environment

1. In Web tab, find "Virtualenv" section
2. Enter path: `/home/yourusername/personalWebsite/venv`

### 4. Configure Static Files

Add these mappings in the Static Files section:

| URL           | Directory                                          |
|---------------|----------------------------------------------------|
| /static/      | /home/yourusername/personalWebsite/static          |

### 5. Reload Web App

Click the green "Reload" button

## Testing Deployment

1. Visit your PythonAnywhere URL: `yourusername.pythonanywhere.com`
2. Test critical paths:
   - [ ] Home page loads
   - [ ] About page loads
   - [ ] Chat returns responses
   - [ ] Project pages load
   - [ ] Images display correctly
   - [ ] CSS/JS loads correctly

## Updating Deployed Site

```bash
# SSH into PythonAnywhere
cd ~/personalWebsite

# Pull latest changes
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install any new dependencies
pip install -r requirements.txt

# Reload web app (or use PythonAnywhere API)
# Manual: Click Reload button in PythonAnywhere Web tab
```

## Monitoring

### View Logs

```bash
# Application logs
tail -f logs/app.log

# PythonAnywhere error log
# Available in Web tab → Log files section
```

### Check Disk Usage

```bash
du -sh ~/personalWebsite
```

## Troubleshooting

### Application Won't Start

1. Check error log in PythonAnywhere Web tab
2. Verify .env file exists and has correct values
3. Check virtual environment path is correct
4. Validate config: `python -c "from config import Config; Config.validate()"`

### Static Files Not Loading

1. Verify static file mappings in Web tab
2. Check file permissions: `ls -la static/`
3. Ensure paths are absolute, not relative

### OpenAI Chat Not Working

1. Verify environment variables are set correctly
2. Check logs for API errors
3. Test API key: `python -c "import openai; print('OK')"`

## Production Checklist

- [ ] .env file created with all required variables
- [ ] Virtual environment activated
- [ ] Dependencies installed
- [ ] Config validation passes
- [ ] WSGI file configured with correct paths
- [ ] Static files mapping configured
- [ ] All pages load correctly
- [ ] Chat functionality works
- [ ] Logs directory is writable
- [ ] No secrets committed to git

## Support

- PythonAnywhere Help: https://help.pythonanywhere.com/
- Flask Documentation: https://flask.palletsprojects.com/
