# Chatboard Deployment Guide for PythonAnywhere

## Overview

The chatboard feature uses Flask-SocketIO for real-time WebSocket communication. This requires special configuration on PythonAnywhere.

---

## Prerequisites

- PythonAnywhere account (free or paid tier)
- Git repository pushed to GitHub/GitLab
- Basic familiarity with PythonAnywhere console

---

## Deployment Steps

### Step 1: Push Updated Code to Repository

```bash
# Stage all changes
git add requirements.txt app.py

# Commit changes
git commit -m "Fix chatboard for PythonAnywhere deployment

- Add eventlet dependency for WebSocket support
- Configure SocketIO with eventlet async mode
- Fix server startup to use socketio.run() instead of app.run()"

# Push to remote
git push origin main
```

---

### Step 2: Pull Changes on PythonAnywhere

Log into your PythonAnywhere console and pull the latest changes:

```bash
cd ~/personalWebsite
git pull origin main
```

---

### Step 3: Install Dependencies with eventlet

**IMPORTANT**: Make sure your virtual environment is activated first!

```bash
# Activate your virtual environment
source ~/.virtualenvs/your_venv_name/bin/activate

# Install all dependencies including eventlet
pip install --user -r requirements.txt

# Verify eventlet is installed
pip list | grep eventlet
```

Expected output:
```
eventlet    0.33.3
```

---

### Step 4: Configure PythonAnywhere for Flask-SocketIO

Flask-SocketIO requires **gunicorn with eventlet worker**, not the standard WSGI server.

#### Option A: Using PythonAnywhere CLI (Recommended)

If you have PythonAnywhere CLI (`pa`) installed:

```bash
pa website create --domain YOURUSERNAME.pythonanywhere.com \
  --command '/home/YOURUSERNAME/.virtualenvs/your_venv_name/bin/gunicorn \
  --worker-class eventlet -w 1 \
  --chdir /home/YOURUSERNAME/personalWebsite \
  --bind unix:${DOMAIN_SOCKET} app:socketio'
```

**Replace**:
- `YOURUSERNAME` with your PythonAnywhere username
- `your_venv_name` with your actual virtualenv name

#### Option B: Manual WSGI Configuration

If using the standard PythonAnywhere web UI, you'll need to create a custom startup script:

1. Go to **Web** tab on PythonAnywhere dashboard
2. Click **Reload** to reload your web app
3. Click on your WSGI configuration file (e.g., `/var/www/username_pythonanywhere_com_wsgi.py`)
4. Replace the contents with:

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/YOURUSERNAME/personalWebsite'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(project_home, '.env'))

# Import your SocketIO application
from app import socketio, app

# IMPORTANT: Use 'socketio' not 'app' for WSGI
application = socketio
```

**Replace**:
- `YOURUSERNAME` with your PythonAnywhere username

5. Save the file
6. Go back to **Web** tab and click **Reload**

---

### Step 5: Test the Chatboard

1. Visit your site: `https://YOURUSERNAME.pythonanywhere.com/project/ai_innovations_portal/chat`
2. Open browser DevTools Console (F12 → Console tab)
3. Look for successful connection message:
   ```
   Connected to server, waiting for recent messages...
   ```
4. Type a message and send it
5. Message should appear in the chat window

---

## Troubleshooting

### Issue: "Connection failed" or "WebSocket not supported"

**Cause**: eventlet not installed or WSGI file not using `socketio` application

**Fix**:
```bash
# Verify eventlet is installed
pip list | grep eventlet

# If missing, install it
pip install eventlet==0.33.3
```

Check WSGI file uses `application = socketio` not `application = app`

---

### Issue: "Module 'eventlet' not found"

**Cause**: eventlet installed in wrong environment

**Fix**:
```bash
# Make sure you're in the correct virtualenv
which python

# Should show: /home/YOURUSERNAME/.virtualenvs/your_venv_name/bin/python

# Reinstall in correct environment
pip install --user -r requirements.txt
```

---

### Issue: Messages not broadcasting to other users

**Cause**: Multiple workers trying to share state

**Fix**: Ensure gunicorn uses **only 1 worker** (`-w 1`)

```bash
# In your gunicorn command
--worker-class eventlet -w 1
```

---

### Issue: Static files not loading

**Cause**: PythonAnywhere async deployment doesn't support static file mappings

**Fix**: Configure static files manually in PythonAnywhere Web UI:
1. Go to **Web** tab
2. Scroll to **Static files** section
3. Add:
   - URL: `/static/`
   - Directory: `/home/YOURUSERNAME/personalWebsite/static/`

---

### Issue: "Async mode not supported"

**Cause**: Missing async_mode in SocketIO initialization

**Fix**: Already fixed in `app.py` line 42:
```python
socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins="*")
```

---

## Verification Checklist

- [ ] eventlet installed: `pip list | grep eventlet`
- [ ] Code pulled from repository: `git log -1` shows latest commit
- [ ] WSGI file configured with `application = socketio`
- [ ] Web app reloaded on PythonAnywhere dashboard
- [ ] Chatboard page loads without errors
- [ ] Browser console shows "Connected to server"
- [ ] Messages send and receive successfully

---

## Important Notes

1. **Free Tier Limitations**: PythonAnywhere free tier may have restrictions on WebSocket connections. If chatboard still doesn't work, you may need to upgrade to a paid tier.

2. **One Worker Only**: Flask-SocketIO with eventlet requires `-w 1` (one worker). Don't increase this or messages won't broadcast correctly.

3. **CORS Configuration**: The `cors_allowed_origins="*"` setting allows connections from any origin. For production, restrict this to your domain:
   ```python
   socketio = SocketIO(app, async_mode='eventlet',
                       cors_allowed_origins="https://YOURUSERNAME.pythonanywhere.com")
   ```

4. **Development vs Production**:
   - Local development: `python app.py` uses `socketio.run()` with debug mode
   - Production (PythonAnywhere): Uses gunicorn with eventlet worker

---

## Alternative Deployment Options

If PythonAnywhere continues to have issues, consider these alternatives with better WebSocket support:

- **Heroku**: Full WebSocket support, free tier available
- **Railway**: Modern deployment, easy setup
- **Render**: Free tier with WebSocket support
- **Vercel**: Supports serverless WebSockets with proper configuration

---

## Support Resources

- [PythonAnywhere Flask-SocketIO Guide](https://help.pythonanywhere.com/pages/FlaskSocketIO/)
- [Flask-SocketIO Documentation](https://flask-socketio.readthedocs.io/)
- [eventlet Documentation](https://eventlet.net/)

---

**Last Updated**: October 26, 2024
**Version**: 1.0.0
