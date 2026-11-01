/**
 * Sync facade over the lazy-loaded SceneDirector.
 *
 * This module has NO three.js dependency, so views and the shell can import
 * it statically without pulling three into the entry chunk. It owns the
 * mount policy (idle after load on high tier, first interaction on low)
 * and remembers the latest formation request until the director exists.
 * A view can skip the low-tier wait with loadSceneNow() (the phone home
 * intro does) and await sceneReady() to know whether particles are coming.
 */

import { getGraphicsTier } from '../utils/capabilities';
import type { FormationBuilder } from './formationTypes';

type DirectorModule = typeof import('./SceneDirector');

let mod: DirectorModule | null = null;
let pending: FormationBuilder | null = null;
let scheduled = false;
let loading: Promise<void> | null = null;

let resolveReady: (ready: boolean) => void = () => {};
const ready = new Promise<boolean>((resolve) => {
    resolveReady = resolve;
});

/** Resolves true once the particle stage is running, false if it never will. */
export function sceneReady(): Promise<boolean> {
    return ready;
}

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

function load(): Promise<void> {
    loading ??= (async () => {
        try {
            mod = await import('./SceneDirector');
            mod.createDirector();
            if (pending) mod.requestFormation(pending);
            resolveReady(Boolean(mod.getDirector()));
        } catch {
            mod = null; // scene is a progressive enhancement — never break the page
            resolveReady(false);
        }
    })();
    return loading;
}

/** Load the stage now, skipping the low tier's wait for a first interaction. */
export function loadSceneNow(): void {
    if (getGraphicsTier() === 'none') {
        resolveReady(false);
        return;
    }
    void load();
}

/** Called once from the shell. */
export function scheduleScene(): void {
    if (scheduled) return;
    scheduled = true;

    const tier = getGraphicsTier();
    if (tier === 'none') {
        resolveReady(false);
        return;
    }

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
