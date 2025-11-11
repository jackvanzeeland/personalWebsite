/**
 * Project Filter Module
 * Handles filtering of project cards by tags with multi-select support
 */

const ProjectFilter = (function() {
    'use strict';

    let allProjects = [];
    let selectedFilters = new Set();

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

        // Calculate and display filter counts
        updateFilterCounts();

        // Set up filter checkbox listeners
        const filterCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleFilterChange);
        });

        // Set up "Clear All" button
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearAllFilters);
        }

        // Apply initial filter (show all)
        applyFilters();
    }

    /**
     * Handle filter checkbox change
     */
    function handleFilterChange(event) {
        const checkbox = event.target;
        const filterValue = checkbox.value;

        if (checkbox.checked) {
            selectedFilters.add(filterValue);
        } else {
            selectedFilters.delete(filterValue);
        }

        // Apply the filters
        applyFilters();

        // Track analytics (only for first filter selection)
        if (selectedFilters.size === 1 && checkbox.checked && window.AnalyticsLogger) {
            AnalyticsLogger.trackFilterUsage(filterValue);
        }

        // Track achievement
        if (selectedFilters.size > 0 && window.AchievementSystem) {
            AchievementSystem.trackAction('filter_used');
        }
    }

    /**
     * Apply filters to projects (multi-select with OR logic)
     */
    function applyFilters() {
        allProjects.forEach(projectWrapper => {
            const projectTags = getProjectTags(projectWrapper);

            // If no filters selected, show all projects
            const shouldShow = selectedFilters.size === 0 ||
                Array.from(selectedFilters).some(filter => projectTags.includes(filter));

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
    }

    /**
     * Clear all filters
     */
    function clearAllFilters() {
        // Uncheck all checkboxes
        document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Clear selected filters set
        selectedFilters.clear();

        // Reapply filters (will show all)
        applyFilters();
    }

    /**
     * Calculate and update filter counts
     */
    function updateFilterCounts() {
        const filterCounts = {};

        // Count projects for each tag
        allProjects.forEach(projectWrapper => {
            const tags = getProjectTags(projectWrapper);
            tags.forEach(tag => {
                filterCounts[tag] = (filterCounts[tag] || 0) + 1;
            });
        });

        // Update each filter label with count
        document.querySelectorAll('.filter-checkbox').forEach(label => {
            const checkbox = label.querySelector('input[type="checkbox"]');
            const filterValue = checkbox.value;
            const count = filterCounts[filterValue] || 0;

            const labelText = label.querySelector('.filter-label-text');
            if (labelText) {
                labelText.innerHTML = `${filterValue} <span class="filter-count">(${count})</span>`;
            }
        });
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
        const countElement = document.querySelector('.filter-result-count');

        if (countElement) {
            if (selectedFilters.size === 0) {
                countElement.textContent = `Showing all ${visibleCount} projects`;
            } else {
                countElement.textContent = `${visibleCount} project${visibleCount !== 1 ? 's' : ''} found`;
            }
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
        applyFilters,
        getAllTags,
        getSelectedFilters: () => Array.from(selectedFilters)
    };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', ProjectFilter.init);

// Expose for console debugging
window.ProjectFilter = ProjectFilter;
