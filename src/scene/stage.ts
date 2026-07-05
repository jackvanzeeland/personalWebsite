/**
 * Sync facade over the lazy-loaded SceneDirector.
 *
 * This module has NO three.js dependency, so views and the shell can import
 * it statically without pulling three into the entry chunk. It owns the
 * mount policy (idle after load on high tier, first interaction on low)
 * and remembers the latest formation request until the director exists.
 */

import { getGraphicsTier } from '../utils/capabilities';
import type { FormationBuilder } from './formationTypes';

type DirectorModule = typeof import('./SceneDirector');

let mod: DirectorModule | null = null;
let pending: FormationBuilder | null = null;
let scheduled = false;

export function requestFormation(builder: FormationBuilder): void {
    pending = builder;
    mod?.requestFormation(builder);
}

export function pauseScene(): void {
    mod?.getDirector()?.pause();
}

export function resumeScene(): void {
    mod?.getDirector()?.resume();
}

async function load(): Promise<void> {
    if (mod) return;
    try {
        mod = await import('./SceneDirector');
        mod.createDirector();
        if (pending) mod.requestFormation(pending);
    } catch {
        mod = null; // scene is a progressive enhancement — never break the page
    }
}

/** Called once from the shell. */
export function scheduleScene(): void {
    if (scheduled) return;
    scheduled = true;

    const tier = getGraphicsTier();
    if (tier === 'none') return;

    const whenIdle = (): void => {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => void load(), { timeout: 3000 });
        } else {
            setTimeout(() => void load(), 350);
        }
    };

    if (tier === 'low') {
        const events: (keyof WindowEventMap)[] = ['scroll', 'pointerdown', 'keydown'];
        const onFirst = (): void => {
            events.forEach((e) => window.removeEventListener(e, onFirst));
            whenIdle();
        };
        events.forEach((e) => window.addEventListener(e, onFirst, { passive: true }));
        return;
    }

    if (document.readyState === 'complete') {
        whenIdle();
    } else {
        window.addEventListener('load', whenIdle, { once: true });
    }
}
