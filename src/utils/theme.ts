import { unlockAchievement } from './journey';

export function initializeTheme(): void {
    const savedTheme = (localStorage.getItem('theme') || 'light') as 'light' | 'dark';
    setTheme(savedTheme);
    
    // Add theme toggle listener
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

export function setTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    // Update background for theme
    updateBackgroundForTheme(theme);
    
    // Theme change applied (no analytics tracking)
    console.log(`🎨 Theme changed to: ${theme}`);
}

export function toggleTheme(): void {
    const currentTheme = (document.documentElement.getAttribute('data-theme') || 'light') as 'light' | 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    unlockAchievement('theme_switcher');
}

// Update background for theme
export function updateBackgroundForTheme(theme: 'light' | 'dark'): void {
    // This function is now handled by BackgroundEffects module
    // The new professional background system will be used instead
    console.log(`Theme updated to: ${theme}`);
}