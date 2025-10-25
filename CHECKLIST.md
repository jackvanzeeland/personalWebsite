# Pre-Deployment Checklist

Use this checklist before deploying to production.

## Security
- [ ] No hardcoded secrets in code
- [ ] .env file created with production values
- [ ] SECRET_KEY is strong and unique (not the example value)
- [ ] .env is in .gitignore
- [ ] No API keys committed to git

## Configuration
- [ ] requirements.txt is up to date
- [ ] runtime.txt specifies correct Python version
- [ ] config.py validation works (`python -c "from config import Config; Config.validate()"`)
- [ ] All file paths use Config constants (no hardcoded paths)

## Code Quality
- [ ] No console.log or debug print statements
- [ ] No commented-out code blocks
- [ ] ESLint passes (if installed)
- [ ] Python imports are clean (no unused imports)

## Assets
- [ ] All CSS in external files (no inline styles)
- [ ] All JavaScript in external files (no inline scripts)
- [ ] Images are optimized
- [ ] Static files load correctly

## Functionality
- [ ] All pages load without errors
- [ ] Chat functionality works
- [ ] OpenAI integration works
- [ ] Wordle solver works
- [ ] Secret Santa works
- [ ] All interactive features tested
- [ ] Mobile responsive design works

## Performance
- [ ] No duplicate CSS/JS loads
- [ ] Assets are cached (cache-busting via ?v= parameter)
- [ ] No memory leaks (intervals cleared on unload)

## Deployment
- [ ] Git repository is clean (`git status`)
- [ ] All changes committed
- [ ] Deployment documentation reviewed
- [ ] PythonAnywhere account ready
- [ ] Domain configured (if using custom domain)

## Post-Deployment
- [ ] Application starts without errors
- [ ] All pages accessible
- [ ] Logs are being written
- [ ] No errors in error log
- [ ] SSL certificate valid (if using HTTPS)
