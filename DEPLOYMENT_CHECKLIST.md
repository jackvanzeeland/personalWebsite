# Portfolio Deployment Checklist

## Pre-Deployment Testing

### ✅ Phase 2: Project Filtering System
- [ ] Visit home page
- [ ] Click "Filter" button next to interactive legend
- [ ] Test each filter tag (Python, JavaScript, AI, etc.)
- [ ] Verify project cards show/hide correctly
- [ ] Check filter count updates
- [ ] Test "All" filter to show everything again
- [ ] Verify achievement "Filter Master" unlocks after 3 uses

### ✅ Phase 3: User Journey Achievements
- [ ] Visit `/journey` page
- [ ] Check progress bar shows correct percentage
- [ ] Verify visited pages show green checkmarks
- [ ] Confirm unvisited pages are grayed out
- [ ] Click "Reset Journey" and confirm it works
- [ ] Visit various pages and watch achievements unlock
- [ ] Check achievement notifications appear (toast messages)
- [ ] Verify all 8 achievements are trackable

### ✅ Phase 4: Comprehensive Case Studies
- [ ] Visit `/project/wordle` and click "Read Case Study" button
- [ ] Verify case study at `/case-study/wordle` renders correctly
- [ ] Check all 6 sections render (Problem → Lessons Learned)
- [ ] Verify Mermaid diagrams display
- [ ] Test back button returns to home
- [ ] Repeat for Secret Santa and Basketball case studies
- [ ] Check mobile responsive layout

### ✅ Phase 5: Scroll-Driven Animations
- [ ] Visit home page and scroll down
- [ ] Verify project cards fade up as you scroll
- [ ] Visit any case study page
- [ ] Check sections fade up on scroll
- [ ] Test on Chrome 115+ (should use native scroll-timeline)
- [ ] Test on Firefox/Safari (should use Intersection Observer fallback)
- [ ] Check browser console for animation mode message
- [ ] Verify 60fps performance (no jank)

### ✅ Phase 6: Interactive Analytics Dashboard
- [ ] Visit `/analytics/dashboard`
- [ ] Verify all 4 summary cards display numbers
- [ ] Check all 6 charts render correctly:
  - Daily Page Views (line chart)
  - Popular Pages (bar chart)
  - Popular Projects (bar chart)
  - Filter Usage (doughnut chart)
  - Theme Preferences (pie chart)
  - Achievement Unlocks (bar chart)
- [ ] Test time range selector (7, 30, 90, 365 days)
- [ ] Verify clicking time range updates all charts
- [ ] Navigate around portfolio, then return to dashboard
- [ ] Confirm new events are logged (check data/analytics/)

### ✅ Progress Bar & Journey Page
- [ ] Check top progress bar shows correct percentage
- [ ] Verify hover effect (slight lift)
- [ ] Click progress bar to navigate to `/journey`
- [ ] Confirm journey page shows all 14 pages correctly
- [ ] Verify visited page count excludes `/journey` itself

### ✅ Theme Switching
- [ ] Toggle between light and dark mode
- [ ] Verify all pages adapt correctly
- [ ] Check progress bar adapts to theme
- [ ] Verify analytics dashboard adapts to theme
- [ ] Check journey page theme support

## Browser Testing

### Desktop Browsers
- [ ] **Chrome 115+** - Test native scroll animations
- [ ] **Firefox** - Test Intersection Observer fallback
- [ ] **Safari** - Test Intersection Observer fallback
- [ ] **Edge** - Test overall compatibility

### Mobile Browsers
- [ ] **Mobile Safari (iOS)** - Test responsive design
- [ ] **Chrome Mobile (Android)** - Test responsive design
- [ ] Check progress bar on mobile (smaller height/text)
- [ ] Verify analytics cards stack properly
- [ ] Test touch interactions for filters

## Performance Testing

- [ ] Run Lighthouse audit (target: 90+ performance score)
- [ ] Check Network tab for excessive requests
- [ ] Verify CSS/JS files load with cache busting (`?v=timestamp`)
- [ ] Check bundle sizes are reasonable
- [ ] Test scroll performance (60fps)
- [ ] Verify no memory leaks (check DevTools Memory tab)

## Data & Privacy

- [ ] Verify `data/analytics/` is in `.gitignore`
- [ ] Check no analytics data is committed to git
- [ ] Confirm `.gitkeep` file exists in `data/analytics/`
- [ ] Test analytics data persists between sessions
- [ ] Verify session IDs are random (no PII)

## Console Checks

### Expected Console Messages
```
✨ Using native CSS scroll-driven animations
// OR
📱 Using Intersection Observer fallback
```

### Should NOT See
- [ ] No JavaScript errors
- [ ] No 404 errors for assets
- [ ] No CORS errors
- [ ] No analytics batch failures

## File Structure Verification

```
/Users/JVZ/Desktop/Projects/personalWebsite/
├── data/
│   ├── analytics/
│   │   └── .gitkeep
│   └── projects.json
├── static/
│   ├── css/
│   │   └── scroll-animations.css ✓
│   └── js/
│       ├── analytics-logger.js ✓
│       ├── achievements.js (modified) ✓
│       ├── project-filter.js (modified) ✓
│       ├── scroll-animations.js ✓
│       ├── theme-switcher.js (modified) ✓
│       └── usersJourney.js (modified) ✓
├── templates/
│   ├── analyticsViewerDashboard.html ✓
│   ├── journey.html ✓
│   ├── about.html (modified) ✓
│   ├── base.html (modified) ✓
│   ├── home.html (modified) ✓
│   ├── _macros.html (modified) ✓
│   └── case-studies/
│       ├── wordle-case-study.html ✓
│       ├── secret-santa-case-study.html ✓
│       └── basketball-case-study.html ✓
├── utils/
│   └── analytics_storage.py ✓
├── app.py (modified) ✓
├── .gitignore (modified) ✓
└── DEPLOYMENT_CHECKLIST.md (this file)
```

## Git Preparation

```bash
# Check status
git status

# Stage all new files
git add static/css/scroll-animations.css
git add static/js/analytics-logger.js
git add static/js/scroll-animations.js
git add templates/analyticsViewerDashboard.html
git add templates/journey.html
git add templates/case-studies/
git add utils/analytics_storage.py
git add data/analytics/.gitkeep

# Stage modified files
git add static/style.css
git add static/js/achievements.js
git add static/js/project-filter.js
git add static/js/theme-switcher.js
git add static/js/usersJourney.js
git add templates/about.html
git add templates/base.html
git add templates/home.html
git add templates/_macros.html
git add app.py
git add .gitignore
git add data/projects.json

# Commit
git commit -m "Complete portfolio enhancements (Phases 2-6)

- Phase 2: Project filtering system with compact dropdown
- Phase 3: User journey achievements (8 achievements)
- Phase 4: Comprehensive case studies (3 detailed pages)
- Phase 5: Scroll-driven animations (native + fallback)
- Phase 6: Analytics dashboard with Chart.js visualizations

Features:
- Dedicated /journey page for progress tracking
- Privacy-first analytics (no third-party tracking)
- Sleek progress bar with gradient design
- Full dark/light theme support
- Mobile responsive design
- 60fps scroll animations"

# Push to remote
git push origin main
```

## Deployment Steps

### For PythonAnywhere (or similar)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Pull on server**
   ```bash
   cd ~/personalWebsite
   git pull origin main
   ```

3. **Install dependencies** (if any new ones)
   ```bash
   pip install --user -r requirements.txt
   ```

4. **Create analytics directory**
   ```bash
   mkdir -p data/analytics
   ```

5. **Reload web app**
   - Go to PythonAnywhere dashboard
   - Click "Reload" button for your web app

6. **Verify deployment**
   - Visit your live site
   - Test each new feature
   - Check `/analytics/dashboard` works
   - Monitor error logs for issues

## Post-Deployment Verification

- [ ] Visit live site homepage
- [ ] Test project filtering
- [ ] Visit `/journey` page
- [ ] Read a case study
- [ ] Check scroll animations work
- [ ] Visit `/analytics/dashboard`
- [ ] Switch themes
- [ ] Test on mobile device
- [ ] Check browser console for errors
- [ ] Monitor analytics data collection

## Rollback Plan

If issues occur:

```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>

# Push changes
git push origin main --force

# Reload on server
```

## Known Limitations

- **Analytics**: Data stored in JSON files (may need database for high traffic)
- **Scroll Animations**: Native support only in Chrome 115+, others use fallback
- **Session Management**: Client-side only, no server-side validation
- **Analytics Dashboard**: Public access (add authentication if needed)

## Optional Enhancements (Future)

- [ ] Add authentication to `/analytics/dashboard`
- [ ] Export analytics as CSV
- [ ] Add achievement sharing (social media)
- [ ] Migrate analytics to database (PostgreSQL/MySQL)
- [ ] Add A/B testing capability
- [ ] Implement rate limiting for analytics API
- [ ] Add real-time dashboard updates (WebSocket)

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Version:** 2.0.0 (Portfolio Enhancements Complete)
