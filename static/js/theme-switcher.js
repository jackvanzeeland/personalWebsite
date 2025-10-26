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
