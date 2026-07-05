/**
 * /contact — the signal. Email is the glow CTA; everything else ghosts.
 */

import type { View } from './types';
import { requestFormation } from '../../scene/stage';
import { signalWaveBuilder } from '../../scene/formations/signalWave';
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

const view: View = {
    mount(root) {
        requestFormation(signalWaveBuilder);

        const section = el('section', 'contact container-x');
        section.append(
            el('p', 'eyebrow', '// GET IN TOUCH'),
            el('h1', undefined, 'Send a signal'),
            el(
                'p',
                'contact-sub',
                'Hiring, collaborating, or just curious how something on this site works — my inbox is open.'
            )
        );

        const links = el('div', 'contact-links');

        const email = el('a', 'btn-glow', 'jack.vanzeeland@outlook.com');
        email.href = 'mailto:jack.vanzeeland@outlook.com';
        links.appendChild(email);

        const addGhost = (href: string, label: string, external = true): void => {
            const a = el('a', 'btn-ghost', label);
            a.href = href;
            if (external) {
                a.setAttribute('data-external', '');
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
            }
            links.appendChild(a);
        };
        addGhost('https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/', 'LinkedIn ↗');
        addGhost('https://github.com/jackvanzeeland', 'GitHub ↗');

        const resume = el('a', 'btn-ghost', 'Resume ↓');
        resume.href = '/assets/files/resume.pdf';
        resume.setAttribute('download', 'jack-van-zeeland-resume.pdf');
        links.appendChild(resume);

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
