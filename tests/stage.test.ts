import { describe, it, expect, vi, beforeEach } from 'vitest';

const createDirector = vi.fn();
const getDirector = vi.fn(() => ({}));
const tier = { value: 'low' as 'none' | 'low' | 'high' };

vi.mock('../src/scene/SceneDirector', () => ({
    createDirector,
    getDirector,
    requestFormation: vi.fn()
}));
vi.mock('../src/utils/capabilities', () => ({
    getGraphicsTier: () => tier.value,
    prefersReducedMotion: () => false
}));

async function freshStage() {
    vi.resetModules();
    return import('../src/scene/stage');
}

describe('scene stage', () => {
    beforeEach(() => {
        createDirector.mockClear();
        getDirector.mockReset().mockReturnValue({});
        tier.value = 'low';
    });

    it('low tier waits for first interaction by default', async () => {
        const stage = await freshStage();
        stage.scheduleScene();
        await new Promise((r) => setTimeout(r, 0));
        expect(createDirector).not.toHaveBeenCalled();
    });

    it('loadSceneNow loads the low tier immediately and reports ready', async () => {
        const stage = await freshStage();
        stage.scheduleScene();
        stage.loadSceneNow();
        await expect(stage.sceneReady()).resolves.toBe(true);
        expect(createDirector).toHaveBeenCalledTimes(1);
    });

    it('loading twice creates one director', async () => {
        const stage = await freshStage();
        stage.loadSceneNow();
        stage.loadSceneNow();
        await stage.sceneReady();
        window.dispatchEvent(new Event('scroll'));
        await new Promise((r) => setTimeout(r, 0));
        expect(createDirector).toHaveBeenCalledTimes(1);
    });

    it('tier none never loads and reports not ready', async () => {
        tier.value = 'none';
        const stage = await freshStage();
        stage.loadSceneNow();
        await expect(stage.sceneReady()).resolves.toBe(false);
        expect(createDirector).not.toHaveBeenCalled();
    });

    it('a director that fails to start reports not ready', async () => {
        getDirector.mockReturnValue(null as never);
        const stage = await freshStage();
        stage.loadSceneNow();
        await expect(stage.sceneReady()).resolves.toBe(false);
    });
});
