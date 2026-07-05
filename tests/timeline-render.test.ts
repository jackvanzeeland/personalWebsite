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
            <button class="filter-btn" data-filter="all">All <span id="count-all"></span></button>
            <button class="filter-btn" data-filter="work">Work <span id="count-work"></span></button>
            <div id="timeline-container"></div>
        `;
        vi.stubGlobal('fetch', vi.fn(async () => ({
            json: async () => FIXTURE
        })));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('renders both items with year sections newest-first', async () => {
        await initializeTimeline();
        const container = document.getElementById('timeline-container')!;
        expect(container.textContent).toContain('RPA Developer Intern');
        expect(container.textContent).toContain('AI Fluency');
        const years = [...container.querySelectorAll('.year-section')].map(
            (s) => s.getAttribute('data-year')
        );
        expect(years).toEqual(['2026', '2024']);
    });

    it('renders start months in local time (Feb stays Feb — the tz bug)', async () => {
        await initializeTimeline();
        const container = document.getElementById('timeline-container')!;
        expect(container.textContent).toContain('Feb 2024');
        expect(container.textContent).not.toContain('Jan 2024');
    });
});
