import { Project, FilterTag } from '../types';
import { PROJECTS } from '../data/projects';
import { unlockAchievement } from '../utils/journey';

const projects: Project[] = PROJECTS;
const featuredProjects: Project[] = projects.filter(p => p.featured);
const restProjects: Project[] = projects.filter(p => !p.featured);

let filterTags: FilterTag[] = [];
let activeFilter: string | null = null;

// ─── Public API ────────────────────────────────────────────────────────────

export async function loadProjects(): Promise<Project[]> {
    return projects;
}

export function initializeFiltering(): void {
    if (projects.length === 0) return;
    extractFilterTags();
    renderFilterDropdown();
    renderPage();
}

// ─── Page orchestration ────────────────────────────────────────────────────

function renderPage(): void {
    const bentoEl = document.getElementById('bento-grid');
    const divider = document.getElementById('more-work-divider');
    const countEl = document.getElementById('filter-results-count');

    if (activeFilter) {
        // Filtered mode: hide bento, show flat compact grid
        if (bentoEl) bentoEl.style.display = 'none';
        if (divider) divider.style.display = 'none';
        if (countEl) countEl.style.display = '';

        const matches = getFilteredProjects();
        renderCompactGrid(matches);

        if (countEl) {
            countEl.textContent = `Showing ${matches.length} of ${projects.length} projects`;
        }
    } else {
        // All mode: bento + more-work divider + compact grid
        if (bentoEl) bentoEl.style.display = '';
        if (countEl) countEl.style.display = 'none';

        renderBento();
        renderCompactGrid(restProjects);

        if (divider) divider.style.display = '';
    }
}

// ─── Bento rendering ──────────────────────────────────────────────────────

function renderBento(): void {
    const bentoEl = document.getElementById('bento-grid');
    if (!bentoEl) return;
    bentoEl.replaceChildren();

    if (featuredProjects.length === 0) return;

    const [hero, ...sides] = featuredProjects;

    bentoEl.appendChild(createBentoHeroCard(hero));

    if (sides.length > 0) {
        const stack = document.createElement('div');
        stack.className = 'bento-stack';
        sides.forEach(p => stack.appendChild(createBentoSideCard(p)));
        bentoEl.appendChild(stack);
    }
}

function createBentoHeroCard(project: Project): HTMLElement {
    const link = getProjectLink(project);
    const card = document.createElement(link ? 'a' : 'div') as HTMLAnchorElement & HTMLDivElement;
    card.className = `bento-hero-card ${getCategoryClass(project.tags)}`;

    if (link) {
        (card as HTMLAnchorElement).href = link;
        if (link.startsWith('http')) {
            (card as HTMLAnchorElement).target = '_blank';
            (card as HTMLAnchorElement).rel = 'noopener noreferrer';
        }
    }

    // Image
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'bento-hero-image';
    const img = document.createElement('img');
    img.src = `/assets/images/${project.image}`;
    img.alt = project.title;
    img.loading = 'lazy';
    img.addEventListener('error', () => { img.src = '/assets/images/placeholder.svg'; });
    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    // Content
    const content = document.createElement('div');
    content.className = 'bento-hero-content';

    const title = document.createElement('h3');
    title.className = 'bento-hero-title';
    title.textContent = project.title;
    content.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'bento-hero-desc';
    desc.textContent = project.description;
    content.appendChild(desc);

    const footer = document.createElement('div');
    footer.className = 'bento-hero-footer';

    const techContainer = document.createElement('div');
    techContainer.className = 'project-technologies';
    project.technologies.slice(0, 5).forEach(tech => {
        const tag = document.createElement('span');
        tag.className = 'tech-tag';
        tag.textContent = tech;
        techContainer.appendChild(tag);
    });
    footer.appendChild(techContainer);

    if (link) {
        const cta = document.createElement('span');
        cta.className = 'bento-hero-cta';
        cta.textContent = 'View Project \u2192';
        footer.appendChild(cta);
    }

    content.appendChild(footer);
    card.appendChild(content);
    return card;
}

function createBentoSideCard(project: Project): HTMLElement {
    const link = getProjectLink(project);
    const card = document.createElement(link ? 'a' : 'div') as HTMLAnchorElement & HTMLDivElement;
    card.className = `bento-side-card ${getCategoryClass(project.tags)}`;

    if (link) {
        (card as HTMLAnchorElement).href = link;
        if (link.startsWith('http')) {
            (card as HTMLAnchorElement).target = '_blank';
            (card as HTMLAnchorElement).rel = 'noopener noreferrer';
        }
    }

    const img = document.createElement('img');
    img.src = `/assets/images/${project.image}`;
    img.alt = project.title;
    img.loading = 'lazy';
    img.addEventListener('error', () => { img.src = '/assets/images/placeholder.svg'; });
    card.appendChild(img);

    const overlay = document.createElement('div');
    overlay.className = 'bento-side-overlay';

    const title = document.createElement('h5');
    title.className = 'bento-side-title';
    title.textContent = project.title;
    overlay.appendChild(title);

    const techContainer = document.createElement('div');
    techContainer.className = 'project-technologies';
    project.technologies.slice(0, 3).forEach(tech => {
        const tag = document.createElement('span');
        tag.className = 'tech-tag-light';
        tag.textContent = tech;
        techContainer.appendChild(tag);
    });
    overlay.appendChild(techContainer);

    card.appendChild(overlay);
    return card;
}

// ─── Compact grid rendering ────────────────────────────────────────────────

function renderCompactGrid(projectsList: Project[]): void {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.replaceChildren();

    if (projectsList.length === 0) {
        const col = document.createElement('div');
        col.className = 'col-12 text-center py-5';
        const msg = document.createElement('p');
        msg.className = 'text-muted';
        msg.textContent = 'No projects match this filter.';
        col.appendChild(msg);
        grid.appendChild(col);
        return;
    }

    projectsList.forEach((project, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-6';
        col.setAttribute('data-aos', 'fade-up');
        col.setAttribute('data-aos-delay', Math.min(index * 80, 320).toString());
        col.appendChild(createCompactCard(project));
        grid.appendChild(col);
    });
}

function createCompactCard(project: Project): HTMLElement {
    const link = getProjectLink(project);
    const card = document.createElement(link ? 'a' : 'div') as HTMLAnchorElement & HTMLDivElement;
    card.className = `compact-card ${getCategoryClass(project.tags)} h-100`;

    if (link) {
        (card as HTMLAnchorElement).href = link;
        if (link.startsWith('http')) {
            (card as HTMLAnchorElement).target = '_blank';
            (card as HTMLAnchorElement).rel = 'noopener noreferrer';
        }
    }

    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'compact-card-img';
    const img = document.createElement('img');
    img.src = `/assets/images/${project.image}`;
    img.alt = project.title;
    img.loading = 'lazy';
    img.addEventListener('error', () => { img.src = '/assets/images/placeholder.svg'; });
    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    const body = document.createElement('div');
    body.className = 'compact-card-body';

    const title = document.createElement('h6');
    title.className = 'compact-card-title';
    title.textContent = project.title;
    body.appendChild(title);

    const techContainer = document.createElement('div');
    techContainer.className = 'project-technologies';
    project.technologies.slice(0, 3).forEach(tech => {
        const tag = document.createElement('span');
        tag.className = 'tech-tag';
        tag.textContent = tech;
        techContainer.appendChild(tag);
    });
    body.appendChild(techContainer);

    if (link) {
        const cta = document.createElement('span');
        cta.className = 'compact-cta';
        cta.textContent = 'View \u2192';
        body.appendChild(cta);
    }

    card.appendChild(body);
    return card;
}

// ─── Filter dropdown ───────────────────────────────────────────────────────

function renderFilterDropdown(): void {
    const wrapper = document.getElementById('filter-dropdown-wrapper');
    if (!wrapper) return;
    wrapper.replaceChildren();

    const btn = document.createElement('button');
    btn.id = 'filter-dropdown-btn';
    btn.className = 'filter-dropdown-btn';
    btn.textContent = 'All Categories \u25be';
    wrapper.appendChild(btn);

    const list = document.createElement('ul');
    list.id = 'filter-dropdown-list';
    list.className = 'filter-dropdown-list';

    const allItem = document.createElement('li');
    allItem.textContent = 'All Categories';
    allItem.dataset.tag = 'all';
    allItem.className = 'active';
    list.appendChild(allItem);

    filterTags.forEach(tag => {
        const item = document.createElement('li');
        item.textContent = tag.name.charAt(0).toUpperCase() + tag.name.slice(1).toLowerCase();
        item.dataset.tag = tag.name;
        list.appendChild(item);
    });

    wrapper.appendChild(list);

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        list.classList.toggle('open');
        btn.classList.toggle('open');
    });

    list.addEventListener('click', (e) => {
        const target = e.target as HTMLLIElement;
        const tag = target.dataset.tag;
        if (!tag) return;

        list.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        target.classList.add('active');

        if (tag === 'all') {
            activeFilter = null;
            btn.textContent = 'All Categories \u25be';
            btn.classList.remove('active');
        } else {
            activeFilter = tag;
            btn.textContent = `${target.textContent} \u00d7`;
            btn.classList.add('active');
        }

        list.classList.remove('open');
        btn.classList.remove('open');
        renderPage();
        unlockAchievement('filter_user');
    });

    document.addEventListener('click', () => {
        list.classList.remove('open');
        btn.classList.remove('open');
    });
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function extractFilterTags(): void {
    const tagCounts = new Map<string, number>();
    projects.forEach(project => {
        project.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
    });

    filterTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, active: false }));
}

function getFilteredProjects(): Project[] {
    if (!activeFilter) return projects;
    return projects.filter(project =>
        project.tags.some(tag => tag.toLowerCase() === activeFilter!.toLowerCase())
    );
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
