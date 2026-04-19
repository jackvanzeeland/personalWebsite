import { Project, FilterTag } from '../types';
import { PROJECTS } from '../data/projects';
import { unlockAchievement } from '../utils/journey';

const projects: Project[] = PROJECTS;
let filterTags: FilterTag[] = [];

// Make showProjectDetails globally available
(window as any).showProjectDetails = function(_projectTitle: string) {
    // Project detail navigation handled by routing
};

export async function loadProjects(): Promise<Project[]> {
    // Return the imported projects directly
    return projects;
}

export function initializeFiltering(): void {
    if (projects.length === 0) {
        return;
    }
    extractFilterTags();
    renderFilterButtons();
    renderProjects(projects);
}

function extractFilterTags(): void {
    const tagCounts = new Map<string, number>();
    
    projects.forEach(project => {
        project.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
    });
    
    // Get all unique tags, sorted by frequency
    const allTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name);
    
    filterTags = allTags.map(name => ({
        name,
        count: tagCounts.get(name) || 0,
        active: false
    }));
}

function renderFilterButtons(): void {
    const filterContainer = document.getElementById('filter-buttons');
    if (!filterContainer) return;
    
    // Clear existing buttons
    filterContainer.innerHTML = '';
    
    // Add "All" button
    const allButton = createFilterButton('All', projects.length, true);
    filterContainer.appendChild(allButton);
    
    // Add tag buttons
    filterTags.forEach(tag => {
        const button = createFilterButton(tag.name, tag.count, tag.active);
        filterContainer.appendChild(button);
    });
}

function createFilterButton(tagName: string, count: number, isActive: boolean): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = `filter-btn ${isActive ? 'active' : ''}`;

    // Capitalize tag name for display
    const displayName = tagName.charAt(0).toUpperCase() + tagName.slice(1).toLowerCase();

    button.textContent = displayName + ' ';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = count.toString();
    button.appendChild(badge);

    button.addEventListener('click', () => toggleFilter(tagName, button));
    return button;
}

function toggleFilter(tagName: string, button: HTMLButtonElement): void {
    const isAll = tagName === 'All';
    
    // Update active states
    if (isAll) {
        // Deactivate all other filters
        filterTags.forEach(tag => tag.active = false);
        document.querySelectorAll('.filter-btn:not(:first-child)').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    } else {
        // Toggle this filter
        const tag = filterTags.find(t => t.name === tagName);
        if (tag) {
            tag.active = !tag.active;
            button.classList.toggle('active');
        }
        
        // Deactivate "All" button if any other filter is active
        const allButton = document.querySelector('.filter-btn:first-child');
        if (allButton) {
            allButton.classList.remove('active');
        }
    }
    
    // Apply filters
    const filteredProjects = getFilteredProjects();
    renderProjects(filteredProjects);
    
    // Log filter change
    logFilterChange(tagName, isAll);

    // Unlock filter achievement
    unlockAchievement('filter_user');
}

function getFilteredProjects(): Project[] {
    const activeFilters = filterTags.filter(tag => tag.active);
    
    if (activeFilters.length === 0) {
        return projects;
    }

    return projects.filter(project => {
        return activeFilters.some(filter =>
            project.tags.some(projectTag =>
                projectTag.toLowerCase().includes(filter.name.toLowerCase())
            )
        );
    });
}

function renderProjects(projectsToRender: Project[]): void {
    const projectsGrid = document.getElementById('projects-grid');
    if (!projectsGrid) return;

    projectsGrid.replaceChildren();

    // Update live count
    const countEl = document.getElementById('projects-count');
    if (countEl) {
        countEl.textContent = `Showing ${projectsToRender.length} of ${projects.length} projects`;
    }

    projectsToRender.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsGrid.appendChild(projectCard);
    });

    // Show message if no projects match
    if (projectsToRender.length === 0) {
        const col = document.createElement('div');
        col.className = 'col-12 text-center py-5';

        const heading = document.createElement('h4');
        heading.textContent = 'No projects found';
        col.appendChild(heading);

        const message = document.createElement('p');
        message.className = 'text-muted';
        message.textContent = 'Try adjusting your filters';
        col.appendChild(message);

        projectsGrid.appendChild(col);
    }
}

function getProjectLink(project: Project): string | null {
    if (project.webpage_link) return project.webpage_link;
    if (project.page && project.status !== 'in_progress') return `/pages/projects/${project.page}`;
    return null;
}

function getCategoryClass(tags: string[]): string {
    const primary = (tags[0] || '').toLowerCase();
    if (primary === 'python') return 'cat-python';
    if (primary === 'automation') return 'cat-automation';
    if (primary === 'finance') return 'cat-finance';
    if (primary === 'innovation' || primary === 'creative') return 'cat-creative';
    if (primary === 'r') return 'cat-r';
    return 'cat-default';
}

function createProjectCard(project: Project, index: number): HTMLDivElement {
    const isFeatured = index === 0;
    const link = getProjectLink(project);

    const wrapper = document.createElement('div');
    wrapper.className = isFeatured ? 'col-12' : 'col-lg-4 col-md-6';
    wrapper.setAttribute('data-aos', 'fade-up');
    wrapper.setAttribute('data-aos-delay', Math.min(index * 80, 400).toString());

    // Card is an <a> if linkable, otherwise a <div>
    const projectCard = document.createElement(link ? 'a' : 'div') as HTMLAnchorElement & HTMLDivElement;
    const categoryClass = getCategoryClass(project.tags);
    projectCard.className = `project-card h-100 ${isFeatured ? 'project-card-featured' : ''} ${categoryClass}`;

    if (link) {
        (projectCard as HTMLAnchorElement).href = link;
        if (project.webpage_link && project.webpage_link.startsWith('http')) {
            (projectCard as HTMLAnchorElement).target = '_blank';
            (projectCard as HTMLAnchorElement).rel = 'noopener noreferrer';
        }
    }

    // Image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'project-image';

    const img = document.createElement('img');
    img.src = `/assets/images/${project.image}`;
    img.alt = project.title;
    img.loading = 'lazy';
    img.addEventListener('error', () => { img.src = '/assets/images/placeholder.svg'; });
    imageContainer.appendChild(img);

    if (project.is_interactive) {
        const badge = document.createElement('span');
        badge.className = 'badge bg-success project-badge';
        badge.textContent = 'Interactive';
        imageContainer.appendChild(badge);
    }

    if (project.status === 'in_progress') {
        const badge = document.createElement('span');
        badge.className = 'badge bg-warning project-badge';
        badge.textContent = 'In Progress';
        imageContainer.appendChild(badge);
    }

    projectCard.appendChild(imageContainer);

    // Content
    const contentContainer = document.createElement('div');
    contentContainer.className = 'project-content';

    const title = document.createElement(isFeatured ? 'h3' : 'h5');
    title.className = 'project-title';
    title.textContent = project.title;
    contentContainer.appendChild(title);

    const description = document.createElement('p');
    description.className = `project-description ${isFeatured ? 'project-description-featured' : ''}`;
    description.textContent = project.description;
    contentContainer.appendChild(description);

    const techContainer = document.createElement('div');
    techContainer.className = 'project-technologies';
    project.technologies.slice(0, isFeatured ? 5 : 3).forEach(tech => {
        const techTag = document.createElement('span');
        techTag.className = 'tech-tag';
        techTag.textContent = tech;
        techContainer.appendChild(techTag);
    });
    contentContainer.appendChild(techContainer);

    if (!link && project.status === 'in_progress') {
        const comingSoon = document.createElement('span');
        comingSoon.className = 'coming-soon-label';
        comingSoon.textContent = 'Coming Soon';
        contentContainer.appendChild(comingSoon);
    }

    projectCard.appendChild(contentContainer);

    if (link) {
        const cta = document.createElement('div');
        cta.className = 'project-cta';
        cta.textContent = isFeatured ? 'View Project \u2192' : '\u2192';
        projectCard.appendChild(cta);
    }

    wrapper.appendChild(projectCard);
    return wrapper;
}

function logFilterChange(_tagName: string, _isAll: boolean): void {
    // Filter tracking placeholder
}

