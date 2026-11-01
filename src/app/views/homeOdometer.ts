/**
 * Rolling "years building professionally" odometer for the home hero.
 * Each digit is a 0–9 strip in a 1em window, slid with translateY so digits
 * roll rather than swap (CSS supplies the transition; reduced motion drops it).
 */

import { experienceAriaLabel, formatYears } from './homeExperience';

interface OdometerOptions {
    reducedMotion: boolean;
    now?: () => Date;
}

const TICK_MS = 100;
const REDUCED_TICK_MS = 1000;
const ARIA_EVERY_MS = 60_000;

function div(className: string, text?: string): HTMLDivElement {
    const node = document.createElement('div');
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

export function createOdometer(opts: OdometerOptions): { el: HTMLElement; destroy(): void } {
    const now = opts.now ?? (() => new Date());

    const el = div('home-odo');
    const value = div('home-odo-value');
    value.setAttribute('aria-hidden', 'true');
    el.setAttribute('role', 'img');
    el.append(div('home-odo-label', 'BUILDING PROFESSIONALLY'), value, div('home-odo-unit', 'years and counting'));

    let shape = '';
    let strips: HTMLElement[] = [];
    // Plain-text copy of the value for crawlers/reader mode; the strips' digits
    // come from CSS content so the markup never reads as "0123456789…".
    const plain = document.createElement('span');
    plain.className = 'home-odo-text';
    let lastAria = -Infinity;

    function build(str: string): void {
        value.replaceChildren(plain);
        strips = [];
        for (const ch of str) {
            if (/\d/.test(ch)) {
                const cell = document.createElement('span');
                cell.className = 'home-odo-digit';
                const strip = document.createElement('span');
                strip.className = 'home-odo-strip';
                cell.appendChild(strip);
                value.appendChild(cell);
                strips.push(strip);
            } else {
                const sep = document.createElement('span');
                sep.className = 'home-odo-sep';
                sep.textContent = ch;
                value.appendChild(sep);
            }
        }
    }

    function render(): void {
        const t = now();
        const str = formatYears(t);
        const nextShape = str.replace(/\d/g, '0');
        if (nextShape !== shape) {
            build(str);
            shape = nextShape;
        }
        plain.textContent = str;
        let i = 0;
        for (const ch of str) {
            if (/\d/.test(ch)) strips[i++].style.transform = `translateY(-${ch}em)`;
        }
        if (t.getTime() - lastAria >= ARIA_EVERY_MS) {
            el.setAttribute('aria-label', experienceAriaLabel(t));
            lastAria = t.getTime();
        }
    }

    let onScreen = true;
    const observer =
        typeof IntersectionObserver === 'undefined'
            ? null
            : new IntersectionObserver((entries) => {
                  onScreen = entries.some((e) => e.isIntersecting);
              });
    observer?.observe(el);

    render();
    const timer = setInterval(
        () => {
            if (document.hidden || !onScreen) return;
            render();
        },
        opts.reducedMotion ? REDUCED_TICK_MS : TICK_MS
    );

    return {
        el,
        destroy() {
            clearInterval(timer);
            observer?.disconnect();
        }
    };
}
