/** Minimal mono footer, rendered once by the shell. */

export function renderFooter(): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'site-footer container-x';

    const line = document.createElement('div');
    line.className = 'site-footer-line';

    const left = document.createElement('span');
    left.textContent = `© ${new Date().getFullYear()} JACK VAN ZEELAND`;

    const right = document.createElement('span');
    for (const [href, label] of [
        ['https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/', 'LINKEDIN'],
        ['https://github.com/jackvanzeeland', 'GITHUB'],
        ['mailto:jack.vanzeeland@outlook.com', 'EMAIL']
    ]) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
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
