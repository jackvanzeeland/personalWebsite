import { describe, it, expect, beforeEach } from 'vitest';
import workDetail from '../src/app/views/workDetail';

describe('work detail view', () => {
    beforeEach(() => {
        document.body.innerHTML = '<main id="view-root"></main>';
    });

    it('renders not-found with a way back for unknown slugs', async () => {
        const root = document.getElementById('view-root')!;
        await workDetail.mount(root, { slug: 'does-not-exist' });
        expect(root.textContent).toContain('No such project');
        expect(root.querySelector('a[href="/projects"]')).toBeTruthy();
        workDetail.unmount();
    });

    it('renders a static detail with title and external links', async () => {
        const root = document.getElementById('view-root')!;
        await workDetail.mount(root, { slug: 'budgeting-automation' });
        expect(root.querySelector('h1')?.textContent).toContain('Budgeting Automation');
        expect(root.querySelector('a[href="/projects"]')).toBeTruthy();
        workDetail.unmount();
    });

    it('mounts the wordle solver DOM for the tool slug', async () => {
        const root = document.getElementById('view-root')!;
        await workDetail.mount(root, { slug: 'wordle-solver' });
        expect(root.querySelector('#wordle-lookup')).toBeTruthy();
        expect(root.querySelector('#wordle-search')).toBeTruthy();
        workDetail.unmount();
    });

    it('mounts the secret santa DOM for the tool slug', async () => {
        const root = document.getElementById('view-root')!;
        await workDetail.mount(root, { slug: 'secret-santa' });
        expect(root.querySelector('#name-input')).toBeTruthy();
        expect(root.querySelector('#generate-matches')).toBeTruthy();
        workDetail.unmount();
    });

    it('mounts the QR generator DOM for the tool slug', async () => {
        const root = document.getElementById('view-root')!;
        await workDetail.mount(root, { slug: 'qr-code-generator' });
        expect(root.querySelector('#qr-canvas')).toBeTruthy();
        expect(root.querySelector('#generate-btn')).toBeTruthy();
        expect(root.querySelector('a[href="/pages/artifacts/qr-code-generator"]')).toBeNull();
        workDetail.unmount();
    });

    it('mounts the UiPath processor DOM for the tool slug', async () => {
        const root = document.getElementById('view-root')!;
        await workDetail.mount(root, { slug: 'uipath-queue-processor' });
        expect(root.querySelector('#upload-zone')).toBeTruthy();
        expect(root.querySelector('#columns-grid')).toBeTruthy();
        workDetail.unmount();
    });

    it('mounts all 18 HTML gem cards for the tool slug', async () => {
        const root = document.getElementById('view-root')!;
        await workDetail.mount(root, { slug: 'html-gems' });
        expect(root.querySelectorAll('.html-gem-card').length).toBe(18);
        expect(root.querySelector('#html-gems-toc')).toBeTruthy();
        expect(root.querySelector('a[href="/pages/artifacts/html-gems"]')).toBeNull();
        workDetail.unmount();
    });
});
