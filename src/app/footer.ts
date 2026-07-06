/** Minimal mono footer, rendered once by the shell. */

import { icon, IconName } from './icons';

const LINKS: [string, string, IconName][] = [
    ['https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/', 'LINKEDIN', 'linkedin'],
    ['https://github.com/jackvanzeeland', 'GITHUB', 'github'],
    ['mailto:jack.vanzeeland@outlook.com', 'EMAIL', 'mail']
];

export function renderFooter(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'site-footer container-x';

    const line = document.createElement('div');
    line.className = 'site-footer-line';

    const left = document.createElement('span');
    left.textContent = `© ${new Date().getFullYear()} JACK VAN ZEELAND`;

    const right = document.createElement('span');
    right.className = 'site-footer-links';
    for (const [href, label, iconName] of LINKS) {
        const a = document.createElement('a');
        a.href = href;
        a.appendChild(icon(iconName, 13));
        a.appendChild(document.createTextNode(label));
        if (!href.startsWith('mailto:')) {
            a.setAttribute('data-external', '');
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        right.appendChild(a);
    }

    line.append(left, right);
    footer.appendChild(line);
    return footer;
}
