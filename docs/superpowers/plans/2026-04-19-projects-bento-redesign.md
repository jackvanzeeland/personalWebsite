# Projects Page Bento Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the equal-weight project grid with a bento hero layout for the top 3 projects and a compact 4-column grid for the remaining 7, with a single filter dropdown replacing the pill-wall.

**Architecture:** Split rendering into two modes — unfiltered (bento + compact grid) and filtered (flat compact grid). The `featured` flag in project data drives which projects appear in the bento. The filter dropdown replaces all pill buttons with a single custom dropdown element.

**Tech Stack:** TypeScript, CSS custom properties, Vite, Bootstrap (grid only)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/types/index.ts` | Modify | Add `featured?: boolean` to `Project` |
| `src/data/projects.ts` | Modify | Reorder array + add `featured: true` to 3 projects |
| `pages/projects.html` | Modify | New HTML shell: dropdown wrapper, bento div, divider, compact grid |
| `src/styles/components/projects.css` | Modify | Bento cards, compact cards, filter dropdown, divider — remove old pill styles |
| `src/components/ProjectGrid.ts` | Rewrite | Split render logic: `renderBento`, `renderCompactGrid`, `renderFilterDropdown` |

---

## Task 1: Add `featured` to Project type and data

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/data/projects.ts`

- [ ] **Step 1: Add `featured?: boolean` to the Project interface**

In `src/types/index.ts`, add the field after `status?`:

```typescript
export interface Project {
    title: string;
    description: string;
    technologies: string[];
    tags: string[];
    is_interactive: boolean;
    github_link: string;
    youtube_link: string;
    tiktok_link: string;
    page: string;
    image: string;
    status?: string;
    featured?: boolean;
    live_demo?: string;
    webpage_link?: string;
}
```

- [ ] **Step 2: Reorder projects array and add `featured: true`**

In `src/data/projects.ts`, move Budget Tracker, Woku, and Super Bowl Competition to the top of the `PROJECTS` array (in that order) and add `featured: true` to each. The array must start with these three entries:

```typescript
export const PROJECTS: Project[] = [
  {
    title: "Budget Tracker",
    description:
      "Built a personal finance tracker with transaction history, budget categories, and data visualizations. Tracks spending across categories with monthly trend charts, donut breakdowns, and vendor analysis.",
    technologies: ["React", "TypeScript", "Supabase"],
    tags: ["Finance", "Interactive", "Data", "Tools"],
    github_link: "",
    image: "budgetTracker.png",
    page: "",
    is_interactive: true,
    featured: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "/projects/budget-tracker/",
  },
  {
    title: "Woku",
    description:
      "Developed a game that is a hybrid of Sudoku and Wordle. A Sudoku-style board is built from a 9-letter word. Players must figure out the word — they win by guessing it correctly or by solving a row/column that spells it out.",
    technologies: ["TypeScript", "Vite"],
    tags: ["Innovation", "Creative", "Interactive"],
    github_link: "",
    image: "woku.png",
    page: "",
    is_interactive: true,
    featured: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "/projects/woku/",
  },
  {
    title: "Super Bowl Competition",
    description:
      "Created a system for a Super Bowl prop bet competition, where participants ranked their confidence in 20 prop outcomes. The tool validated confidence values compared predictions to real results and calculated each participant's score to determine winner.",
    technologies: ["Python", "Creative"],
    tags: ["Python", "Data", "Sports"],
    github_link: "",
    image: "superBowlMain.jpeg",
    page: "",
    is_interactive: false,
    featured: true,
    youtube_link: "",
    tiktok_link: "",
    live_demo: "",
    webpage_link: "/projects/superbowl/",
  },
  // ... remaining 7 projects unchanged, after these three
];
```

Keep all 7 remaining projects exactly as they are, appended after these three.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: `✓ built` with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/data/projects.ts
git commit -m "feat: add featured flag to Project type and mark top 3 projects"
```

---

## Task 2: Update projects.html structure

**Files:**
- Modify: `pages/projects.html`

Replace the entire `<!-- Filter & Grid Section -->` block with this new structure:

- [ ] **Step 1: Replace the filter & grid section**

Find and replace:
```html
      <!-- Filter & Grid Section -->
      <section class="py-5">
        <div class="container">

          <!-- Filter Bar -->
          <div class="projects-filter-bar mb-5" data-aos="fade-up">
            <div class="projects-filter-inner">
              <span class="filter-label-text">Filter by</span>
              <div id="filter-buttons" class="d-flex flex-wrap gap-2"></div>
            </div>
            <p id="projects-count" class="projects-count mb-0"></p>
          </div>

          <div id="projects-grid" class="row g-4"></div>
        </div>
      </section>
```

With:
```html
      <!-- Filter & Grid Section -->
      <section class="py-5">
        <div class="container">

          <!-- Filter Dropdown (right-aligned) -->
          <div class="d-flex justify-content-end mb-4" data-aos="fade-up">
            <div id="filter-dropdown-wrapper"></div>
          </div>

          <!-- Bento Grid (featured 3, unfiltered mode only) -->
          <div id="bento-grid" class="bento-grid"></div>

          <!-- More Work Divider (shown between bento and compact grid) -->
          <div id="more-work-divider" class="more-work-divider" style="display: none;">
            <span>More Work</span>
          </div>

          <!-- Filter Results Count (shown in filtered mode) -->
          <p id="filter-results-count" class="text-muted small mb-3" style="display: none;"></p>

          <!-- Compact Grid (remaining 7 or all filtered results) -->
          <div id="projects-grid" class="row g-3"></div>

        </div>
      </section>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: `✓ built` with no errors.

- [ ] **Step 3: Commit**

```bash
git add pages/projects.html
git commit -m "feat: update projects.html with bento + compact grid structure"
```

---

## Task 3: Rewrite projects.css

**Files:**
- Modify: `src/styles/components/projects.css`

Replace everything from the top of the file through the `/* Responsive Design */` section at the bottom (stop before `/* Project Detail Page Styles */` — those stay unchanged). The replacement is the full block below.

- [ ] **Step 1: Replace card and filter styles**

Replace from line 1 through the responsive section with:

```css
/* ============================================
   Category accent colors (shared across card types)
   ============================================ */
.cat-default   { --card-accent: var(--accent-primary); }
.cat-python    { --card-accent: #10b981; }
.cat-automation{ --card-accent: #f59e0b; }
.cat-finance   { --card-accent: #3b82f6; }
.cat-creative  { --card-accent: #8b5cf6; }
.cat-r         { --card-accent: #ef4444; }

/* ============================================
   Bento grid container
   ============================================ */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr 0.72fr;
  gap: 1rem;
  margin-bottom: 0;
}

/* ============================================
   Bento hero card (left, large)
   ============================================ */
.bento-hero-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: transform 0.28s cubic-bezier(0.4,0,0.2,1),
              box-shadow 0.28s ease,
              border-color 0.28s ease;
  box-shadow: var(--shadow-sm);
}

.bento-hero-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--card-accent);
  z-index: 1;
}

.bento-hero-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-xl);
  border-color: color-mix(in srgb, var(--card-accent) 40%, var(--border-color));
  text-decoration: none;
  color: inherit;
}

.bento-hero-image {
  height: 220px;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.bento-hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.bento-hero-card:hover .bento-hero-image img {
  transform: scale(1.05);
}

.bento-hero-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bento-hero-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.bento-hero-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.65;
  flex: 1;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bento-hero-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.bento-hero-cta {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--card-accent);
  white-space: nowrap;
  transition: letter-spacing 0.2s ease;
}

.bento-hero-card:hover .bento-hero-cta {
  letter-spacing: 0.02em;
}

/* ============================================
   Bento right stack
   ============================================ */
.bento-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ============================================
   Bento side cards (right column, image-fill with overlay)
   ============================================ */
.bento-side-card {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  text-decoration: none;
  color: white;
  display: block;
  flex: 1;
  min-height: 130px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.28s cubic-bezier(0.4,0,0.2,1),
              box-shadow 0.28s ease;
}

.bento-side-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--card-accent);
  z-index: 2;
}

.bento-side-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  text-decoration: none;
  color: white;
}

.bento-side-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
  position: absolute;
  top: 0; left: 0;
}

.bento-side-card:hover img {
  transform: scale(1.06);
}

.bento-side-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 1.5rem 1rem 0.85rem;
  background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%);
  z-index: 1;
}

.bento-side-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.3rem;
}

.tech-tag-light {
  background: rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.9);
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

/* ============================================
   More Work divider
   ============================================ */
.more-work-divider {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin: 2.5rem 0 2rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.more-work-divider::before,
.more-work-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

/* ============================================
   Compact cards (remaining 7 or filtered results)
   ============================================ */
.compact-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  position: relative;
  height: 100%;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1),
              box-shadow 0.25s ease,
              border-color 0.25s ease;
}

.compact-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--card-accent);
  z-index: 1;
}

.compact-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: color-mix(in srgb, var(--card-accent) 40%, var(--border-color));
  text-decoration: none;
  color: inherit;
}

.compact-card-img {
  height: 140px;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.compact-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.compact-card:hover .compact-card-img img {
  transform: scale(1.05);
}

.compact-card-body {
  padding: 0.9rem 1rem 0.8rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.compact-card-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
}

.compact-cta {
  margin-top: auto;
  padding-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--card-accent);
  opacity: 0;
  transition: opacity 0.2s ease;
  display: block;
}

.compact-card:hover .compact-cta {
  opacity: 1;
}

/* ============================================
   Filter dropdown
   ============================================ */
.filter-dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.filter-dropdown-btn {
  background: var(--bg-primary);
  border: 1.5px solid var(--border-color);
  border-radius: 20px;
  padding: 0.4rem 1rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
  white-space: nowrap;
}

.filter-dropdown-btn:hover,
.filter-dropdown-btn.open {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.filter-dropdown-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.filter-dropdown-list {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  list-style: none;
  padding: 0.4rem 0;
  margin: 0;
  min-width: 180px;
  z-index: 100;
  display: none;
}

.filter-dropdown-list.open {
  display: block;
}

.filter-dropdown-list li {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: background 0.15s ease, color 0.15s ease;
}

.filter-dropdown-list li:hover {
  background: var(--bg-soft);
  color: var(--accent-primary);
}

.filter-dropdown-list li.active {
  color: var(--accent-primary);
  font-weight: 600;
}

/* ============================================
   Shared tech tags (used across all card types)
   ============================================ */
.project-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tech-tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 500;
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 991px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }

  .bento-stack {
    flex-direction: row;
  }

  .bento-side-card {
    min-height: 180px;
  }
}

@media (max-width: 575px) {
  .bento-stack {
    flex-direction: column;
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: `✓ built` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/components/projects.css
git commit -m "feat: add bento, compact card, and filter dropdown CSS"
```

---

## Task 4: Rewrite ProjectGrid.ts

**Files:**
- Rewrite: `src/components/ProjectGrid.ts`

Replace the entire file with the following. The public API (`loadProjects`, `initializeFiltering`) remains identical so `src/pages/projects.ts` needs no changes.

- [ ] **Step 1: Replace ProjectGrid.ts**

```typescript
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
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: `✓ built` with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProjectGrid.ts
git commit -m "feat: rewrite ProjectGrid with bento hero + compact grid + filter dropdown"
```

---

## Task 5: Final verification

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: `✓ built` in under 2 seconds, no warnings about unused variables or missing types.

- [ ] **Step 2: Spot-check the data split**

Open browser dev tools on the projects page and run:

```javascript
// Should print 3
document.querySelectorAll('.bento-hero-card, .bento-side-card').length

// Should print 7
document.querySelectorAll('#projects-grid .compact-card').length
```

- [ ] **Step 3: Spot-check filter**

Click the dropdown, select "Python". Verify:
- Bento disappears
- Compact grid shows only Python-tagged projects
- Button label updates to `Python ×`
- Click `Python ×` → bento restores, all 7 compact cards reappear

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: projects page bento redesign complete"
```
