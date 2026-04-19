/**
 * Header Component
 * Reusable navigation header for all pages
 * Automatically highlights active page
 */

export interface NavigationItem {
    label: string;
    href: string;
    isActive?: boolean;
}

export function createHeader(currentPage?: string): HTMLElement {
    const header = document.createElement('header');
    header.id = 'main-header';

    // Skip to content link (WCAG 2.4.1)
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'visually-hidden-focusable';
    skipLink.textContent = 'Skip to main content';
    header.appendChild(skipLink);

    const nav = document.createElement('nav');
    nav.className = 'navbar navbar-expand-lg fixed-top';

    const container = document.createElement('div');
    container.className = 'container';

    // Brand
    const brand = document.createElement('a');
    brand.className = 'navbar-brand';
    brand.href = '/';

    const brandImg = document.createElement('img');
    brandImg.src = '/assets/images/JVZLogo.png';
    brandImg.alt = 'JVZ';
    brandImg.className = 'navbar-brand-logo';
    brand.appendChild(brandImg);

    container.appendChild(brand);

    // Toggle button for mobile
    const toggleButton = document.createElement('button');
    toggleButton.className = 'navbar-toggler';
    toggleButton.type = 'button';
    toggleButton.setAttribute('data-bs-toggle', 'collapse');
    toggleButton.setAttribute('data-bs-target', '#navbarNav');
    toggleButton.setAttribute('aria-controls', 'navbarNav');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('aria-label', 'Toggle navigation');

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'navbar-toggler-icon';
    toggleButton.appendChild(toggleIcon);
    container.appendChild(toggleButton);

    // Navigation items
    const navItems: NavigationItem[] = [
        { label: 'Projects', href: '/pages/projects' },
        { label: 'About', href: '/pages/about' },
        { label: 'Beyond the Code', href: '/pages/beyond-the-code' },
        { label: 'Journey', href: '/pages/journey' }
    ];

    // Create navbar collapse
    const navbarCollapse = document.createElement('div');
    navbarCollapse.className = 'collapse navbar-collapse';
    navbarCollapse.id = 'navbarNav';

    const navList = document.createElement('ul');
    navList.className = 'navbar-nav ms-auto';

    // Add navigation items
    navItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';

        const a = document.createElement('a');
        a.className = 'nav-link';
        a.href = item.href;
        a.textContent = item.label;

        // Highlight active page
        if (currentPage && isActivePage(item.href, currentPage)) {
            a.classList.add('active');
        }

        li.appendChild(a);
        navList.appendChild(li);
    });

    // Theme toggle button
    const themeLi = document.createElement('li');
    themeLi.className = 'nav-item';

    const themeButton = document.createElement('button');
    themeButton.className = 'nav-link btn btn-link';
    themeButton.id = 'theme-toggle';
    themeButton.setAttribute('aria-label', 'Toggle dark mode');
    themeButton.setAttribute('aria-pressed', 'false');

    const themeIcon = document.createElement('span');
    themeIcon.id = 'theme-icon';
    themeIcon.textContent = '🌙';
    themeButton.appendChild(themeIcon);

    themeLi.appendChild(themeButton);
    navList.appendChild(themeLi);

    navbarCollapse.appendChild(navList);
    container.appendChild(navbarCollapse);
    nav.appendChild(container);
    header.appendChild(nav);

    return header;
}

/**
 * Determine if a navigation link should be marked as active
 */
function isActivePage(href: string, currentPage: string): boolean {
    // Handle home page
    if (href === '/' || href === '/#projects') {
        return currentPage === '/';
    }

    // Handle anchor links
    if (href.includes('#')) {
        const path = href.split('#')[0];
        return currentPage.includes(path) || (path === '/' && currentPage === '/');
    }

    // "Projects" nav item should be active on the projects listing page
    // AND on individual project pages (e.g. /pages/projects/wordle-solver.html)
    if (href === '/pages/projects') {
        return currentPage === '/pages/projects' || currentPage.startsWith('/pages/projects/');
    }

    // Match by path
    return currentPage.includes(href);
}

/**
 * Initialize header on the page
 * Call this from your page's initialization
 */
export function initializeHeader(): void {
    const currentPage = window.location.pathname;
    const header = createHeader(currentPage);

    // Insert at the beginning of body
    const body = document.body;
    const firstChild = body.firstChild;

    if (firstChild) {
        body.insertBefore(header, firstChild);
    } else {
        body.appendChild(header);
    }
}
