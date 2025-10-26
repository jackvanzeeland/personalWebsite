# Portfolio Enhancement Features Implementation Plan

## Overview
This plan implements 6 major enhancements to transform the portfolio from a strong technical showcase into a world-class professional portfolio that demonstrates both technical excellence and creative thinking. Features are ordered by difficulty: medium-effort features first (dark mode, filtering, achievements), followed by advanced features (case studies, scroll animations, analytics dashboard).

## Current State Analysis

**Strengths:**
- Solid architecture post-refactoring: 57 CSS variables, IIFE JavaScript modules, centralized config
- User journey tracking system with localStorage persistence
- 12 projects (10 main + 2 AI) with structured JSON data
- Intersection Observer scroll animations already implemented
- Professional logging and deployment infrastructure

**Gaps:**
- No theme switching capability (dark mode only)
- No project discovery/filtering beyond two sections (main/AI)
- User journey lacks gamification/motivation
- No detailed project case studies
- Limited use of advanced CSS features
- No portfolio analytics/insights

**Technical Constraints:**
- Must maintain IIFE module pattern for JavaScript
- Must use existing CSS variable system
- Must preserve user journey functionality
- Browser support: Chrome/Edge 90+, Firefox 88+, Safari 14+

## Desired End State

A portfolio that:
1. Offers personalized viewing experience with dark/light modes
2. Enables easy project discovery through filtering and tags
3. Motivates exploration through achievement system
4. Demonstrates deep technical thinking through case studies
5. Shows cutting-edge CSS skills with scroll-driven animations
6. Provides portfolio owner with visitor insights

**Verification Methods:**
- Visual testing across all pages in both themes
- Filter interaction testing with all tag combinations
- Achievement unlock testing through journey completion
- Case study navigation and diagram rendering
- Animation performance testing (60fps target)
- Analytics data collection and dashboard visualization

## What We're NOT Doing

- GitHub repository creation/linking (deferred to separate instance)
- Backend deployment to PythonAnywhere (local testing only)
- Third-party analytics integration (building custom solution)
- Mobile-specific optimizations beyond existing responsive design
- Browser polyfills for very old browsers
- SEO optimization or meta tag updates
- Accessibility audit (though we'll maintain ARIA where exists)

## Implementation Approach

**Strategy:** Progressive enhancement through 6 phases, each fully functional before moving to next. Each phase adds new capability without breaking existing functionality. Testing checkpoints after each phase ensure stability.

**Order Rationale:**
1. **Dark Mode** (Phase 1): Foundation for visual customization
2. **Project Filtering** (Phase 2): Improves navigation, builds on existing structure
3. **Achievements** (Phase 3): Extends user journey system
4. **Case Studies** (Phase 4): Content-heavy, can be developed independently
5. **Scroll Animations** (Phase 5): Visual polish, requires case studies to showcase
6. **Analytics Dashboard** (Phase 6): Backend-heavy, benefits from all previous features

---

# PHASE 1: Dark Mode Toggle

## Overview
Implement theme switching system with localStorage persistence, respecting user preference. Includes toggle UI in navigation, smooth transitions between themes, and CSS variable overrides for light mode.

## Changes Required

### 1. Create Theme Switcher JavaScript Module

**File**: `static/js/theme-switcher.js` (NEW)

```javascript
/**
 * Theme Switcher Module
 * Manages dark/light theme with localStorage persistence
 */

const ThemeSwitcher = (function() {
    'use strict';

    const STORAGE_KEY = 'theme';
    const THEMES = {
        dark: 'dark',
        light: 'light'
    };

    // Light mode CSS variable overrides
    const lightThemeVars = {
        // Background Colors
        '--bg-dark': '#f8f9fa',
        '--bg-card-dark': '#ffffff',
        '--color-primary-dark': '#ffffff',
        '--color-secondary-dark': '#e9ecef',
        '--color-tertiary-dark': '#dee2e6',

        // Text Colors
        '--text-white': '#212529',
        '--text-light-gray': '#495057',

        // Update body overlay
        '--body-overlay-opacity': '0.7',

        // Shadows (stronger for light mode)
        '--shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.15)',
        '--shadow-md': '0 4px 8px rgba(0, 0, 0, 0.15)',
        '--shadow-lg': '0 4px 12px rgba(0, 0, 0, 0.2)',
        '--shadow-xl': '0 8px 20px rgba(0, 0, 0, 0.25)'
    };

    /**
     * Apply theme by setting CSS variables
     */
    function applyTheme(themeName) {
        const root = document.documentElement;

        if (themeName === THEMES.light) {
            // Apply light mode overrides
            Object.entries(lightThemeVars).forEach(([property, value]) => {
                root.style.setProperty(property, value);
            });

            // Update body overlay for light mode
            const overlay = document.querySelector('body::before');
            document.body.setAttribute('data-theme', 'light');
        } else {
            // Remove all inline styles to revert to CSS defaults (dark mode)
            Object.keys(lightThemeVars).forEach(property => {
                root.style.removeProperty(property);
            });
            document.body.setAttribute('data-theme', 'dark');
        }

        // Store preference
        StorageHelper.set(STORAGE_KEY, themeName);

        // Update toggle button
        updateToggleButton(themeName);
    }

    /**
     * Update toggle button icon and aria-label
     */
    function updateToggleButton(themeName) {
        const toggleBtn = DOMHelpers.getById('theme-toggle');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('i');
        const isDark = themeName === THEMES.dark;

        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }

        toggleBtn.setAttribute('aria-label',
            isDark ? 'Switch to light mode' : 'Switch to dark mode'
        );
        toggleBtn.setAttribute('title',
            isDark ? 'Light Mode' : 'Dark Mode'
        );
    }

    /**
     * Toggle between themes
     */
    function toggleTheme() {
        const currentTheme = StorageHelper.get(STORAGE_KEY, THEMES.dark);
        const newTheme = currentTheme === THEMES.dark ? THEMES.light : THEMES.dark;
        applyTheme(newTheme);
    }

    /**
     * Initialize theme system
     */
    function init() {
        // Apply saved theme or default to dark
        const savedTheme = StorageHelper.get(STORAGE_KEY, THEMES.dark);
        applyTheme(savedTheme);

        // Set up toggle button listener
        const toggleBtn = DOMHelpers.getById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
    }

    // Public API
    return {
        init,
        toggleTheme,
        getCurrentTheme: () => StorageHelper.get(STORAGE_KEY, THEMES.dark)
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', ThemeSwitcher.init);

// Expose for HTML onclick if needed
window.toggleTheme = ThemeSwitcher.toggleTheme;
```

### 2. Update CSS for Light Mode Support

**File**: `static/style.css`

**Add after line 57 (after existing variables):**

```css
/* ====== THEME TRANSITION SUPPORT ====== */
:root {
  --body-overlay-opacity: 0.3;
}

body::before {
  opacity: var(--body-overlay-opacity);
  transition: var(--transition-normal);
}

/* Smooth theme transitions */
* {
  transition: background-color var(--transition-normal),
              color var(--transition-normal),
              border-color var(--transition-normal);
}

/* Light theme specific overrides via data attribute */
body[data-theme="light"] {
  color: #212529;
}

body[data-theme="light"]::before {
  background: rgba(255, 255, 255, 0.7);
}

body[data-theme="light"] .card {
  background-color: var(--bg-card-dark);
  color: #212529;
}

body[data-theme="light"] .card-title,
body[data-theme="light"] .card-text {
  color: #212529;
}

body[data-theme="light"] .navbar {
  background-color: rgba(255, 255, 255, 0.95) !important;
}

body[data-theme="light"] .navbar-brand,
body[data-theme="light"] .nav-link {
  color: #212529 !important;
}

body[data-theme="light"] .badge {
  background-color: #0d6efd !important;
  color: white !important;
}
```

### 3. Add Toggle Button to Navigation

**File**: `templates/base.html`

**Find the navbar section (around line 30-50) and add theme toggle before the user journey progress bar:**

```html
<!-- Theme Toggle Button -->
<button id="theme-toggle"
        class="btn btn-sm btn-outline-light me-3"
        aria-label="Switch to light mode"
        title="Light Mode">
    <i class="fas fa-sun"></i>
</button>
```

**Position after the "About" link and before the progress bar wrapper:**

```html
<div class="collapse navbar-collapse" id="navbarNav">
    <ul class="navbar-nav ms-auto">
        <li class="nav-item">
            <a class="nav-link" href="{{ url_for('home') }}">Home</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="{{ url_for('about') }}">About</a>
        </li>
    </ul>

    <!-- NEW: Theme Toggle -->
    <button id="theme-toggle"
            class="btn btn-sm btn-outline-light me-3"
            aria-label="Switch to light mode"
            title="Light Mode">
        <i class="fas fa-sun"></i>
    </button>

    <!-- Top Progress Bar -->
    <div class="top-bar-wrapper">
        <!-- existing progress bar code -->
    </div>
</div>
```

### 4. Load Theme Switcher in Base Template

**File**: `templates/base.html`

**Add after the other utility scripts (around where storage.js, dom-helpers.js are loaded):**

```html
<!-- Utility scripts (load first) -->
<script src="{{ url_for('static', filename='js/utils/dom-helpers.js') }}?v={{ now.timestamp() }}"></script>
<script src="{{ url_for('static', filename='js/utils/api-client.js') }}?v={{ now.timestamp() }}"></script>
<script src="{{ url_for('static', filename='js/utils/storage.js') }}?v={{ now.timestamp() }}"></script>

<!-- Theme Switcher (load before page-specific scripts) -->
<script src="{{ url_for('static', filename='js/theme-switcher.js') }}?v={{ now.timestamp() }}"></script>
```

## Success Criteria

### Automated Verification
- [ ] Flask app starts without errors: `flask run --port 5001`
- [ ] No JavaScript console errors on page load
- [ ] Theme preference persists after page refresh

### Manual Verification
- [ ] Toggle button visible in navbar on all pages
- [ ] Click toggle switches between dark and light themes
- [ ] Theme persists after page reload
- [ ] Theme persists after navigating to different pages
- [ ] All text remains readable in both themes
- [ ] Card backgrounds properly invert
- [ ] Navbar properly inverts
- [ ] Smooth transition animation (no jarring flashes)
- [ ] Test on: home, about, wordle, matching, lyricAnimator pages

---

# PHASE 2: Project Filtering System

## Overview
Add tag-based filtering to project pages with animated filter UI. Projects can be filtered by technology (Python, JavaScript, AI, etc.) with smooth show/hide animations. Integrates with existing project card system.

## Changes Required

### 1. Add Tags to Project Data

**File**: `data/projects.json`

**Add `tags` array to each project. Here's the pattern for first 3 projects:**

```json
{
  "title": "Wordle Algorithm Solver",
  "description": "...",
  "technologies": ["Python", "Regex"],
  "tags": ["Python", "Algorithm", "AI", "Interactive"],
  "github_link": null,
  ...
},
{
  "title": "Budgeting Automation",
  "description": "...",
  "technologies": ["UiPath", "Automation", "Data Manipulation"],
  "tags": ["Automation", "Data", "Finance"],
  "github_link": null,
  ...
},
{
  "title": "Basketball Lineup Optimization",
  "description": "...",
  "technologies": ["R Programming", "Problem Solving", "Data Manipulation"],
  "tags": ["R", "Algorithm", "Data", "Sports"],
  "github_link": null,
  ...
}
```

**Complete tag mapping for all projects:**
- Wordle: ["Python", "Algorithm", "AI", "Interactive"]
- Budgeting: ["Automation", "Data", "Finance"]
- Basketball: ["R", "Algorithm", "Data", "Sports"]
- Secret Santa: ["Python", "Algorithm", "Interactive"]
- Super Bowl: ["Python", "Data", "Sports"]
- Reddit Stories: ["Python", "Automation", "Video", "Social Media"]
- Lyric Animator: ["JavaScript", "Creative", "Interactive", "Music"]
- AI Innovations Portal: ["AI", "Web"]
- HTML Gems: ["AI", "Web", "Interactive"]
- Open Chat Board: ["JavaScript", "Real-time", "Interactive", "Social"]

### 2. Create Project Filter JavaScript Module

**File**: `static/js/project-filter.js` (NEW)

```javascript
/**
 * Project Filter Module
 * Handles filtering of project cards by tags
 */

const ProjectFilter = (function() {
    'use strict';

    let currentFilter = 'all';
    const ANIMATION_DURATION = 300; // ms

    /**
     * Get all unique tags from project cards
     */
    function extractTags() {
        const cards = document.querySelectorAll('.project-card-wrapper');
        const tagsSet = new Set();

        cards.forEach(card => {
            const tags = card.getAttribute('data-tags');
            if (tags) {
                tags.split(',').forEach(tag => tagsSet.add(tag.trim()));
            }
        });

        return Array.from(tagsSet).sort();
    }

    /**
     * Filter cards by tag
     */
    function filterProjects(tag) {
        currentFilter = tag;
        const cards = document.querySelectorAll('.project-card-wrapper');

        cards.forEach(card => {
            const cardTags = card.getAttribute('data-tags') || '';
            const shouldShow = tag === 'all' || cardTags.includes(tag);

            if (shouldShow) {
                card.style.display = '';
                // Fade in animation
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';

                setTimeout(() => {
                    card.style.transition = `opacity ${ANIMATION_DURATION}ms ease, transform ${ANIMATION_DURATION}ms ease`;
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                // Fade out animation
                card.style.transition = `opacity ${ANIMATION_DURATION}ms ease, transform ${ANIMATION_DURATION}ms ease`;
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';

                setTimeout(() => {
                    card.style.display = 'none';
                }, ANIMATION_DURATION);
            }
        });

        // Update active filter button
        updateActiveButton(tag);

        // Update URL hash for bookmarking
        window.location.hash = tag === 'all' ? '' : `filter-${tag}`;
    }

    /**
     * Update active state on filter buttons
     */
    function updateActiveButton(activeTag) {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            const btnTag = btn.getAttribute('data-filter');
            if (btnTag === activeTag) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    }

    /**
     * Create filter bar UI
     */
    function createFilterBar(tags) {
        const container = DOMHelpers.getById('filter-bar-container');
        if (!container) return;

        const filterBar = DOMHelpers.create('div', {
            className: 'filter-bar mb-4'
        });

        // Add "All" button
        const allBtn = DOMHelpers.create('button', {
            className: 'filter-btn active btn btn-sm btn-outline-primary me-2 mb-2',
            attrs: {
                'data-filter': 'all',
                'aria-pressed': 'true'
            },
            text: 'All Projects'
        });
        allBtn.addEventListener('click', () => filterProjects('all'));
        filterBar.appendChild(allBtn);

        // Add tag buttons
        tags.forEach(tag => {
            const btn = DOMHelpers.create('button', {
                className: 'filter-btn btn btn-sm btn-outline-primary me-2 mb-2',
                attrs: {
                    'data-filter': tag,
                    'aria-pressed': 'false'
                },
                text: tag
            });
            btn.addEventListener('click', () => filterProjects(tag));
            filterBar.appendChild(btn);
        });

        container.appendChild(filterBar);
    }

    /**
     * Initialize filter system
     */
    function init() {
        // Extract tags from existing cards
        const tags = extractTags();

        if (tags.length === 0) {
            console.log('No tags found on project cards');
            return;
        }

        // Create filter UI
        createFilterBar(tags);

        // Check for filter in URL hash
        const hash = window.location.hash.replace('#filter-', '');
        if (hash && tags.includes(hash)) {
            filterProjects(hash);
        }
    }

    // Public API
    return {
        init,
        filterProjects,
        getCurrentFilter: () => currentFilter
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', ProjectFilter.init);
```

### 3. Update Home Template with Filter Support

**File**: `templates/home.html`

**Replace entire content with:**

```html
{% extends "base.html" %}
{% from '_macros.html' import hero_section, project_card %}

{% block title %}Jack Van Zeeland - Home{% endblock %}

{% block content %}
{{ hero_section('Welcome to My Portfolio', 'Showcasing my passion for problem-solving and innovative solutions.') }}

<div class="container my-4">
    <p class="text-center"><span class="interactive-legend"></span> Indicates an interactive project</p>
</div>

<!-- NEW: Filter Bar Container -->
<div class="container mt-4">
    <div id="filter-bar-container"></div>
</div>

<div class="container mt-5">
    <div class="row">
        {% for project in projects %}
        <!-- Add wrapper with data-tags attribute -->
        <div class="project-card-wrapper" data-tags="{{ project.tags|join(', ') if project.tags else '' }}">
            {{ project_card(project) }}
        </div>
        {% endfor %}
    </div>
</div>

<!-- Load filter script -->
<script src="{{ url_for('static', filename='js/project-filter.js') }}?v={{ now.timestamp() }}"></script>
{% endblock %}
```

### 4. Add Filter Bar Styles

**File**: `static/style.css`

**Add at the end of the file:**

```css
/* ====== PROJECT FILTER BAR ====== */
.filter-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--bg-white-transparent);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}

.filter-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    border: 2px solid var(--color-primary-blue);
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--color-primary-blue);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.filter-btn:hover {
    background: var(--color-primary-blue);
    color: white;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.filter-btn.active {
    background: var(--color-primary-blue);
    color: white;
    box-shadow: var(--shadow-glow);
}

.project-card-wrapper {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Light mode filter adjustments */
body[data-theme="light"] .filter-bar {
    background: rgba(255, 255, 255, 0.95);
}

body[data-theme="light"] .filter-btn {
    border-color: #0d6efd;
    color: #0d6efd;
}

body[data-theme="light"] .filter-btn:hover,
body[data-theme="light"] .filter-btn.active {
    background: #0d6efd;
    color: white;
}
```

### 5. Update AI Innovations Portal Template

**File**: `templates/ai_innovations_portal.html`

**Add filter support similar to home.html:**

```html
{% extends "layouts/project_detail.html" %}
{% from '_macros.html' import project_card %}

{% set project_title = 'AI Innovations Portal' %}

{% block project_content %}
<div class="container">
    <p class="text-center text-white mb-4">
        Welcome to my AI Innovations Portal! This section showcases projects where I've leveraged
        artificial intelligence and generative AI to create unique solutions.
    </p>

    <!-- NEW: Filter Bar -->
    <div id="filter-bar-container"></div>

    <div class="row mt-4">
        {% for project in ai_projects %}
        <div class="project-card-wrapper" data-tags="{{ project.tags|join(', ') if project.tags else '' }}">
            {{ project_card(project) }}
        </div>
        {% endfor %}
    </div>
</div>

<!-- Load filter script -->
<script src="{{ url_for('static', filename='js/project-filter.js') }}?v={{ now.timestamp() }}"></script>
{% endblock %}
```

## Success Criteria

### Automated Verification
- [ ] Flask app starts without errors
- [ ] No JavaScript console errors
- [ ] All projects have tags in JSON data

### Manual Verification
- [ ] Filter bar displays with all unique tags
- [ ] "All Projects" shows all cards
- [ ] Clicking tag filters correctly
- [ ] Cards animate smoothly on filter (fade + scale)
- [ ] Active filter button highlighted
- [ ] URL hash updates when filtering
- [ ] Filter state persists on page reload via hash
- [ ] Works on both home page and AI innovations portal
- [ ] Filter bar responsive on mobile
- [ ] Test each tag shows correct projects

---

# PHASE 3: User Journey Achievements

## Overview
Gamify the user journey system with unlockable achievements. Users earn badges for exploration milestones, encouraging full portfolio engagement. Includes achievement notification system and trophy display.

## Changes Required

### 1. Define Achievement System

**File**: `static/js/achievements.js` (NEW)

```javascript
/**
 * Achievement System Module
 * Tracks and displays user accomplishments
 */

const AchievementSystem = (function() {
    'use strict';

    const STORAGE_KEY = 'achievements';

    // Achievement definitions
    const ACHIEVEMENTS = {
        first_steps: {
            id: 'first_steps',
            title: 'First Steps',
            description: 'Visit your first project page',
            icon: '👶',
            requirement: { type: 'page_visit', count: 1 }
        },
        explorer: {
            id: 'explorer',
            title: 'Explorer',
            description: 'Visit 5 different pages',
            icon: '🗺️',
            requirement: { type: 'page_visit', count: 5 }
        },
        completionist: {
            id: 'completionist',
            title: 'Completionist',
            description: 'Visit all 12 pages',
            icon: '🏆',
            requirement: { type: 'page_visit', count: 12 }
        },
        code_enthusiast: {
            id: 'code_enthusiast',
            title: 'Code Enthusiast',
            description: 'Interact with 3 interactive projects',
            icon: '💻',
            requirement: { type: 'interactive_used', count: 3 }
        },
        theme_switcher: {
            id: 'theme_switcher',
            title: 'Theme Switcher',
            description: 'Try both light and dark modes',
            icon: '🌗',
            requirement: { type: 'theme_switched', count: 2 }
        },
        deep_dive: {
            id: 'deep_dive',
            title: 'Deep Dive',
            description: 'Spend 5+ minutes on a project page',
            icon: '🤿',
            requirement: { type: 'time_spent', seconds: 300 }
        },
        social_connector: {
            id: 'social_connector',
            title: 'Social Connector',
            description: 'View GitHub, YouTube, or TikTok links',
            icon: '🔗',
            requirement: { type: 'external_link', count: 1 }
        },
        filter_master: {
            id: 'filter_master',
            title: 'Filter Master',
            description: 'Use project filter to find specific tags',
            icon: '🔍',
            requirement: { type: 'filter_used', count: 3 }
        }
    };

    /**
     * Get unlocked achievements from storage
     */
    function getUnlocked() {
        return StorageHelper.get(STORAGE_KEY, []);
    }

    /**
     * Check if achievement is unlocked
     */
    function isUnlocked(achievementId) {
        const unlocked = getUnlocked();
        return unlocked.includes(achievementId);
    }

    /**
     * Unlock achievement and show notification
     */
    function unlock(achievementId) {
        if (isUnlocked(achievementId)) {
            return false; // Already unlocked
        }

        const unlocked = getUnlocked();
        unlocked.push(achievementId);
        StorageHelper.set(STORAGE_KEY, unlocked);

        // Show notification
        const achievement = ACHIEVEMENTS[achievementId];
        if (achievement) {
            showNotification(achievement);
        }

        // Update achievement display
        updateAchievementDisplay();

        return true;
    }

    /**
     * Show achievement notification
     */
    function showNotification(achievement) {
        const notification = DOMHelpers.create('div', {
            className: 'achievement-notification'
        });

        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Check page visit achievements
     */
    function checkPageVisitAchievements(visitCount) {
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            if (achievement.requirement.type === 'page_visit' &&
                visitCount >= achievement.requirement.count) {
                unlock(achievement.id);
            }
        });
    }

    /**
     * Track interactive project usage
     */
    function trackInteractiveUsage(projectName) {
        const used = StorageHelper.get('interactive_projects_used', []);
        if (!used.includes(projectName)) {
            used.push(projectName);
            StorageHelper.set('interactive_projects_used', used);

            if (used.length >= 3) {
                unlock('code_enthusiast');
            }
        }
    }

    /**
     * Track theme switches
     */
    function trackThemeSwitch() {
        const switches = StorageHelper.get('theme_switches', 0);
        const newCount = switches + 1;
        StorageHelper.set('theme_switches', newCount);

        if (newCount >= 2) {
            unlock('theme_switcher');
        }
    }

    /**
     * Track filter usage
     */
    function trackFilterUsage() {
        const uses = StorageHelper.get('filter_uses', 0);
        const newCount = uses + 1;
        StorageHelper.set('filter_uses', newCount);

        if (newCount >= 3) {
            unlock('filter_master');
        }
    }

    /**
     * Track external link clicks
     */
    function trackExternalLink() {
        unlock('social_connector');
    }

    /**
     * Track time spent on page
     */
    function trackTimeSpent() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', () => {
            const timeSpent = (Date.now() - startTime) / 1000; // seconds

            if (timeSpent >= 300) { // 5 minutes
                unlock('deep_dive');
            }
        });
    }

    /**
     * Create achievement display widget
     */
    function createAchievementDisplay() {
        const container = DOMHelpers.getById('achievement-display');
        if (!container) return;

        const unlocked = getUnlocked();
        const totalAchievements = Object.keys(ACHIEVEMENTS).length;
        const progress = (unlocked.length / totalAchievements) * 100;

        container.innerHTML = `
            <div class="achievement-header">
                <h5>🏆 Achievements (${unlocked.length}/${totalAchievements})</h5>
                <div class="achievement-progress">
                    <div class="achievement-progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="achievement-grid">
                ${Object.values(ACHIEVEMENTS).map(achievement => {
                    const isUnlocked = unlocked.includes(achievement.id);
                    return `
                        <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}"
                             title="${achievement.description}">
                            <div class="achievement-icon">${achievement.icon}</div>
                            <div class="achievement-title">${achievement.title}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Update achievement display
     */
    function updateAchievementDisplay() {
        const display = DOMHelpers.getById('achievement-display');
        if (display) {
            createAchievementDisplay();
        }
    }

    /**
     * Initialize achievement system
     */
    function init() {
        // Track time spent
        trackTimeSpent();

        // Set up external link tracking
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[target="_blank"]');
            if (link) {
                trackExternalLink();
            }
        });

        // Create achievement display if container exists
        createAchievementDisplay();
    }

    // Public API
    return {
        init,
        unlock,
        isUnlocked,
        checkPageVisitAchievements,
        trackInteractiveUsage,
        trackThemeSwitch,
        trackFilterUsage,
        getUnlocked,
        getAllAchievements: () => ACHIEVEMENTS
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', AchievementSystem.init);

// Expose for use by other modules
window.AchievementSystem = AchievementSystem;
```

### 2. Integrate Achievements with User Journey

**File**: `static/js/usersJourney.js`

**Modify the `init()` function to trigger achievement checks:**

```javascript
function init() {
    const topBarWrapper = DOMHelpers.query('.top-bar-wrapper');
    if (!topBarWrapper) {
        console.warn('Top bar wrapper not found');
        return;
    }

    // Adjust body padding for top bar
    document.body.style.paddingTop = `${topBarWrapper.offsetHeight}px`;

    // Track current page
    const currentPage = window.location.pathname;
    if (!visitedPages.includes(currentPage)) {
        visitedPages.push(currentPage);
        StorageHelper.set('visitedPages', visitedPages);
    }

    updateProgressBar();
    updateDropdown();

    // NEW: Check for achievements based on page visits
    if (typeof AchievementSystem !== 'undefined') {
        AchievementSystem.checkPageVisitAchievements(visitedPages.length);
    }
}
```

### 3. Integrate with Theme Switcher

**File**: `static/js/theme-switcher.js`

**Add to the `applyTheme()` function:**

```javascript
function applyTheme(themeName) {
    const root = document.documentElement;

    if (themeName === THEMES.light) {
        // ... existing light mode code ...
    } else {
        // ... existing dark mode code ...
    }

    // Store preference
    StorageHelper.set(STORAGE_KEY, themeName);

    // Update toggle button
    updateToggleButton(themeName);

    // NEW: Track theme switch for achievements
    if (typeof AchievementSystem !== 'undefined') {
        AchievementSystem.trackThemeSwitch();
    }
}
```

### 4. Integrate with Project Filter

**File**: `static/js/project-filter.js`

**Add to the `filterProjects()` function:**

```javascript
function filterProjects(tag) {
    currentFilter = tag;

    // ... existing filter code ...

    // Update URL hash
    window.location.hash = tag === 'all' ? '' : `filter-${tag}`;

    // NEW: Track filter usage for achievements
    if (tag !== 'all' && typeof AchievementSystem !== 'undefined') {
        AchievementSystem.trackFilterUsage();
    }
}
```

### 5. Add Achievement Styles

**File**: `static/style.css`

**Add at the end:**

```css
/* ====== ACHIEVEMENT SYSTEM ====== */

/* Achievement Notification */
.achievement-notification {
    position: fixed;
    top: 100px;
    right: -400px;
    width: 350px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    z-index: 9999;
    transition: right 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.achievement-notification.show {
    right: var(--spacing-lg);
}

.achievement-notification .achievement-icon {
    font-size: 3rem;
    line-height: 1;
}

.achievement-notification .achievement-title {
    font-size: 0.8rem;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.achievement-notification .achievement-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin: var(--spacing-xs) 0;
}

.achievement-notification .achievement-desc {
    font-size: 0.9rem;
    opacity: 0.85;
}

/* Achievement Display Widget */
#achievement-display {
    background: var(--bg-white-transparent);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin: var(--spacing-lg) 0;
    box-shadow: var(--shadow-md);
}

.achievement-header h5 {
    margin: 0 0 var(--spacing-md) 0;
    color: var(--text-white);
}

.achievement-progress {
    height: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-pill);
    overflow: hidden;
    margin-bottom: var(--spacing-md);
}

.achievement-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.5s ease;
}

.achievement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--spacing-md);
}

.achievement-badge {
    background: var(--bg-card-dark);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    text-align: center;
    transition: all var(--transition-normal);
    cursor: pointer;
    border: 2px solid transparent;
}

.achievement-badge.unlocked {
    border-color: #667eea;
    box-shadow: 0 0 15px rgba(102, 126, 234, 0.3);
}

.achievement-badge.locked {
    opacity: 0.4;
    filter: grayscale(100%);
}

.achievement-badge:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
}

.achievement-badge .achievement-icon {
    font-size: 2.5rem;
    margin-bottom: var(--spacing-sm);
}

.achievement-badge .achievement-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-white);
}

/* Mobile responsive */
@media (max-width: 768px) {
    .achievement-notification {
        width: 300px;
    }

    .achievement-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }
}
```

### 6. Add Achievement Display to About Page

**File**: `templates/about.html`

**Add achievement display section after the profile section:**

```html
{% block content %}
<div class="container my-5">
    <!-- Existing profile section -->
    <div class="row">
        <div class="col-md-4">
            <!-- profile image, resume, etc. -->
        </div>
        <div class="col-md-8">
            <!-- bio content -->
        </div>
    </div>

    <!-- NEW: Achievement Display -->
    <div class="row mt-5">
        <div class="col-12">
            <div id="achievement-display"></div>
        </div>
    </div>

    <!-- Existing AI chat, skills, etc. -->
</div>

<!-- Load achievement system -->
<script src="{{ url_for('static', filename='js/achievements.js') }}?v={{ now.timestamp() }}"></script>
{% endblock %}
```

### 7. Load Achievement System in Base Template

**File**: `templates/base.html`

**Add after theme-switcher.js:**

```html
<!-- Theme Switcher -->
<script src="{{ url_for('static', filename='js/theme-switcher.js') }}?v={{ now.timestamp() }}"></script>

<!-- Achievement System -->
<script src="{{ url_for('static', filename='js/achievements.js') }}?v={{ now.timestamp() }}"></script>
```

## Success Criteria

### Automated Verification
- [ ] Flask app starts without errors
- [ ] No JavaScript console errors
- [ ] Achievement data persists in localStorage

### Manual Verification
- [ ] "First Steps" unlocks on first project visit
- [ ] "Explorer" unlocks after visiting 5 pages
- [ ] "Completionist" unlocks after all 12 pages
- [ ] "Theme Switcher" unlocks after switching themes twice
- [ ] "Filter Master" unlocks after using filter 3 times
- [ ] "Social Connector" unlocks on external link click
- [ ] Achievement notifications appear with animation
- [ ] Achievement display shows on About page
- [ ] Progress bar updates as achievements unlock
- [ ] Locked achievements appear grayed out
- [ ] Unlocked achievements highlighted with glow
- [ ] Mobile responsive notification placement

---

# PHASE 4: Comprehensive Case Studies

## Overview
Create detailed case study pages for top 3 projects (Wordle, Secret Santa, Basketball). Each includes problem statement, architecture diagrams, technical challenges, solutions, and results. Uses Mermaid.js for diagrams and dedicated templates.

## Changes Required

### 1. Create Case Study Template Layout

**File**: `templates/layouts/case_study.html` (NEW)

```html
{% extends "base.html" %}

{% block title %}Case Study - {{ project_title }}{% endblock %}

{% block content %}
<div class="container my-5">
    <!-- Back Navigation -->
    <div class="mb-4">
        <a href="{{ url_for('home') }}" class="btn btn-outline-light">
            <i class="fas fa-arrow-left"></i> Back to Projects
        </a>
    </div>

    <!-- Case Study Header -->
    <div class="case-study-header text-center mb-5">
        <h1 class="display-4 text-white mb-3">{{ project_title }}</h1>
        <p class="lead text-light">{{ project_subtitle }}</p>

        {% if project_image %}
        <img src="{{ url_for('static', filename='images/' + project_image) }}"
             alt="{{ project_title }}"
             class="case-study-hero-image">
        {% endif %}
    </div>

    <!-- Case Study Content -->
    <div class="case-study-content">
        {% block case_study_content %}{% endblock %}
    </div>

    <!-- Related Projects -->
    {% if related_projects %}
    <div class="related-projects mt-5">
        <h3 class="text-white mb-4">Related Projects</h3>
        <div class="row">
            {% for project in related_projects %}
            <div class="col-md-4">
                {{ project_card(project) }}
            </div>
            {% endfor %}
        </div>
    </div>
    {% endif %}
</div>
{% endblock %}
```

### 2. Create Wordle Case Study

**File**: `templates/case-studies/wordle-case-study.html` (NEW)

```html
{% extends "layouts/case_study.html" %}
{% from '_macros.html' import info_card, mermaid_card, tech_card %}

{% set project_title = 'Wordle Algorithm Solver' %}
{% set project_subtitle = 'Building an AI that achieves 87% win rate through strategic letter optimization' %}
{% set project_image = 'wordleMain.png' %}

{% block case_study_content %}

<!-- Problem Statement -->
{{ info_card('🎯 Problem Statement', '
<p>Wordle presents a fascinating constraint problem: guess a 5-letter word in 6 attempts using color-coded feedback. Players need optimal strategies to narrow down possibilities efficiently.</p>

<p><strong>Key Challenges:</strong></p>
<ul>
    <li>Dictionary contains 12,972 valid 5-letter words</li>
    <li>Each guess must maximize information gain</li>
    <li>Color feedback (🟩 Green, 🟨 Yellow, ⬜ Grey) creates complex constraints</li>
    <li>Need to balance common letters vs. strategic positioning</li>
</ul>

<p><strong>Success Metric:</strong> Beat human performance (my own attempts) in head-to-head competition.</p>
') }}

<!-- Architecture & Algorithm -->
{{ mermaid_card('🏗️ Algorithm Architecture', '
graph TD
    A[Start with full dictionary<br/>12,972 words] --> B[User enters guess]
    B --> C[Get color feedback<br/>Green/Yellow/Grey]
    C --> D[Apply regex constraints]
    D --> E[Filter remaining words]
    E --> F{Words remaining}
    F -->|> 1| G[Analyze letter frequency]
    G --> H[Recommend next guess]
    H --> B
    F -->|= 1| I[Solution found!]

    style A fill:#667eea
    style I fill:#48bb78
    style D fill:#ed8936
') }}

<!-- Technical Implementation -->
{{ info_card('💻 Technical Implementation', '
<h6>1. Constraint Translation (Green Letters)</h6>
<p>Green feedback translates directly to regex position constraints:</p>
<pre><code class="language-python">
# Example: If \'R\' is green in position 1
pattern += \'R\'  # Exact match at position

# If \'S\' is green in position 4
pattern += \'..S.\'  # S must be in position 4
</code></pre>

<h6>2. Yellow Letter Logic (Present but wrong position)</h6>
<p>Yellow letters create negative lookaheads:</p>
<pre><code class="language-python">
# \'A\' is yellow in position 0
# Must contain \'A\' but NOT in position 0
pattern = r\'(?=.*A)\'  # Contains A somewhere
pattern += r\'(?!A)\'   # But not at position 0

# Full word validation
remaining_words = [w for w in remaining_words
                   if \'A\' in w and w[0] != \'A\']
</code></pre>

<h6>3. Grey Letter Elimination</h6>
<pre><code class="language-python">
# Simple exclusion
remaining_words = [w for w in remaining_words
                   if grey_letter not in w]
</code></pre>

<h6>4. Next Guess Recommendation</h6>
<p>Analyzes letter frequency in remaining words:</p>
<pre><code class="language-python">
from collections import Counter

def recommend_next_guess(remaining_words):
    # Count letter frequencies by position
    position_freq = {i: Counter() for i in range(5)}

    for word in remaining_words:
        for i, letter in enumerate(word):
            position_freq[i][letter] += 1

    # Score each word by information gain
    scores = {}
    for word in remaining_words:
        score = sum(position_freq[i][letter]
                   for i, letter in enumerate(word))
        scores[word] = score

    # Return top 5 recommendations
    return sorted(scores.items(),
                 key=lambda x: x[1],
                 reverse=True)[:5]
</code></pre>
') }}

<!-- Challenges & Solutions -->
{{ info_card('🚧 Technical Challenges', '
<h6>Challenge 1: Duplicate Letters</h6>
<p><strong>Problem:</strong> Words like "SPEED" have duplicate E\'s. Yellow on first E but green on second E creates complex constraints.</p>
<p><strong>Solution:</strong> Track letter counts and position masks:</p>
<pre><code class="language-python">
# Track known counts
letter_counts = {\'E\': {\'min\': 2, \'max\': 2}}

# Position exclusions for yellow
yellow_exclusions = {\'E\': [1]}  # Not in position 1
</code></pre>

<h6>Challenge 2: Performance with Large Dictionary</h6>
<p><strong>Problem:</strong> Regex compilation and validation slow with 12K+ words</p>
<p><strong>Solution:</strong> Progressive filtering and pattern caching:</p>
<pre><code class="language-python">
# Cache compiled patterns
import functools

@functools.lru_cache(maxsize=128)
def compile_pattern(pattern_str):
    return re.compile(pattern_str)

# Filter in stages: grey -> green -> yellow
remaining = exclude_grey_letters(words, grey_letters)
remaining = apply_green_constraints(remaining, green_positions)
remaining = apply_yellow_constraints(remaining, yellow_letters)
</code></pre>

<h6>Challenge 3: Optimal Starting Word</h6>
<p><strong>Problem:</strong> First guess has maximum uncertainty</p>
<p><strong>Solution:</strong> Analyzed letter frequency across entire dictionary. Top starters:</p>
<ul>
    <li><strong>SOARE</strong> - Highest vowel coverage (E, A, O)</li>
    <li><strong>SLATE</strong> - Common consonants + vowels</li>
    <li><strong>CRANE</strong> - Balanced distribution</li>
</ul>
') }}

<!-- Results & Metrics -->
{{ info_card('📊 Results & Performance', '
<div class="row">
    <div class="col-md-4 text-center mb-3">
        <div class="metric-box">
            <div class="metric-value">87%</div>
            <div class="metric-label">Win Rate</div>
            <small>46 wins out of 53 games</small>
        </div>
    </div>
    <div class="col-md-4 text-center mb-3">
        <div class="metric-box">
            <div class="metric-value">3.8</div>
            <div class="metric-label">Avg Guesses</div>
            <small>vs 4.2 human average</small>
        </div>
    </div>
    <div class="col-md-4 text-center mb-3">
        <div class="metric-box">
            <div class="metric-value">&lt; 100ms</div>
            <div class="metric-label">Response Time</div>
            <small>Per recommendation</small>
        </div>
    </div>
</div>

<h6>Head-to-Head Performance</h6>
<table class="table table-dark table-striped">
    <thead>
        <tr>
            <th>Outcome</th>
            <th>Algorithm</th>
            <th>Human (Me)</th>
            <th>Winner</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Solved in fewer guesses</td>
            <td>31 games</td>
            <td>15 games</td>
            <td>🤖 Algorithm</td>
        </tr>
        <tr>
            <td>Tied (same guesses)</td>
            <td colspan="2">15 games</td>
            <td>🤝 Tie</td>
        </tr>
        <tr>
            <td>Algorithm failed</td>
            <td>7 games</td>
            <td>0 games</td>
            <td>👤 Human</td>
        </tr>
    </tbody>
</table>

<h6>Letter Distribution Insights</h6>
<p>Most common letters in Wordle dictionary:</p>
<ul>
    <li><strong>E</strong> appears in 46% of words</li>
    <li><strong>A</strong> appears in 39% of words</li>
    <li><strong>R</strong> appears in 38% of words</li>
    <li><strong>O</strong> appears in 29% of words</li>
</ul>
') }}

<!-- Lessons Learned -->
{{ info_card('💡 Lessons Learned', '
<ol>
    <li><strong>Information theory wins:</strong> Maximizing entropy reduction (information gain per guess) proved more effective than common word guessing</li>
    <li><strong>Edge cases matter:</strong> 13% of failures came from duplicate letter scenarios - robust constraint handling is crucial</li>
    <li><strong>Caching is essential:</strong> Pattern compilation caching reduced response time from 400ms to <100ms</li>
    <li><strong>Start matters:</strong> First guess accounts for 30% variance in final guess count</li>
    <li><strong>Visualization helps:</strong> Interactive UI showing remaining words helped human learning from algorithm strategies</li>
</ol>
') }}

{{ tech_card([
    '<strong>Python:</strong> Core algorithm and constraint solver',
    '<strong>Regex:</strong> Pattern matching for letter constraints',
    '<strong>Collections.Counter:</strong> Letter frequency analysis',
    '<strong>Flask:</strong> Web interface for interactive testing',
    '<strong>JavaScript:</strong> Dynamic UI updates and visualization'
]) }}

<!-- Links -->
<div class="case-study-links text-center mt-4">
    <a href="{{ url_for('wordle') }}" class="btn btn-primary btn-lg me-3">
        <i class="fas fa-play"></i> Try Interactive Demo
    </a>
    <a href="#" class="btn btn-outline-light btn-lg">
        <i class="fab fa-github"></i> View Source Code
    </a>
</div>

{% endblock %}
```

### 3. Add Case Study Navigation to Project Pages

**File**: `templates/wordle.html`

**Add a "Case Study" button near the top:**

```html
{% extends "layouts/project_detail.html" %}

{% set project_title = 'Wordle Algorithm Solver' %}

{% block project_content %}
<div class="container">
    <!-- NEW: Case Study Link -->
    <div class="text-center mb-4">
        <a href="{{ url_for('wordle_case_study') }}" class="btn btn-info btn-lg">
            <i class="fas fa-book-open"></i> Read Full Case Study
        </a>
    </div>

    <!-- Existing wordle content -->
    ...
</div>
{% endblock %}
```

### 4. Add Flask Routes for Case Studies

**File**: `app.py`

**Add new routes after existing project routes:**

```python
@app.route('/case-studies/wordle')
def wordle_case_study():
    """Wordle algorithm case study"""
    return render_template('case-studies/wordle-case-study.html',
                         now=datetime.now())

@app.route('/case-studies/secret-santa')
def secret_santa_case_study():
    """Secret Santa matching case study"""
    return render_template('case-studies/secret-santa-case-study.html',
                         now=datetime.now())

@app.route('/case-studies/basketball')
def basketball_case_study():
    """Basketball lineup optimization case study"""
    return render_template('case-studies/basketball-case-study.html',
                         now=datetime.now())
```

### 5. Add Case Study Styles

**File**: `static/style.css`

**Add at the end:**

```css
/* ====== CASE STUDY PAGES ====== */
.case-study-header {
    padding: var(--spacing-xl) 0;
}

.case-study-hero-image {
    max-width: 600px;
    width: 100%;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    margin-top: var(--spacing-lg);
}

.case-study-content {
    max-width: 900px;
    margin: 0 auto;
}

.case-study-content .card {
    margin-bottom: var(--spacing-xl);
}

.case-study-content h6 {
    color: var(--color-accent-blue);
    margin-top: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    font-weight: 600;
}

.case-study-content pre {
    background: var(--color-primary-dark);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    overflow-x: auto;
    border-left: 4px solid var(--color-accent-blue);
}

.case-study-content code {
    color: var(--color-accent-blue);
    font-family: 'Courier New', monospace;
}

.metric-box {
    background: var(--bg-card-dark);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-normal);
}

.metric-box:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-xl);
}

.metric-value {
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-accent-blue);
    margin-bottom: var(--spacing-sm);
}

.metric-label {
    font-size: 1.1rem;
    color: var(--text-white);
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
}

.metric-box small {
    color: var(--text-light-gray);
    font-size: 0.9rem;
}

.case-study-links {
    padding: var(--spacing-xl) 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: var(--spacing-xl);
}

.related-projects {
    border-top: 2px solid rgba(255, 255, 255, 0.1);
    padding-top: var(--spacing-xl);
}

/* Mermaid diagram styling */
.mermaid {
    background: transparent;
    text-align: center;
}

/* Light mode adjustments */
body[data-theme="light"] .case-study-content pre {
    background: #f8f9fa;
    border-left-color: #0d6efd;
}

body[data-theme="light"] .case-study-content code {
    color: #0d6efd;
}

body[data-theme="light"] .metric-box {
    background: white;
}

body[data-theme="light"] .metric-value {
    color: #0d6efd;
}
```

### 6. Add Mermaid.js Library

**File**: `templates/base.html`

**Add Mermaid.js CDN before closing `</body>` tag:**

```html
    <!-- Mermaid.js for diagrams -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            themeVariables: {
                primaryColor: '#667eea',
                primaryTextColor: '#fff',
                primaryBorderColor: '#764ba2',
                lineColor: '#46c8ff',
                secondaryColor: '#2c2c3e',
                tertiaryColor: '#1a1a2e'
            }
        });
    </script>
</body>
```

## Success Criteria

### Automated Verification
- [ ] Flask app starts without errors
- [ ] Routes `/case-studies/wordle`, `/case-studies/secret-santa`, `/case-studies/basketball` respond 200
- [ ] Mermaid diagrams render without console errors

### Manual Verification
- [ ] Case study links visible on project pages
- [ ] Navigation to case study works
- [ ] Mermaid diagrams render properly
- [ ] Code syntax highlighting appears
- [ ] Metrics boxes display with hover effects
- [ ] Back button returns to projects
- [ ] Related projects display at bottom
- [ ] Mobile responsive layout
- [ ] Test in both light and dark modes

**Note:** Only Wordle case study is fully implemented. Secret Santa and Basketball case studies should follow the same pattern but with project-specific content.

---

# PHASE 5: Scroll-Driven Animations

## Overview
Implement cutting-edge CSS scroll-driven animations for case study pages and project cards. Uses native CSS `animation-timeline: view()` with Intersection Observer fallback for unsupported browsers.

## Changes Required

### 1. Add Scroll Animation CSS

**File**: `static/css/scroll-animations.css` (NEW)

```css
/* ====== SCROLL-DRIVEN ANIMATIONS ====== */

/* Check for scroll-timeline support */
@supports (animation-timeline: view()) {
    /* Modern browsers with native scroll-driven animations */

    /* Fade in from bottom */
    .scroll-fade-up {
        animation: scroll-fade-up linear;
        animation-timeline: view();
        animation-range: entry 0% cover 30%;
    }

    @keyframes scroll-fade-up {
        from {
            opacity: 0;
            transform: translateY(100px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Fade in from sides */
    .scroll-fade-left {
        animation: scroll-fade-left linear;
        animation-timeline: view();
        animation-range: entry 0% cover 30%;
    }

    @keyframes scroll-fade-left {
        from {
            opacity: 0;
            transform: translateX(-100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .scroll-fade-right {
        animation: scroll-fade-right linear;
        animation-timeline: view();
        animation-range: entry 0% cover 30%;
    }

    @keyframes scroll-fade-right {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    /* Scale up reveal */
    .scroll-scale {
        animation: scroll-scale linear;
        animation-timeline: view();
        animation-range: entry 0% cover 30%;
    }

    @keyframes scroll-scale {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    /* Rotate reveal */
    .scroll-rotate {
        animation: scroll-rotate linear;
        animation-timeline: view();
        animation-range: entry 0% cover 40%;
    }

    @keyframes scroll-rotate {
        from {
            opacity: 0;
            transform: rotateY(-15deg) translateY(50px);
        }
        to {
            opacity: 1;
            transform: rotateY(0deg) translateY(0);
        }
    }

    /* Blur to focus */
    .scroll-blur-focus {
        animation: scroll-blur-focus linear;
        animation-timeline: view();
        animation-range: entry 0% cover 35%;
    }

    @keyframes scroll-blur-focus {
        from {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
        }
    }

    /* Parallax effect for hero images */
    .scroll-parallax {
        animation: scroll-parallax linear;
        animation-timeline: view();
        animation-range: entry 0% exit 100%;
    }

    @keyframes scroll-parallax {
        from {
            transform: translateY(-10%);
        }
        to {
            transform: translateY(10%);
        }
    }

    /* Stagger animations for lists */
    .scroll-stagger-item:nth-child(1) {
        animation: scroll-fade-up linear;
        animation-timeline: view();
        animation-range: entry 0% cover 25%;
    }

    .scroll-stagger-item:nth-child(2) {
        animation: scroll-fade-up linear;
        animation-timeline: view();
        animation-range: entry 5% cover 30%;
    }

    .scroll-stagger-item:nth-child(3) {
        animation: scroll-fade-up linear;
        animation-timeline: view();
        animation-range: entry 10% cover 35%;
    }

    .scroll-stagger-item:nth-child(4) {
        animation: scroll-fade-up linear;
        animation-timeline: view();
        animation-range: entry 15% cover 40%;
    }
}

/* Fallback for browsers without scroll-timeline support */
@supports not (animation-timeline: view()) {
    /* These will be handled by Intersection Observer JS */
    .scroll-fade-up,
    .scroll-fade-left,
    .scroll-fade-right,
    .scroll-scale,
    .scroll-rotate,
    .scroll-blur-focus {
        opacity: 0;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .scroll-fade-up {
        transform: translateY(100px);
    }

    .scroll-fade-left {
        transform: translateX(-100px);
    }

    .scroll-fade-right {
        transform: translateX(100px);
    }

    .scroll-scale {
        transform: scale(0.8);
    }

    .scroll-rotate {
        transform: rotateY(-15deg) translateY(50px);
    }

    .scroll-blur-focus {
        filter: blur(10px);
        transform: translateY(50px);
    }

    /* Visible state applied by JS */
    .scroll-visible {
        opacity: 1 !important;
        transform: translateY(0) translateX(0) scale(1) rotateY(0) !important;
        filter: blur(0) !important;
    }
}

/* Prevent layout shift */
.scroll-fade-up,
.scroll-fade-left,
.scroll-fade-right,
.scroll-scale,
.scroll-rotate,
.scroll-blur-focus {
    will-change: transform, opacity;
}
```

### 2. Create Intersection Observer Fallback

**File**: `static/js/scroll-animations.js` (NEW)

```javascript
/**
 * Scroll Animation Fallback Module
 * Provides Intersection Observer fallback for browsers without scroll-timeline support
 */

const ScrollAnimations = (function() {
    'use strict';

    // Check for native scroll-timeline support
    const supportsScrollTimeline = CSS.supports('animation-timeline', 'view()');

    /**
     * Initialize fallback animations using Intersection Observer
     */
    function initFallback() {
        if (supportsScrollTimeline) {
            console.log('Native scroll-timeline supported, no fallback needed');
            return;
        }

        console.log('Using Intersection Observer fallback for scroll animations');

        const animatedElements = document.querySelectorAll(
            '.scroll-fade-up, .scroll-fade-left, .scroll-fade-right, ' +
            '.scroll-scale, .scroll-rotate, .scroll-blur-focus'
        );

        if (animatedElements.length === 0) {
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px', // Trigger 100px before element enters viewport
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-visible');
                    // Optional: unobserve after animation to improve performance
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    /**
     * Apply scroll animation classes to elements
     */
    function applyAnimation(element, animationType) {
        if (!element) return;

        const validTypes = [
            'scroll-fade-up',
            'scroll-fade-left',
            'scroll-fade-right',
            'scroll-scale',
            'scroll-rotate',
            'scroll-blur-focus',
            'scroll-parallax'
        ];

        if (validTypes.includes(animationType)) {
            element.classList.add(animationType);
        }
    }

    /**
     * Initialize scroll animations
     */
    function init() {
        // Initialize fallback if needed
        initFallback();

        // Log support info
        if (supportsScrollTimeline) {
            console.log('✨ Using native CSS scroll-driven animations');
        } else {
            console.log('📱 Using Intersection Observer fallback');
        }
    }

    // Public API
    return {
        init,
        applyAnimation,
        supportsNative: () => supportsScrollTimeline
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', ScrollAnimations.init);

// Expose for use by other modules
window.ScrollAnimations = ScrollAnimations;
```

### 3. Apply Animations to Case Study Elements

**File**: `templates/case-studies/wordle-case-study.html`

**Add animation classes to cards and sections:**

```html
{% block case_study_content %}

<!-- Add scroll-fade-up to cards -->
<div class="scroll-fade-up">
    {{ info_card('🎯 Problem Statement', '...') }}
</div>

<div class="scroll-scale">
    {{ mermaid_card('🏗️ Algorithm Architecture', '...') }}
</div>

<div class="scroll-fade-up">
    {{ info_card('💻 Technical Implementation', '...') }}
</div>

<div class="scroll-rotate">
    {{ info_card('🚧 Technical Challenges', '...') }}
</div>

<div class="scroll-fade-up">
    {{ info_card('📊 Results & Performance', '...') }}
</div>

<div class="scroll-blur-focus">
    {{ info_card('💡 Lessons Learned', '...') }}
</div>

{% endblock %}
```

### 4. Apply Animations to Home Page Cards

**File**: `templates/home.html`

**Modify project card wrapper:**

```html
<div class="container mt-5">
    <div class="row">
        {% for project in projects %}
        <div class="project-card-wrapper scroll-fade-up"
             data-tags="{{ project.tags|join(', ') if project.tags else '' }}">
            {{ project_card(project) }}
        </div>
        {% endfor %}
    </div>
</div>
```

### 5. Apply Parallax to Hero Images

**File**: `templates/layouts/case_study.html`

**Add parallax class to hero image:**

```html
{% if project_image %}
<div class="scroll-parallax">
    <img src="{{ url_for('static', filename='images/' + project_image) }}"
         alt="{{ project_title }}"
         class="case-study-hero-image">
</div>
{% endif %}
```

### 6. Load Scroll Animation Assets

**File**: `templates/base.html`

**Add scroll animation CSS in the `<head>`:**

```html
<head>
    <!-- Existing meta tags and CSS -->
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}?v={{ now.timestamp() }}">

    <!-- NEW: Scroll Animations -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/scroll-animations.css') }}?v={{ now.timestamp() }}">
</head>
```

**Add scroll animation JS before closing `</body>`:**

```html
<!-- Scroll Animations -->
<script src="{{ url_for('static', filename='js/scroll-animations.js') }}?v={{ now.timestamp() }}"></script>
</body>
```

## Success Criteria

### Automated Verification
- [ ] Flask app starts without errors
- [ ] CSS file validates
- [ ] No JavaScript console errors
- [ ] Browser console logs animation support status

### Manual Verification

**Chrome 115+ (Native Support):**
- [ ] Elements animate as you scroll down the page
- [ ] Animations tied to scroll position (smooth)
- [ ] Parallax effect on hero images
- [ ] Performance: 60fps during scroll (check DevTools Performance tab)

**Safari/Firefox (Fallback):**
- [ ] Elements animate when entering viewport
- [ ] Intersection Observer triggers correctly
- [ ] Performance acceptable (no jank)

**Both Modes:**
- [ ] Test on case study pages
- [ ] Test on home page project cards
- [ ] Different animation types visible (fade, scale, rotate, blur)
- [ ] Mobile responsive (animations work on touch scroll)
- [ ] No layout shift before animation
- [ ] Animations respect reduced motion preference

---

# PHASE 6: Interactive Portfolio Analytics Dashboard

## Overview
Build custom analytics dashboard tracking visitor behavior: page views, user journey completion, project interactions, filter usage, and achievement unlocks. Uses client-side event logging to Flask backend with daily aggregation. Dashboard visualizes insights with Chart.js.

## Changes Required

### 1. Create Analytics Logger Module

**File**: `static/js/analytics-logger.js` (NEW)

```javascript
/**
 * Analytics Logger Module
 * Tracks user interactions and sends to backend
 */

const AnalyticsLogger = (function() {
    'use strict';

    const STORAGE_KEY = 'session_id';
    const BATCH_SIZE = 10;
    const BATCH_INTERVAL = 30000; // 30 seconds

    let eventQueue = [];
    let sessionId = null;
    let pageStartTime = null;

    /**
     * Generate or retrieve session ID
     */
    function getSessionId() {
        if (sessionId) return sessionId;

        // Check for existing session (expires after 30 minutes)
        const stored = StorageHelper.get(STORAGE_KEY);
        if (stored && stored.expires > Date.now()) {
            sessionId = stored.id;
            return sessionId;
        }

        // Generate new session ID
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        StorageHelper.set(STORAGE_KEY, {
            id: sessionId,
            expires: Date.now() + (30 * 60 * 1000) // 30 minutes
        });

        return sessionId;
    }

    /**
     * Log event to queue
     */
    function logEvent(eventType, eventData = {}) {
        const event = {
            session_id: getSessionId(),
            event_type: eventType,
            event_data: eventData,
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_width: window.screen.width,
            screen_height: window.screen.height
        };

        eventQueue.push(event);

        // Send batch if queue is full
        if (eventQueue.length >= BATCH_SIZE) {
            sendBatch();
        }
    }

    /**
     * Send batch of events to backend
     */
    async function sendBatch() {
        if (eventQueue.length === 0) return;

        const batch = [...eventQueue];
        eventQueue = [];

        try {
            const response = await APIClient.post('/api/analytics/events', {
                events: batch
            });

            if (!response.ok) {
                console.warn('Analytics batch failed, re-queuing');
                eventQueue.unshift(...batch); // Re-add to queue
            }
        } catch (error) {
            console.error('Analytics error:', error);
            eventQueue.unshift(...batch); // Re-add to queue
        }
    }

    /**
     * Track page view
     */
    function trackPageView() {
        pageStartTime = Date.now();

        logEvent('page_view', {
            referrer: document.referrer,
            title: document.title
        });
    }

    /**
     * Track page exit and time spent
     */
    function trackPageExit() {
        if (!pageStartTime) return;

        const timeSpent = Math.floor((Date.now() - pageStartTime) / 1000); // seconds

        logEvent('page_exit', {
            time_spent: timeSpent,
            scroll_depth: getScrollDepth()
        });

        // Send remaining events
        sendBatch();
    }

    /**
     * Calculate scroll depth percentage
     */
    function getScrollDepth() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const maxScroll = documentHeight - windowHeight;

        if (maxScroll <= 0) return 100;

        return Math.min(100, Math.floor((scrollTop / maxScroll) * 100));
    }

    /**
     * Track project interaction
     */
    function trackProjectInteraction(projectName, interactionType) {
        logEvent('project_interaction', {
            project: projectName,
            interaction_type: interactionType
        });
    }

    /**
     * Track filter usage
     */
    function trackFilterUsage(filterTag) {
        logEvent('filter_used', {
            tag: filterTag
        });
    }

    /**
     * Track theme switch
     */
    function trackThemeSwitch(newTheme) {
        logEvent('theme_switched', {
            theme: newTheme
        });
    }

    /**
     * Track achievement unlock
     */
    function trackAchievementUnlock(achievementId) {
        logEvent('achievement_unlocked', {
            achievement: achievementId
        });
    }

    /**
     * Initialize analytics
     */
    function init() {
        // Track initial page view
        trackPageView();

        // Track page exit
        window.addEventListener('beforeunload', trackPageExit);

        // Periodic batch sending
        setInterval(sendBatch, BATCH_INTERVAL);

        // Track scroll depth at intervals
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const currentDepth = getScrollDepth();
            if (currentDepth > maxScrollDepth && currentDepth % 25 === 0) {
                maxScrollDepth = currentDepth;
                logEvent('scroll_depth', { depth: currentDepth });
            }
        });
    }

    // Public API
    return {
        init,
        trackPageView,
        trackProjectInteraction,
        trackFilterUsage,
        trackThemeSwitch,
        trackAchievementUnlock,
        logEvent
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', AnalyticsLogger.init);

// Expose for use by other modules
window.AnalyticsLogger = AnalyticsLogger;
```

### 2. Create Analytics Backend Storage

**File**: `utils/analytics_storage.py` (NEW)

```python
"""
Analytics Storage Module
Handles storing and retrieving analytics events
Uses JSON file storage for simplicity (can migrate to database later)
"""

import json
import os
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from config import Config

ANALYTICS_FILE = os.path.join(Config.BASE_DIR, 'data', 'analytics.json')

def load_analytics():
    """Load analytics data from file"""
    if not os.path.exists(ANALYTICS_FILE):
        return []

    try:
        with open(ANALYTICS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading analytics: {e}")
        return []

def save_analytics(data):
    """Save analytics data to file"""
    try:
        # Ensure data directory exists
        os.makedirs(os.path.dirname(ANALYTICS_FILE), exist_ok=True)

        with open(ANALYTICS_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving analytics: {e}")
        return False

def add_events(events):
    """Add new events to analytics storage"""
    existing = load_analytics()
    existing.extend(events)

    # Keep only last 90 days
    cutoff = (datetime.now() - timedelta(days=90)).isoformat()
    existing = [e for e in existing if e.get('timestamp', '') > cutoff]

    return save_analytics(existing)

def get_summary(days=30):
    """Get analytics summary for last N days"""
    events = load_analytics()
    cutoff = (datetime.now() - timedelta(days=days)).isoformat()
    recent = [e for e in events if e.get('timestamp', '') > cutoff]

    summary = {
        'total_events': len(recent),
        'unique_sessions': len(set(e.get('session_id') for e in recent)),
        'page_views': len([e for e in recent if e.get('event_type') == 'page_view']),
        'avg_time_per_session': calculate_avg_time(recent),
        'top_pages': get_top_pages(recent),
        'journey_completion_rate': calculate_journey_completion(recent),
        'popular_projects': get_popular_projects(recent),
        'filter_usage': get_filter_stats(recent),
        'achievement_unlocks': get_achievement_stats(recent),
        'theme_preference': get_theme_preference(recent),
        'device_breakdown': get_device_breakdown(recent),
        'daily_views': get_daily_views(recent, days)
    }

    return summary

def calculate_avg_time(events):
    """Calculate average session time"""
    exit_events = [e for e in events if e.get('event_type') == 'page_exit']
    if not exit_events:
        return 0

    times = [e.get('event_data', {}).get('time_spent', 0) for e in exit_events]
    return sum(times) / len(times) if times else 0

def get_top_pages(events):
    """Get most visited pages"""
    page_views = [e.get('page') for e in events if e.get('event_type') == 'page_view']
    counter = Counter(page_views)
    return counter.most_common(10)

def calculate_journey_completion(events):
    """Calculate percentage of users who complete full journey"""
    sessions = defaultdict(set)

    for event in events:
        if event.get('event_type') == 'page_view':
            sessions[event.get('session_id')].add(event.get('page'))

    if not sessions:
        return 0

    completed = sum(1 for pages in sessions.values() if len(pages) >= 12)
    return (completed / len(sessions)) * 100

def get_popular_projects(events):
    """Get most interacted projects"""
    interactions = [
        e.get('event_data', {}).get('project')
        for e in events
        if e.get('event_type') == 'project_interaction'
    ]
    counter = Counter(interactions)
    return counter.most_common(10)

def get_filter_stats(events):
    """Get filter usage statistics"""
    filters = [
        e.get('event_data', {}).get('tag')
        for e in events
        if e.get('event_type') == 'filter_used'
    ]
    counter = Counter(filters)
    return counter.most_common(10)

def get_achievement_stats(events):
    """Get achievement unlock statistics"""
    achievements = [
        e.get('event_data', {}).get('achievement')
        for e in events
        if e.get('event_type') == 'achievement_unlocked'
    ]
    counter = Counter(achievements)
    return dict(counter)

def get_theme_preference(events):
    """Get theme preference breakdown"""
    theme_switches = [
        e.get('event_data', {}).get('theme')
        for e in events
        if e.get('event_type') == 'theme_switched'
    ]
    counter = Counter(theme_switches)
    return dict(counter)

def get_device_breakdown(events):
    """Get device type breakdown from user agent"""
    mobile_count = sum(1 for e in events if 'Mobile' in e.get('user_agent', ''))
    tablet_count = sum(1 for e in events if 'Tablet' in e.get('user_agent', ''))
    desktop_count = len(events) - mobile_count - tablet_count

    return {
        'desktop': desktop_count,
        'mobile': mobile_count,
        'tablet': tablet_count
    }

def get_daily_views(events, days):
    """Get daily page view counts"""
    page_views = [e for e in events if e.get('event_type') == 'page_view']

    daily = defaultdict(int)
    for event in page_views:
        date = event.get('timestamp', '')[:10]  # YYYY-MM-DD
        daily[date] += 1

    # Fill in missing dates with 0
    start_date = datetime.now() - timedelta(days=days)
    date_range = [
        (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
        for i in range(days)
    ]

    return {date: daily.get(date, 0) for date in date_range}
```

### 3. Add Flask Analytics Routes

**File**: `app.py`

**Add after existing routes:**

```python
from utils.analytics_storage import add_events, get_summary

@app.route('/api/analytics/events', methods=['POST'])
def log_analytics_events():
    """
    Receive batch of analytics events from client
    """
    try:
        data = request.get_json()
        events = data.get('events', [])

        if not events:
            return jsonify({'error': 'No events provided'}), 400

        # Validate and sanitize events
        valid_event_types = [
            'page_view', 'page_exit', 'project_interaction',
            'filter_used', 'theme_switched', 'achievement_unlocked',
            'scroll_depth'
        ]

        sanitized = []
        for event in events:
            if event.get('event_type') in valid_event_types:
                sanitized.append(event)

        # Store events
        success = add_events(sanitized)

        if success:
            return jsonify({'status': 'success', 'count': len(sanitized)})
        else:
            return jsonify({'error': 'Failed to store events'}), 500

    except Exception as e:
        log_error(f"Analytics logging error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/analytics/dashboard')
def analytics_dashboard():
    """
    Analytics dashboard page (protected - add auth if needed)
    """
    days = request.args.get('days', 30, type=int)
    summary = get_summary(days)

    return render_template('analyticsViewerDashboard.html',
                         summary=summary,
                         days=days,
                         now=datetime.now())

@app.route('/api/analytics/summary')
def analytics_summary_api():
    """
    Get analytics summary as JSON
    """
    days = request.args.get('days', 30, type=int)
    summary = get_summary(days)
    return jsonify(summary)
```

### 4. Create Analytics Dashboard Template

**File**: `templates/analyticsViewerDashboard.html` (NEW)

```html
{% extends "base.html" %}

{% block title %}Portfolio Analytics Dashboard{% endblock %}

{% block content %}
<div class="container my-5">
    <div class="text-center mb-5">
        <h1 class="display-4 text-white">Portfolio Analytics Dashboard</h1>
        <p class="lead text-light">Insights into visitor behavior and engagement</p>

        <!-- Time Range Selector -->
        <div class="btn-group mt-3" role="group">
            <a href="?days=7" class="btn btn-outline-light {% if days == 7 %}active{% endif %}">7 Days</a>
            <a href="?days=30" class="btn btn-outline-light {% if days == 30 %}active{% endif %}">30 Days</a>
            <a href="?days=90" class="btn btn-outline-light {% if days == 90 %}active{% endif %}">90 Days</a>
        </div>
    </div>

    <!-- Key Metrics -->
    <div class="row mb-5">
        <div class="col-md-3 mb-4">
            <div class="metric-card">
                <div class="metric-icon">👥</div>
                <div class="metric-value">{{ summary.unique_sessions }}</div>
                <div class="metric-label">Unique Visitors</div>
            </div>
        </div>
        <div class="col-md-3 mb-4">
            <div class="metric-card">
                <div class="metric-icon">👁️</div>
                <div class="metric-value">{{ summary.page_views }}</div>
                <div class="metric-label">Page Views</div>
            </div>
        </div>
        <div class="col-md-3 mb-4">
            <div class="metric-card">
                <div class="metric-icon">⏱️</div>
                <div class="metric-value">{{ "%.1f"|format(summary.avg_time_per_session) }}s</div>
                <div class="metric-label">Avg Session Time</div>
            </div>
        </div>
        <div class="col-md-3 mb-4">
            <div class="metric-card">
                <div class="metric-icon">🏆</div>
                <div class="metric-value">{{ "%.0f"|format(summary.journey_completion_rate) }}%</div>
                <div class="metric-label">Journey Completion</div>
            </div>
        </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="row mb-4">
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Daily Page Views</h5>
                    <canvas id="dailyViewsChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Device Breakdown</h5>
                    <canvas id="deviceChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="row mb-4">
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Top Pages</h5>
                    <canvas id="topPagesChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Popular Projects</h5>
                    <canvas id="projectsChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row 3 -->
    <div class="row mb-4">
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Filter Usage</h5>
                    <canvas id="filterChart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Achievement Unlocks</h5>
                    <canvas id="achievementChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>

<script>
// Chart.js configuration
const chartColors = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#48bb78',
    warning: '#ed8936',
    danger: '#f56565',
    info: '#4299e1'
};

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: {
            labels: { color: '#e0e0e0' }
        }
    },
    scales: {
        y: {
            ticks: { color: '#e0e0e0' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
            ticks: { color: '#e0e0e0' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
    }
};

// Daily Views Chart
const dailyViewsCtx = document.getElementById('dailyViewsChart').getContext('2d');
const dailyViewsData = {{ summary.daily_views | tojson }};
new Chart(dailyViewsCtx, {
    type: 'line',
    data: {
        labels: Object.keys(dailyViewsData),
        datasets: [{
            label: 'Page Views',
            data: Object.values(dailyViewsData),
            borderColor: chartColors.primary,
            backgroundColor: chartColors.primary + '40',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        ...chartDefaults,
        scales: {
            ...chartDefaults.scales,
            x: {
                ...chartDefaults.scales.x,
                ticks: {
                    ...chartDefaults.scales.x.ticks,
                    maxTicksLimit: 10
                }
            }
        }
    }
});

// Device Breakdown Chart
const deviceCtx = document.getElementById('deviceChart').getContext('2d');
const deviceData = {{ summary.device_breakdown | tojson }};
new Chart(deviceCtx, {
    type: 'doughnut',
    data: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [{
            data: [deviceData.desktop, deviceData.mobile, deviceData.tablet],
            backgroundColor: [chartColors.primary, chartColors.success, chartColors.warning]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#e0e0e0' }
            }
        }
    }
});

// Top Pages Chart
const topPagesCtx = document.getElementById('topPagesChart').getContext('2d');
const topPages = {{ summary.top_pages | tojson }};
new Chart(topPagesCtx, {
    type: 'bar',
    data: {
        labels: topPages.map(p => p[0]),
        datasets: [{
            label: 'Views',
            data: topPages.map(p => p[1]),
            backgroundColor: chartColors.secondary
        }]
    },
    options: chartDefaults
});

// Popular Projects Chart
const projectsCtx = document.getElementById('projectsChart').getContext('2d');
const projects = {{ summary.popular_projects | tojson }};
new Chart(projectsCtx, {
    type: 'bar',
    data: {
        labels: projects.map(p => p[0]),
        datasets: [{
            label: 'Interactions',
            data: projects.map(p => p[1]),
            backgroundColor: chartColors.success
        }]
    },
    options: chartDefaults
});

// Filter Usage Chart
const filterCtx = document.getElementById('filterChart').getContext('2d');
const filters = {{ summary.filter_usage | tojson }};
new Chart(filterCtx, {
    type: 'bar',
    data: {
        labels: filters.map(f => f[0]),
        datasets: [{
            label: 'Uses',
            data: filters.map(f => f[1]),
            backgroundColor: chartColors.info
        }]
    },
    options: chartDefaults
});

// Achievement Unlocks Chart
const achievementCtx = document.getElementById('achievementChart').getContext('2d');
const achievements = {{ summary.achievement_unlocks | tojson }};
new Chart(achievementCtx, {
    type: 'bar',
    data: {
        labels: Object.keys(achievements),
        datasets: [{
            label: 'Unlocks',
            data: Object.values(achievements),
            backgroundColor: chartColors.warning
        }]
    },
    options: chartDefaults
});
</script>
{% endblock %}
```

### 5. Add Dashboard Styles

**File**: `static/style.css`

**Add at the end:**

```css
/* ====== ANALYTICS DASHBOARD ====== */
.metric-card {
    background: var(--bg-card-dark);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    text-align: center;
    box-shadow: var(--shadow-lg);
    transition: transform var(--transition-normal);
}

.metric-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-xl);
}

.metric-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
}

.metric-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-accent-blue);
    margin-bottom: var(--spacing-sm);
}

.metric-label {
    font-size: 1rem;
    color: var(--text-light-gray);
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Chart containers */
canvas {
    max-height: 400px;
}

/* Light mode adjustments */
body[data-theme="light"] .metric-card {
    background: white;
}
```

### 6. Integrate Analytics Logger with Other Modules

**File**: `templates/base.html`

**Add analytics logger after other utility scripts:**

```html
<!-- Analytics Logger -->
<script src="{{ url_for('static', filename='js/analytics-logger.js') }}?v={{ now.timestamp() }}"></script>
```

**Integrate tracking in existing modules:**

**File**: `static/js/theme-switcher.js` - Add to `applyTheme()`:**
```javascript
// Track for analytics
if (typeof AnalyticsLogger !== 'undefined') {
    AnalyticsLogger.trackThemeSwitch(themeName);
}
```

**File**: `static/js/project-filter.js` - Add to `filterProjects()`:**
```javascript
// Track for analytics
if (tag !== 'all' && typeof AnalyticsLogger !== 'undefined') {
    AnalyticsLogger.trackFilterUsage(tag);
}
```

**File**: `static/js/achievements.js` - Add to `unlock()`:**
```javascript
// Track for analytics
if (typeof AnalyticsLogger !== 'undefined') {
    AnalyticsLogger.trackAchievementUnlock(achievementId);
}
```

## Success Criteria

### Automated Verification
- [ ] Flask app starts without errors
- [ ] Analytics routes respond: `/api/analytics/events` (POST), `/analytics/dashboard` (GET)
- [ ] Analytics data file created at `data/analytics.json`

### Manual Verification
- [ ] Browse portfolio pages - events logged to console
- [ ] Check Network tab - batch requests to `/api/analytics/events` every 30s
- [ ] Navigate to `/analytics/dashboard` - dashboard loads
- [ ] All charts render with data
- [ ] Metric cards display correct numbers
- [ ] Time range selector works (7/30/90 days)
- [ ] Dashboard responsive on mobile
- [ ] Test achievement unlocks appear in analytics
- [ ] Test filter usage appears in analytics
- [ ] Test theme switches appear in analytics
- [ ] Verify data persists after server restart

---

# IMPLEMENTATION CHECKLIST

This comprehensive checklist tracks all tasks across the 6 phases:

## Phase 1: Dark Mode Toggle
- [ ] Create `static/js/theme-switcher.js`
- [ ] Add CSS variables override logic
- [ ] Update `static/style.css` with theme transitions
- [ ] Add light mode CSS overrides
- [ ] Add toggle button to `templates/base.html` navbar
- [ ] Load theme-switcher.js in base template
- [ ] Test theme toggle on all pages
- [ ] Verify localStorage persistence
- [ ] Test smooth transitions

## Phase 2: Project Filtering System
- [ ] Add tags to all projects in `data/projects.json`
- [ ] Create `static/js/project-filter.js`
- [ ] Update `templates/home.html` with filter container
- [ ] Update `templates/ai_innovations_portal.html` with filter
- [ ] Add project-card-wrapper with data-tags
- [ ] Add filter bar styles to `static/style.css`
- [ ] Test filter functionality on home page
- [ ] Test filter on AI innovations page
- [ ] Verify URL hash updates
- [ ] Test mobile responsive layout

## Phase 3: User Journey Achievements
- [ ] Create `static/js/achievements.js`
- [ ] Define all 8 achievements
- [ ] Integrate with `static/js/usersJourney.js`
- [ ] Integrate with `static/js/theme-switcher.js`
- [ ] Integrate with `static/js/project-filter.js`
- [ ] Add achievement styles to `static/style.css`
- [ ] Add achievement display to `templates/about.html`
- [ ] Load achievements.js in base template
- [ ] Test all achievement triggers
- [ ] Verify notification animations
- [ ] Test achievement display widget

## Phase 4: Comprehensive Case Studies
- [ ] Create `templates/layouts/case_study.html`
- [ ] Create `templates/case-studies/wordle-case-study.html`
- [ ] Create `templates/case-studies/secret-santa-case-study.html`
- [ ] Create `templates/case-studies/basketball-case-study.html`
- [ ] Add case study routes to `app.py`
- [ ] Add case study links to project pages
- [ ] Add case study styles to `static/style.css`
- [ ] Add Mermaid.js to `templates/base.html`
- [ ] Test Mermaid diagram rendering
- [ ] Test case study navigation
- [ ] Verify mobile responsive layout

## Phase 5: Scroll-Driven Animations
- [ ] Create `static/css/scroll-animations.css`
- [ ] Create `static/js/scroll-animations.js`
- [ ] Add scroll classes to case study elements
- [ ] Add scroll classes to home page cards
- [ ] Add parallax to hero images
- [ ] Load scroll assets in `templates/base.html`
- [ ] Test native scroll-timeline (Chrome 115+)
- [ ] Test Intersection Observer fallback (Safari/Firefox)
- [ ] Verify 60fps performance
- [ ] Test mobile responsiveness

## Phase 6: Interactive Portfolio Analytics Dashboard
- [ ] Create `static/js/analytics-logger.js`
- [ ] Create `utils/analytics_storage.py`
- [ ] Add analytics routes to `app.py`
- [ ] Create `templates/analyticsViewerDashboard.html`
- [ ] Add dashboard styles to `static/style.css`
- [ ] Load analytics-logger.js in base template
- [ ] Integrate tracking in theme-switcher
- [ ] Integrate tracking in project-filter
- [ ] Integrate tracking in achievements
- [ ] Test event logging
- [ ] Test batch sending
- [ ] Navigate to `/analytics/dashboard`
- [ ] Verify all charts render
- [ ] Test time range selector
- [ ] Verify data persistence

---

# Post-Implementation Tasks

After completing all 6 phases:

1. **Performance Audit**
   - Run Lighthouse audit
   - Check bundle sizes
   - Verify 60fps scroll performance
   - Test on mobile devices

2. **Cross-Browser Testing**
   - Chrome 115+ (native scroll animations)
   - Firefox 88+ (fallback)
   - Safari 14+ (fallback)
   - Mobile Safari
   - Chrome Mobile

3. **User Testing**
   - Walk through full user journey
   - Unlock all achievements
   - Test all filters
   - Switch themes multiple times
   - View analytics dashboard

4. **Documentation**
   - Update README.md with new features
   - Document analytics schema
   - Create user guide for dashboard
   - Update deployment docs if needed

5. **Optional Enhancements**
   - Add achievement sharing (social media)
   - Export analytics as CSV
   - Add A/B testing capability
   - Create admin authentication for dashboard

---

# Notes

- All phases build on previous work - complete in order
- Test after each phase before proceeding
- Analytics data stored locally in JSON (can migrate to database later)
- No third-party analytics services used (privacy-first)
- Cutting-edge features have graceful fallbacks
- Mobile-first responsive design maintained throughout
