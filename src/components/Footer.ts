/**
 * Footer Component
 * Reusable footer for all pages
 */

export interface SocialLink {
    label: string;
    href: string;
}

export function createFooter(): HTMLElement {
    const footer = document.createElement('footer');
    footer.className = 'py-4';

    const container = document.createElement('div');
    container.className = 'container';

    // Top row with name and social links
    const row = document.createElement('div');
    row.className = 'row';

    // Left column - Name and title
    const leftCol = document.createElement('div');
    leftCol.className = 'col-md-6';

    const name = document.createElement('h5');
    name.textContent = 'Jack Van Zeeland';
    leftCol.appendChild(name);

    const title = document.createElement('p');
    title.textContent = 'Software Engineer & Problem Solver';
    leftCol.appendChild(title);

    row.appendChild(leftCol);

    // Right column - Social links
    const rightCol = document.createElement('div');
    rightCol.className = 'col-md-6';

    const linksContainer = document.createElement('div');
    linksContainer.className = 'd-flex justify-content-end gap-3';

    const socialLinks: SocialLink[] = [
        {
            label: 'LinkedIn',
            href: 'https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/'
        },
        {
            label: 'GitHub',
            href: 'https://github.com/jackvanzeeland'
        }
    ];

    socialLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = '';
        a.textContent = link.label;
        linksContainer.appendChild(a);
    });

    rightCol.appendChild(linksContainer);
    row.appendChild(rightCol);
    container.appendChild(row);

    // Divider
    const hr = document.createElement('hr');
    hr.className = 'my-3';
    container.appendChild(hr);

    // Copyright
    const copyrightDiv = document.createElement('div');
    copyrightDiv.className = 'text-center';

    const copyright = document.createElement('small');
    const year = new Date().getFullYear();
    copyright.innerHTML = `&copy; ${year} Jack Van Zeeland. All rights reserved.`;
    copyrightDiv.appendChild(copyright);

    container.appendChild(copyrightDiv);
    footer.appendChild(container);

    return footer;
}

/**
 * Initialize footer on the page
 * Call this from your page's initialization
 */
export function initializeFooter(): void {
    const footer = createFooter();
    document.body.appendChild(footer);
}
