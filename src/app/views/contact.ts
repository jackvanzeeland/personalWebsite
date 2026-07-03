/** Placeholder view — replaced by the real implementation in its plan task. */
import type { View } from './types';

const view: View = {
    mount(el) {
        const wrap = document.createElement('section');
        wrap.className = 'container-x';
        wrap.style.paddingTop = '20vh';
        const eyebrow = document.createElement('p');
        eyebrow.className = 'eyebrow';
        eyebrow.textContent = '// UNDER CONSTRUCTION';
        const h = document.createElement('h1');
        h.textContent = 'contact';
        wrap.append(eyebrow, h);
        el.appendChild(wrap);
    },
    unmount() { /* nothing to clean up */ }
};

export default view;
