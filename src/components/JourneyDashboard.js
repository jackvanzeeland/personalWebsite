// Journey Dashboard Component
class JourneyDashboard {
    constructor() {
        this.pages = [
            { id: 'home', name: 'Home', icon: '🏠', url: '/' },
            { id: 'about', name: 'About', icon: '👤', url: '/pages/about' },
            { id: 'projects_page', name: 'Projects', icon: '💻', url: '/pages/projects' },
            { id: 'beyondTheCode', name: 'Beyond the Code', icon: '🎨', url: '/pages/beyond-the-code' },
            { id: 'journey', name: 'Journey', icon: '🗺️', url: '/pages/journey' }
        ];

        this.projectPages = [
            { id: 'wordle-solver', name: 'Wordle Solver', icon: '🟩', url: '/pages/projects/wordle-solver' },
            { id: 'secret-santa', name: 'Secret Santa', icon: '🎅', url: '/pages/projects/secret-santa' },
            { id: 'lyric-animator', name: 'Lyric Animator', icon: '🎵', url: '/pages/projects/lyric-animator' },
            { id: 'html-gems', name: 'HTML Gems', icon: '💎', url: '/pages/projects/html-gems' },
            { id: 'basketball-optimization', name: 'Basketball Optimization', icon: '🏀', url: '/pages/projects/basketball-optimization' },
            { id: 'budgeting-automation', name: 'Budgeting Automation', icon: '💰', url: '/pages/projects/budgeting-automation' },
            { id: 'superbowl-squares', name: 'Super Bowl Competition', icon: '🏈', url: '/pages/projects/superbowl-squares' },
            { id: 'reddit-stories', name: 'Reddit Stories', icon: '📱', url: '/pages/projects/reddit-stories' },
            { id: 'nebula', name: 'Nebula', icon: '🌌', url: '/pages/projects/nebula' },
            { id: 'run-genius', name: 'Run Genius', icon: '🏃', url: '/pages/projects/run-genius' }
        ];
        
        this.achievements = [
            { id: 'first_project', title: 'Project Explorer', description: 'View your first project', icon: '🔍' },
            { id: 'theme_switcher', title: 'Theme Master', description: 'Switch between light and dark themes', icon: '🌓' },
            { id: 'filter_user', title: 'Filter Expert', description: 'Use the project filter system', icon: '🎯' },
            { id: 'page_explorer', title: 'Page Navigator', description: 'Visit 3 different pages', icon: '🧭' },
            { id: 'scroll_master', title: 'Deep Diver', description: 'Scroll to the bottom of the home page', icon: '📜' },
            { id: 'interactive_user', title: 'Interactive User', description: 'Visit an interactive project', icon: '🎮' },
            { id: 'night_owl', title: 'Night Owl', description: 'Use the site after 10 PM', icon: '🦉' },
            { id: 'early_bird', title: 'Early Bird', description: 'Use the site before 6 AM', icon: '🐦' }
        ];

        this.init();
    }

    init() {
        this.loadJourneyData();
        this.markCurrentPageAsVisited();
        this.displayPagesVisited();
        this.displayAchievements();
        this.generateRecommendations();
        this.updateStatistics();
        this.updateProgressBar();
    }

    loadJourneyData() {
        this.journeyData = JSON.parse(localStorage.getItem('journeyData') || '{}');
        this.achievementsData = JSON.parse(localStorage.getItem('achievements') || JSON.stringify(
            this.achievements.map(a => ({ ...a, unlocked: false }))
        ));
    }

    markCurrentPageAsVisited() {
        // Mark journey page as visited
        this.journeyData.journey = true;
        this.journeyData.lastVisited = new Date().toISOString();
        localStorage.setItem('journeyData', JSON.stringify(this.journeyData));

        // Check for achievements based on page visits
        this.checkPageExplorerAchievement();
    }

    checkPageExplorerAchievement() {
        const visitedPages = this.pages.filter(p => this.journeyData[p.id]).length;

        // Check if "Page Navigator" achievement should be unlocked (visit 3 pages)
        const pageExplorerAchievement = this.achievementsData.find(a => a.id === 'page_explorer');
        if (pageExplorerAchievement && !pageExplorerAchievement.unlocked && visitedPages >= 3) {
            pageExplorerAchievement.unlocked = true;
            pageExplorerAchievement.unlockedAt = new Date().toISOString();
            localStorage.setItem('achievements', JSON.stringify(this.achievementsData));
        }
    }

    displayPagesVisited() {
        const container = document.getElementById('pages-visited');
        if (!container) return;

        const renderPageCard = (page, visited) => `
            <div class="page-card ${visited ? 'visited' : 'not-visited'} p-3 mb-3 rounded">
                <div class="d-flex align-items-center">
                    <div class="page-icon me-3">${page.icon}</div>
                    <div class="page-info flex-grow-1">
                        <div class="page-name fw-bold">${page.name}</div>
                        <div class="page-status small">
                            ${visited ? '✅ Visited' : '🔒 Not yet explored'}
                        </div>
                    </div>
                    <div class="page-action">
                        ${visited ?
                            `<a href="${page.url}" class="btn btn-outline-primary btn-sm">Revisit</a>` :
                            `<a href="${page.url}" class="btn btn-primary btn-sm">Explore</a>`
                        }
                    </div>
                </div>
            </div>
        `;

        // Main pages
        const mainPagesHTML = this.pages.map(page => {
            const visited = this.journeyData[page.id] || false;
            return renderPageCard(page, visited);
        }).join('');

        // Project pages
        const projectPagesHTML = this.projectPages.map(page => {
            const visited = this.journeyData.projects?.includes(page.id) || false;
            return renderPageCard(page, visited);
        }).join('');

        container.innerHTML = mainPagesHTML +
            '<h5 class="mt-4 mb-3">Projects</h5>' +
            projectPagesHTML;
    }

    displayAchievements() {
        const container = document.getElementById('achievements-display');
        if (!container) return;

        container.innerHTML = this.achievementsData.map(achievement => {
            const unlocked = achievement.unlocked;
            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'} p-3 mb-3 rounded text-center">
                    <div class="achievement-icon mb-2">${achievement.icon}</div>
                    <div class="achievement-title fw-bold">${achievement.title}</div>
                    <div class="achievement-description small text-muted">${achievement.description}</div>
                    <div class="achievement-status mt-2">
                        ${unlocked ? 
                            '<span class="badge bg-success">✅ Unlocked</span>' : 
                            '<span class="badge bg-secondary">🔒 Locked</span>'
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    generateRecommendations() {
        const container = document.getElementById('recommendations');
        if (!container) return;

        const totalVisited = this.getTotalVisitedCount();
        const totalPages = this.getTotalPageCount();
        const unlockedAchievements = this.achievementsData.filter(a => a.unlocked);
        const progress = (totalVisited / totalPages) * 100;

        const recommendations = [];

        if (progress < 25) {
            recommendations.push({
                title: 'Start Exploring',
                description: 'Visit the About page to learn more about Jack and his journey.',
                icon: '👤',
                action: '/pages/about'
            });
        }

        if (!this.journeyData.beyondTheCode) {
            recommendations.push({
                title: 'Discover Personal Side',
                description: 'Explore the "Beyond the Code" page to see Jack\'s personal interests and photos.',
                icon: '🎨',
                action: '/pages/beyond-the-code'
            });
        }

        if (!unlockedAchievements.find(a => a.id === 'theme_switcher')) {
            recommendations.push({
                title: 'Try Theme Switching',
                description: 'Click the theme toggle in the navigation to experience both light and dark modes.',
                icon: '🌓',
                action: 'theme'
            });
        }

        if (!unlockedAchievements.find(a => a.id === 'filter_user') && progress > 50) {
            recommendations.push({
                title: 'Use Project Filters',
                description: 'Go to the home page and try filtering projects by technology tags.',
                icon: '🎯',
                action: '/#projects'
            });
        }

        if (progress >= 75 && unlockedAchievements.length < 5) {
            recommendations.push({
                title: 'Unlock More Achievements',
                description: 'You\'ve explored most of the site! Try visiting different times of day or using interactive features.',
                icon: '🏆',
                action: 'explore'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                title: '🎉 Congratulations!',
                description: 'You\'re a true explorer! You\'ve unlocked most achievements and explored the site thoroughly.',
                icon: '🌟',
                action: 'complete'
            });
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card p-4 mb-3 bg-light rounded">
                <div class="d-flex align-items-start">
                    <div class="recommendation-icon me-3">${rec.icon}</div>
                    <div class="recommendation-content flex-grow-1">
                        <h5 class="recommendation-title">${rec.title}</h5>
                        <p class="recommendation-description mb-3">${rec.description}</p>
                        ${rec.action !== 'theme' && rec.action !== 'explore' && rec.action !== 'complete' ? 
                            `<a href="${rec.action}" class="btn btn-primary btn-sm">Go There</a>` :
                            rec.action === 'theme' ?
                            '<button class="btn btn-primary btn-sm" onclick="toggleTheme()">Switch Theme</button>' :
                            '<span class="text-muted">Keep exploring!</span>'
                        }
                    </div>
                </div>
            </div>
        `).join('');
    }

    calculateSessionCount(journeyData) {
        // Estimate sessions based on unique days with activity
        if (!journeyData.lastVisited) return 1;
        
        const lastVisit = new Date(journeyData.lastVisited);
        const today = new Date();
        const daysDiff = Math.ceil((today - lastVisit) / (1000 * 60 * 60 * 24));
        
        // Base estimate on visits over time period
        const baseSessions = 1; // At least one session
        const additionalSessions = Math.min(daysDiff, 30); // Cap at reasonable estimate
        
        return baseSessions + additionalSessions;
    }

    getTotalVisitedCount() {
        const mainVisited = this.pages.filter(p => this.journeyData[p.id]).length;
        const projectVisited = this.projectPages.filter(p => this.journeyData.projects?.includes(p.id)).length;
        return mainVisited + projectVisited;
    }

    getTotalPageCount() {
        return this.pages.length + this.projectPages.length;
    }

    updateStatistics() {
        const totalVisited = this.getTotalVisitedCount();
        const unlockedAchievements = this.achievementsData.filter(a => a.unlocked);

        // Pages count
        document.getElementById('pages-count').textContent = totalVisited;
        
        // Achievements count
        document.getElementById('achievements-count').textContent = unlockedAchievements.length;
        
        // Time spent (estimate based on Journey data)
        const journeyData = JSON.parse(localStorage.getItem('journeyData') || '{}');
        const sessionCount = this.calculateSessionCount(journeyData);
        const totalTime = sessionCount * 5; // Estimate 5 minutes per session
        document.getElementById('time-spent').textContent = totalTime > 60 ? `${Math.round(totalTime / 60)}h` : `${totalTime}m`;
        
        // Visits count
        document.getElementById('visits-count').textContent = sessionCount || 1;
    }

    updateProgressBar() {
        const totalVisited = this.getTotalVisitedCount();
        const totalPages = this.getTotalPageCount();
        const progress = Math.round((totalVisited / totalPages) * 100);
        
        // Update percentage text
        document.getElementById('journey-percentage').textContent = `${progress}%`;
        
        // Update progress bar
        const progressBar = document.getElementById('journey-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;
        }
    }
}

// Global functions
window.resetJourney = function() {
    if (confirm('Are you sure you want to reset your journey progress? This will clear all visited pages and achievements.')) {
        localStorage.removeItem('journeyData');
        localStorage.removeItem('achievements');
        location.reload();
    }
};

window.shareJourney = function() {
    const visitedPages = Object.entries(JSON.parse(localStorage.getItem('journeyData') || '{}'))
        .filter(([, visited]) => visited)
        .length;
    const unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]')
        .filter(a => a.unlocked).length;
    
    const shareText = `I've explored ${visitedPages} pages and unlocked ${unlockedAchievements} achievements on Jack Van Zeeland's portfolio! 🚀 Check it out: ${window.location.origin}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Portfolio Journey',
            text: shareText,
            url: window.location.origin
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Journey progress copied to clipboard! Share it with your friends.');
        });
    }
};

window.toggleTheme = function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.click();
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new JourneyDashboard());
} else {
    new JourneyDashboard();
}

// Add styles
const journeyStyles = document.createElement('style');
journeyStyles.textContent = `
    .journey-overview {
        text-align: center;
        padding: 2rem;
        background: var(--bg-secondary);
        border-radius: 15px;
        margin-bottom: 2rem;
    }
    
    .progress-percentage {
        font-size: 3rem;
        font-weight: bold;
        color: var(--accent-primary);
        margin-bottom: 0.5rem;
    }
    
    .progress-text {
        font-size: 1.2rem;
        color: var(--text-secondary);
        margin-bottom: 1.5rem;
    }
    
    .journey-progress-bar {
        max-width: 400px;
        margin: 0 auto;
    }
    
    .journey-section {
        background: var(--bg-primary);
        border-radius: 15px;
        padding: 2rem;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
        height: 100%;
    }
    
    .page-card {
        border: 2px solid var(--border-color);
        transition: all 0.3s ease;
    }
    
    .page-card.visited {
        border-color: var(--accent-primary);
        background: rgba(13, 110, 253, 0.05);
    }
    
    .page-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .page-icon {
        font-size: 2rem;
    }
    
    .page-status {
        margin-top: 0.25rem;
    }
    
    .achievement-card {
        border: 2px solid var(--border-color);
        transition: all 0.3s ease;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    
    .achievement-card.unlocked {
        border-color: var(--accent-primary);
        background: rgba(25, 135, 84, 0.05);
    }
    
    .achievement-card.locked {
        opacity: 0.7;
    }
    
    .achievement-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    
    .recommendation-card {
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }
    
    .recommendation-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
    
    .recommendation-icon {
        font-size: 1.5rem;
        margin-top: 0.25rem;
    }
    
    .journey-stat-card {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-sm);
    }
    
    .journey-stat-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
    }
    
    .stat-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--accent-primary);
    }
    
    .stat-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 0;
    }
    
    .journey-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    @media (max-width: 768px) {
        .progress-percentage {
            font-size: 2.5rem;
        }
        
        .journey-stat-card {
            margin-bottom: 1rem;
        }
        
        .journey-actions {
            flex-direction: column;
            align-items: center;
        }
        
        .journey-actions .btn {
            width: 100%;
            max-width: 250px;
        }
    }
`;

document.head.appendChild(journeyStyles);