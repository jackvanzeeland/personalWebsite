import { JourneyData, Achievement } from '../types';

const JOURNEY_PAGES = [
    'home',
    'about',
    'beyondTheCode',
    'journey'
];

const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_project',
        title: 'Project Explorer',
        description: 'View your first project',
        icon: '🔍',
        unlocked: false
    },
    {
        id: 'theme_switcher',
        title: 'Theme Master',
        description: 'Switch between light and dark themes',
        icon: '🌓',
        unlocked: false
    },
    {
        id: 'filter_user',
        title: 'Filter Expert',
        description: 'Use the project filter system',
        icon: '🎯',
        unlocked: false
    },
    {
        id: 'page_explorer',
        title: 'Page Navigator',
        description: 'Visit 3 different pages',
        icon: '🧭',
        unlocked: false
    },
    {
        id: 'scroll_master',
        title: 'Deep Diver',
        description: 'Scroll to the bottom of the home page',
        icon: '📜',
        unlocked: false
    },
    {
        id: 'interactive_user',
        title: 'Interactive User',
        description: 'Visit an interactive project',
        icon: '🎮',
        unlocked: false
    },
    {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Use the site after 10 PM',
        icon: '🦉',
        unlocked: false
    },
    {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Use the site before 6 AM',
        icon: '🐦',
        unlocked: false
    }
];

export function initializeJourney(): void {
    initializeJourneyData();
    initializeAchievements();
    updateJourneyProgress();
    checkTimeBasedAchievements();
}

function initializeJourneyData(): void {
    let journeyData = getJourneyData();
    
    // Initialize if doesn't exist
    if (!journeyData.lastVisited) {
        journeyData = {
            home: window.location.pathname === '/',
            about: false,
            beyondTheCode: false,
            journey: false,
            projects: [],
            achievements: [],
            lastVisited: new Date().toISOString(),
            progress: 0
        };
        saveJourneyData(journeyData);
    }
    
    // Mark current page as visited
    markPageAsVisited();
}

function initializeAchievements(): void {
    let achievements = getAchievements();
    
    // Initialize if doesn't exist
    if (achievements.length === 0) {
        achievements = ACHIEVEMENTS.map(ach => ({ ...ach }));
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
}

export function getJourneyData(): JourneyData {
    return JSON.parse(localStorage.getItem('journeyData') || '{}');
}

export function saveJourneyData(data: JourneyData): void {
    localStorage.setItem('journeyData', JSON.stringify(data));
}

export function getAchievements(): Achievement[] {
    return JSON.parse(localStorage.getItem('achievements') || '[]');
}

export function saveAchievements(achievements: Achievement[]): void {
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

export function markPageAsVisited(): void {
    const path = window.location.pathname;
    const journeyData = getJourneyData();
    
    // Map path to journey key
    if (path === '/' || path === '/index.html') {
        journeyData.home = true;
    } else if (path.includes('about')) {
        journeyData.about = true;
    } else if (path.includes('beyond-the-code')) {
        journeyData.beyondTheCode = true;
    } else if (path.includes('journey')) {
        journeyData.journey = true;
    } else if (path === '/pages/projects' || path === '/pages/projects.html') {
        journeyData.projects_page = true;
    } else if (path.includes('projects')) {
        // Extract project name from path
        const projectName = path.split('/').pop()?.replace('.html', '') || '';
        if (projectName && !journeyData.projects?.includes(projectName)) {
            journeyData.projects = journeyData.projects || [];
            journeyData.projects.push(projectName);
        }
    }
    
    journeyData.lastVisited = new Date().toISOString();
    saveJourneyData(journeyData);
    
    // Check for achievements
    checkAchievements();
}

function updateJourneyProgress(): void {
    const journeyData = getJourneyData();
    const visitedPages = JOURNEY_PAGES.filter(page => journeyData[page as keyof JourneyData]);
    const progress = Math.round((visitedPages.length / JOURNEY_PAGES.length) * 100);

    journeyData.progress = progress;
    saveJourneyData(journeyData);

    // Note: Progress bar updates are handled by JourneyDashboard.js on the journey page
    // This function only updates the stored progress value
}

function checkAchievements(): void {
    const journeyData = getJourneyData();
    const achievements = getAchievements();
    const newUnlocks: Achievement[] = [];
    
    // Check each achievement
    achievements.forEach(achievement => {
        if (!achievement.unlocked) {
            let shouldUnlock = false;
            
            switch (achievement.id) {
                case 'page_explorer': {
                    const visitedPages = JOURNEY_PAGES.filter(page => journeyData[page as keyof JourneyData]);
                    shouldUnlock = visitedPages.length >= 3;
                    break;
                }
                case 'scroll_master': {
                    // This is checked in scroll tracking - need to check if user has scrolled enough
                    const scrollPercent = Math.round(
                        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                    );
                    shouldUnlock = scrollPercent >= 90; // 90% scroll depth
                    break;
                }
                case 'first_project':
                    shouldUnlock = (journeyData.projects?.length || 0) >= 1;
                    break;

                case 'interactive_user': {
                    const interactiveProjects = ['wordle-solver', 'secret-santa', 'lyric-animator', 'html-gems'];
                    shouldUnlock = interactiveProjects.some(proj =>
                        journeyData.projects?.includes(proj)
                    );
                    break;
                }
            }
            
            if (shouldUnlock) {
                achievement.unlocked = true;
                achievement.unlockedAt = new Date().toISOString();
                newUnlocks.push(achievement);
                
                // Show notification
                showAchievementNotification(achievement);
            }
        }
    });
    
    if (newUnlocks.length > 0) {
        saveAchievements(achievements);
        newUnlocks.forEach(ach => {
            // Achievement unlocked - Journey tracking only (no analytics)
            console.log(`🏆 Achievement Unlocked: ${ach.title} (${ach.id})`);
        });
    }
}

function checkTimeBasedAchievements(): void {
    const hour = new Date().getHours();
    const achievements = getAchievements();
    const newUnlocks: Achievement[] = [];
    
    achievements.forEach(achievement => {
        if (!achievement.unlocked) {
            if (achievement.id === 'night_owl' && hour >= 22) {
                achievement.unlocked = true;
                achievement.unlockedAt = new Date().toISOString();
                newUnlocks.push(achievement);
            } else if (achievement.id === 'early_bird' && hour < 6) {
                achievement.unlocked = true;
                achievement.unlockedAt = new Date().toISOString();
                newUnlocks.push(achievement);
            }
        }
    });
    
    if (newUnlocks.length > 0) {
        saveAchievements(achievements);
        newUnlocks.forEach(ach => {
            showAchievementNotification(ach);
        });
    }
}

export function unlockAchievement(achievementId: string): void {
    const achievements = getAchievements();
    const achievement = achievements.find(a => a.id === achievementId);

    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date().toISOString();
    saveAchievements(achievements);
    showAchievementNotification(achievement);
    console.log(`🏆 Achievement Unlocked: ${achievement.title} (${achievement.id})`);
}

function showAchievementNotification(achievement: Achievement): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${achievement.title}</div>
            <div class="achievement-description">${achievement.description}</div>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#achievement-styles')) {
        const styles = document.createElement('style');
        styles.id = 'achievement-styles';
        styles.textContent = `
            .achievement-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-primary);
                border: 2px solid var(--accent-primary);
                border-radius: 10px;
                padding: 1rem;
                box-shadow: var(--shadow-lg);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 1rem;
                max-width: 300px;
                animation: slideIn 0.3s ease-out;
            }
            
            .achievement-icon {
                font-size: 2rem;
            }
            
            .achievement-title {
                font-weight: bold;
                color: var(--accent-primary);
            }
            
            .achievement-name {
                font-weight: 600;
                margin-top: 0.25rem;
            }
            
            .achievement-description {
                font-size: 0.9rem;
                color: var(--text-secondary);
                margin-top: 0.25rem;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

