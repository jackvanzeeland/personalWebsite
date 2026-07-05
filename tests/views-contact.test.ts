import { describe, it, expect, beforeEach } from 'vitest';
import contactView from '../src/app/views/contact';

describe('contact view', () => {
    beforeEach(() => {
        document.body.innerHTML = '<main id="view-root"></main>';
    });

    it('renders email, LinkedIn, GitHub, and resume links', async () => {
        const root = document.getElementById('view-root')!;
        await contactView.mount(root, {});
        const hrefs = [...root.querySelectorAll('a')].map((a) => a.getAttribute('href') ?? '');
        expect(hrefs.some((h) => h.startsWith('mailto:jack.vanzeeland@outlook.com'))).toBe(true);
        expect(hrefs.some((h) => h.includes('linkedin.com'))).toBe(true);
        expect(hrefs.some((h) => h.includes('github.com'))).toBe(true);
        expect(hrefs.some((h) => h.includes('resume.pdf'))).toBe(true);
        contactView.unmount();
    });
});
