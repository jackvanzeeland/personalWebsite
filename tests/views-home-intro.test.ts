import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const stage = vi.hoisted(() => ({
    loadSceneNow: vi.fn(),
    requestFormation: vi.fn(),
    ready: Promise.resolve(true) as Promise<boolean>
}));

vi.mock('../src/scene/stage', () => ({
    loadSceneNow: stage.loadSceneNow,
    requestFormation: stage.requestFormation,
    sceneReady: () => stage.ready
}));

import homeView, { SCENE_DIM_CLASS } from '../src/app/views/home';
import { BOOT_FLAG, COMPACT_QUERY } from '../src/app/views/homeTerminalView';

function setLayout(compact: boolean) {
    vi.spyOn(window, 'matchMedia').mockImplementation(
        (q: string) =>
            ({
                matches: q === COMPACT_QUERY ? compact : false,
                media: q,
                addEventListener: () => {},
                removeEventListener: () => {}
            }) as unknown as MediaQueryList
    );
}

const dimmed = () => document.documentElement.classList.contains(SCENE_DIM_CLASS);
const ready = (root: HTMLElement) => root.querySelector('.home-term')!.classList.contains('is-ready');

describe('home phone monogram intro', () => {
    let root: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = '<main id="view-root"></main>';
        root = document.getElementById('view-root')!;
        sessionStorage.clear();
        stage.loadSceneNow.mockClear();
        stage.ready = Promise.resolve(true);
        vi.useFakeTimers();
    });

    afterEach(() => {
        homeView.unmount();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('phone, first visit: loads particles now, lets the monogram form, then dims and boots', async () => {
        setLayout(true);
        await homeView.mount(root, {});
        expect(stage.loadSceneNow).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(1500);
        expect(dimmed()).toBe(false);
        expect(ready(root)).toBe(false);
        await vi.advanceTimersByTimeAsync(500);
        expect(dimmed()).toBe(true);
        expect(ready(root)).toBe(true);
    });

    it('phone, particles slow: the terminal starts at the 2.5s cap anyway', async () => {
        setLayout(true);
        stage.ready = new Promise<boolean>(() => {});
        await homeView.mount(root, {});
        await vi.advanceTimersByTimeAsync(2400);
        expect(ready(root)).toBe(false);
        await vi.advanceTimersByTimeAsync(150);
        expect(ready(root)).toBe(true);
        expect(dimmed()).toBe(true);
    });

    it('phone, no particles (tier none / failure): no wait', async () => {
        setLayout(true);
        stage.ready = Promise.resolve(false);
        await homeView.mount(root, {});
        await vi.advanceTimersByTimeAsync(0);
        expect(ready(root)).toBe(true);
    });

    it('phone, repeat visit: dims right away with the finished terminal', async () => {
        setLayout(true);
        sessionStorage.setItem(BOOT_FLAG, '1');
        await homeView.mount(root, {});
        expect(stage.loadSceneNow).toHaveBeenCalledTimes(1);
        expect(dimmed()).toBe(true);
        expect(ready(root)).toBe(true);
    });

    it('desktop: no early load, no dimming, normal 600ms boot', async () => {
        setLayout(false);
        await homeView.mount(root, {});
        expect(stage.loadSceneNow).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(700);
        expect(ready(root)).toBe(true);
        expect(dimmed()).toBe(false);
    });

    it('leaving the page clears the dim and pending timers', async () => {
        setLayout(true);
        await homeView.mount(root, {});
        await vi.advanceTimersByTimeAsync(500);
        homeView.unmount();
        expect(vi.getTimerCount()).toBe(0);
        await vi.advanceTimersByTimeAsync(5000);
        expect(dimmed()).toBe(false);

        sessionStorage.setItem(BOOT_FLAG, '1');
        await homeView.mount(root, {});
        expect(dimmed()).toBe(true);
        homeView.unmount();
        expect(dimmed()).toBe(false);
    });
});
