/**
 * Project Filter Module
 * Handles filtering of project cards by tags
 */

const ProjectFilter = (function() {
    'use strict';

    let allProjects = [];
    let activeFilter = 'all';

    /**
     * Initialize the filter system
     */
    function init() {
        // Get all project cards
        allProjects = Array.from(document.querySelectorAll('.project-card-wrapper'));

        // Set up toggle button listener
        const toggleBtn = document.getElementById('filter-toggle');
        const dropdown = document.getElementById('filter-dropdown');

        if (toggleBtn && dropdown) {
            toggleBtn.addEventListener('click', function() {
                const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                toggleBtn.setAttribute('aria-expanded', !isExpanded);
                dropdown.style.display = isExpanded ? 'none' : 'block';
            });
        }

        // Set up filter button listeners
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', handleFilterClick);
        });

        // Apply initial filter (show all)
        applyFilter('all');
    }

    /**
     * Handle filter button click
     */
    function handleFilterClick(event) {
        const button = event.currentTarget;
        const filterValue = button.getAttribute('data-filter');

        // Update active button state
        updateActiveButton(button);

        // Apply the filter
        applyFilter(filterValue);
    }

    /**
     * Update active button styling
     */
    function updateActiveButton(activeButton) {
        const allButtons = document.querySelectorAll('[data-filter]');
        allButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });

        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');
    }

    /**
     * Apply filter to projects
     */
    function applyFilter(filterValue) {
        activeFilter = filterValue;

        allProjects.forEach(projectWrapper => {
            const projectTags = getProjectTags(projectWrapper);
            const shouldShow = filterValue === 'all' || projectTags.includes(filterValue);

            if (shouldShow) {
                projectWrapper.style.display = '';
                // Re-trigger animation
                setTimeout(() => {
                    const card = projectWrapper.querySelector('.card');
                    if (card) {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }
                }, 50);
            } else {
                projectWrapper.style.display = 'none';
            }
        });

        // Update count
        updateProjectCount();

        // Track achievement (only for non-'all' filters)
        if (filterValue !== 'all' && window.AchievementSystem) {
            AchievementSystem.trackAction('filter_used');
        }

        // Track analytics
        if (filterValue !== 'all' && window.AnalyticsLogger) {
            AnalyticsLogger.trackFilterUsage(filterValue);
        }
    }

    /**
     * Get tags from a project card
     */
    function getProjectTags(projectWrapper) {
        const tagsAttr = projectWrapper.getAttribute('data-tags');
        return tagsAttr ? tagsAttr.split(',').map(tag => tag.trim()) : [];
    }

    /**
     * Update visible project count
     */
    function updateProjectCount() {
        const visibleCount = allProjects.filter(p => p.style.display !== 'none').length;
        const countElement = document.querySelector('.filter-count');

        if (countElement) {
            countElement.textContent = activeFilter === 'all'
                ? `All Projects (${visibleCount})`
                : `${visibleCount} project${visibleCount !== 1 ? 's' : ''} found`;
        }
    }

    /**
     * Get all unique tags from projects
     */
    function getAllTags() {
        const tagsSet = new Set();

        allProjects.forEach(projectWrapper => {
            const tags = getProjectTags(projectWrapper);
            tags.forEach(tag => tagsSet.add(tag));
        });

        return Array.from(tagsSet).sort();
    }

    // Public API
    return {
        init,
        applyFilter,
        getAllTags,
        getCurrentFilter: () => activeFilter
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', ProjectFilter.init);

// Expose for console debugging
window.ProjectFilter = ProjectFilter;
