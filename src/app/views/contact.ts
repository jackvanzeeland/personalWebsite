/**
 * /contact — the signal. Email is the glow CTA; everything else ghosts.
 */

import type { View } from './types';
import { requestFormation } from '../../scene/stage';
import { signalWaveBuilder } from '../../scene/formations/signalWave';
import { createOptimizedPicture } from '../../utils/optimizedImage';
import { icon, IconName } from '../icons';
import '../../styles/redesign/contact.css';

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function iconLink(
    href: string,
    label: string,
    iconName: IconName | null,
    options: { glow?: boolean; external?: boolean; download?: string } = {}
): HTMLAnchorElement {
    const a = el('a', options.glow ? 'btn-glow' : 'btn-ghost');
    a.href = href;
    if (iconName) a.appendChild(icon(iconName));
    a.appendChild(document.createTextNode(label));
    if (options.external) {
        a.setAttribute('data-external', '');
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
    }
    if (options.download) a.setAttribute('download', options.download);
    return a;
}

const view: View = {
    mount(root) {
        requestFormation(signalWaveBuilder);

        const section = el('section', 'contact container-x');

        const avatar = el('div', 'contact-avatar');
        avatar.appendChild(
            createOptimizedPicture('/assets/images/profile.jpg', {
                alt: 'Jack Van Zeeland',
                sizes: '140px',
                loading: 'eager'
            })
        );

        section.append(
            avatar,
            el('p', 'eyebrow', '// GET IN TOUCH'),
            el('h1', undefined, 'Send a signal'),
            el(
                'p',
                'contact-sub',
                'Hiring, collaborating, or just curious how something on this site works — my inbox is open.'
            )
        );

        const links = el('div', 'contact-links');
        links.append(
            iconLink('mailto:jack.vanzeeland@outlook.com', 'jack.vanzeeland@outlook.com', 'mail', { glow: true }),
            iconLink('https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/', 'LinkedIn', 'linkedin', { external: true }),
            iconLink('https://github.com/jackvanzeeland', 'GitHub', 'github', { external: true }),
            iconLink('/files/resume.pdf', 'Resume ↓', null, { download: 'jack-van-zeeland-resume.pdf' })
        );

        section.appendChild(links);
        section.appendChild(
            el('p', 'contact-location', '// CHICAGO, IL — USUALLY RESPONDS FAST')
        );

        root.appendChild(section);
    },

    unmount() {
        /* nothing global */
    }
};

export default view;
