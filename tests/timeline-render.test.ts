import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { initializeTimeline } from '../src/components/Timeline';

const FIXTURE = {
    timelineItems: [
        {
            id: 'echo_rpa_intern',
            title: 'RPA Developer Intern',
            organization: 'Echo Global Logistics',
            type: 'work',
            startDate: '2024-02-01',
            endDate: '2025-05-31',
            isPresent: false,
            description: 'Built things.'
        },
        {
            id: 'anthropic_cert',
            title: 'AI Fluency',
            organization: 'Anthropic',
            type: 'certification',
            startDate: '2026-06-01',
            endDate: '2026-06-29',
            isPresent: false,
            description: 'Learned things.'
        }
    ]
};

describe('timeline render', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="timeline-container"></div>
            <p id="cert-count"></p>
            <ul id="cert-index"></ul>
        `;
        vi.stubGlobal('fetch', vi.fn(async () => ({
            json: async () => FIXTURE
        })));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('puts work/education on the timeline and certifications in the index', async () => {
        await initializeTimeline();
        const container = document.getElementById('timeline-container')!;
        expect(container.textContent).toContain('RPA Developer Intern');
        expect(container.textContent).not.toContain('AI Fluency');
        const years = [...container.querySelectorAll('.year-section')].map(
            (s) => s.getAttribute('data-year')
        );
        expect(years).toEqual(['2024']);

        const rows = document.querySelectorAll('#cert-index .cert-row');
        expect(rows.length).toBe(1);
        expect(rows[0].textContent).toContain('AI Fluency');
        expect(rows[0].textContent).toContain('Anthropic');
        expect(rows[0].textContent).toContain('Jun 2026');
        expect(document.getElementById('cert-count')!.textContent).toBe('1 COURSES');
    });

    it('renders start months in local time (Feb stays Feb — the tz bug)', async () => {
        await initializeTimeline();
        const container = document.getElementById('timeline-container')!;
        expect(container.textContent).toContain('Feb 2024');
        expect(container.textContent).not.toContain('Jan 2024');
    });

    it('lists certifications newest-first with no duration or year labels', async () => {
        const cert = (id: string, title: string, startDate: string) => ({
            id, title, organization: 'Anthropic', type: 'certification',
            startDate, endDate: startDate, isPresent: false, description: 'x'
        });
        vi.stubGlobal('fetch', vi.fn(async () => ({
            json: async () => ({
                timelineItems: [
                    FIXTURE.timelineItems[0],
                    cert('a', 'Older Course', '2024-03-01'),
                    cert('b', 'Newer Course', '2026-06-01')
                ]
            })
        })));
        await initializeTimeline();
        const titles = [...document.querySelectorAll('#cert-index .cert-row-title')].map((t) => t.textContent);
        expect(titles).toEqual(['Newer Course', 'Older Course']);
        expect(document.getElementById('cert-count')!.textContent).toBe('2 COURSES');
        expect(document.body.textContent).not.toContain('Less than 1 month');
        expect(document.body.textContent).not.toContain('Current Year');
        expect(document.body.textContent).not.toMatch(/[🏆🎓💼⚡]/u);
    });
});
