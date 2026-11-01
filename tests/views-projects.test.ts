import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import projectsView from '../src/app/views/projects';
import { PROJECTS } from '../src/data/projects';
import { APP_ITEMS, INDEX_ITEMS, indexWorkTags } from '../src/data/workItems';

const APP_TITLES = ['Budget Tracker', 'Journal', 'Lists', 'Mortgage Simulator', 'NameKeep', 'Woku'];

let root: HTMLElement;

beforeEach(async () => {
    document.body.innerHTML = '<main id="view-root"></main>';
    root = document.getElementById('view-root')!;
    await projectsView.mount(root, {});
});

afterEach(() => {
    projectsView.unmount();
});

const tile = (title: string): Element =>
    [...root.querySelectorAll('.work-app')].find(
        (t) => t.querySelector('.work-app-name')?.textContent === title
    )!;

describe('apps shelf', () => {
    it('shows exactly the live apps, each with its icon', () => {
        const names = [...root.querySelectorAll('.work-app-name')].map((n) => n.textContent);
        expect(names.sort()).toEqual([...APP_TITLES].sort());
        for (const t of root.querySelectorAll('.work-app')) {
            expect(t.querySelector('.work-app-icon img')).not.toBeNull();
            expect(t.querySelector('.work-app-proof')?.textContent).toBeTruthy();
        }
    });

    it('opens each app at its live URL', () => {
        for (const item of APP_ITEMS) {
            const open = tile(item.title).querySelector<HTMLAnchorElement>('a.work-app-open')!;
            expect(open.getAttribute('href')).toBe(item.links.external);
            expect(open.hasAttribute('data-external')).toBe(true);
        }
        const budget = tile('Budget Tracker').querySelector<HTMLAnchorElement>('a.work-app-open')!;
        expect(budget.target).toBe('_blank');
        expect(budget.rel).toContain('noopener');
    });

    it('links to the story page only where the detail route is not shadowed by the app', () => {
        const story = (title: string) =>
            tile(title).querySelector<HTMLAnchorElement>('a.work-app-story');
        expect(story('Budget Tracker')?.getAttribute('href')).toBe('/projects/budget-tracker');
        // Woku moved to its own subdomain, so /projects/woku is the SPA detail page
        expect(story('Woku')?.getAttribute('href')).toBe('/projects/woku');
        // /projects/mortgage-simulator/ is the app itself (CloudFront behavior)
        expect(story('Mortgage Simulator')).toBeNull();
        const mortgage = tile('Mortgage Simulator').querySelector<HTMLAnchorElement>('a.work-app-open')!;
        expect(mortgage.target).toBe('');
    });
});

describe('project index', () => {
    it('lists every non-app item and no apps', () => {
        const titles = [...root.querySelectorAll('.work-row-title')].map((n) => n.textContent);
        expect(titles).toEqual(INDEX_ITEMS.map((i) => i.title));
        for (const app of APP_TITLES) expect(titles).not.toContain(app);
    });

    it('renders one filter chip per index topic plus ALL', () => {
        expect(root.querySelectorAll('button.work-chip').length).toBe(indexWorkTags().length + 1);
    });

    it('filters rows by topic and updates the count', () => {
        const chip = root.querySelector<HTMLButtonElement>('button.work-chip[data-tag="Sports"]')!;
        chip.click();
        const visible = [...root.querySelectorAll('.work-row:not(.work-row-hidden)')];
        const expected = INDEX_ITEMS.filter((i) => i.tags.includes('Sports'));
        expect(visible.length).toBe(expected.length);
        expect(chip.getAttribute('aria-pressed')).toBe('true');
        expect(root.querySelector('.work-count')?.textContent).toBe(
            `${expected.length} of ${INDEX_ITEMS.length} shown`
        );
    });

    it('marks interactive tools in the kind column', () => {
        const kinds = [...root.querySelectorAll('.work-row-kind-live')];
        expect(kinds.length).toBe(INDEX_ITEMS.filter((i) => i.tool).length);
    });

    it('previews the focused or hovered row', () => {
        const title = () => root.querySelector('.work-preview-title')?.textContent;
        expect(title()).toBe(INDEX_ITEMS[0].title);

        const rows = root.querySelectorAll<HTMLAnchorElement>('a.work-row');
        rows[2].dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(title()).toBe(INDEX_ITEMS[2].title);

        rows[3].querySelector('.work-row-desc')!.dispatchEvent(
            new MouseEvent('mouseover', { bubbles: true })
        );
        expect(title()).toBe(INDEX_ITEMS[3].title);
    });
});

describe('thumbnail framing', () => {
    it('every project declares an explicit imageStyle', () => {
        for (const p of PROJECTS) {
            expect(['icon', 'cover'], p.title).toContain(p.imageStyle);
        }
    });

    it('only the shelf apps use app icons', () => {
        const iconTitles = PROJECTS.filter((p) => p.imageStyle === 'icon').map((p) => p.title);
        expect(iconTitles.sort()).toEqual([...APP_TITLES].sort());
    });
});
