/**
 * /journey — bio, skills, resume, and the career timeline.
 * The particle constellation is built from the same timeline.json the
 * timeline renders, so the scene literally is the career data.
 */

import type { View } from './types';
import { requestFormation } from '../../scene/stage';
import { constellationBuilder } from '../../scene/formations/constellation';
import { initializeTimeline } from '../../components/Timeline';
import { ResumeManager } from '../../components/ResumeManager';
import type { TimelineItem } from '../../types';
import '../../styles/redesign/journey.css';

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    text?: string
): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

const FILTERS: [string, string][] = [
    ['all', 'ALL'],
    ['education', '🎓 EDUCATION'],
    ['work', '💼 WORK'],
    ['certification', '🏆 CERTS']
];

const SKILL_SECTIONS: [string, string][] = [
    ['programming-skills', 'Programming'],
    ['automation-skills', 'Automation & Tools'],
    ['data-skills', 'Data & Cloud']
];

let resumeManager: ResumeManager | null = null;

async function loadSkills(): Promise<void> {
    resumeManager ??= new ResumeManager();
    await resumeManager.ensureLoaded();
    const skills = resumeManager.getSkills();
    const populate = (id: string, items?: string[]): void => {
        const list = document.getElementById(id);
        if (list && items?.length) {
            list.replaceChildren(
                ...items.map((skill) => el('li', undefined, skill))
            );
        }
    };
    populate('programming-skills', skills.programming);
    populate('automation-skills', skills.automation);
    populate('data-skills', skills.data);
}

const view: View = {
    async mount(root) {
        const section = el('section', 'journey container-x');

        section.append(
            el('p', 'eyebrow', '// THE JOURNEY'),
            el('h1', undefined, 'How I got here'),
            el(
                'p',
                'journey-bio',
                'I’m a software engineer focused on automation, data analysis, and building intelligent solutions that make everyday tasks easier and more efficient. Data science and finance degree from UW–Madison; automation engineering at Echo Global Logistics in Chicago.'
            )
        );

        const resume = el('a', 'btn-ghost journey-resume', 'Download resume ↓');
        resume.href = '/assets/files/resume.pdf';
        resume.setAttribute('download', 'jack-van-zeeland-resume.pdf');
        section.appendChild(resume);

        // Skills
        const skillsPanel = el('div', 'panel journey-skills');
        skillsPanel.setAttribute('data-reveal', '');
        for (const [id, label] of SKILL_SECTIONS) {
            const block = el('div', 'journey-skill-block');
            block.appendChild(el('div', 'journey-skill-label', label.toUpperCase()));
            const ul = el('ul', 'journey-skill-list');
            ul.id = id;
            block.appendChild(ul);
            skillsPanel.appendChild(block);
        }
        section.appendChild(skillsPanel);

        // Timeline: filters + container (ids are Timeline.ts's DOM contract)
        const timelineWrap = el('div', 'journey-timeline');
        timelineWrap.appendChild(el('h2', 'journey-timeline-heading', 'Timeline'));
        const filterRow = el('div', 'journey-filters');
        for (const [key, label] of FILTERS) {
            const btn = el('button', 'filter-btn work-chip', label + ' ');
            btn.setAttribute('data-filter', key);
            if (key === 'all') btn.classList.add('active');
            const badge = el('span', 'journey-count');
            badge.id = `count-${key}`;
            badge.textContent = '0';
            btn.appendChild(badge);
            filterRow.appendChild(btn);
        }
        const container = el('div');
        container.id = 'timeline-container';
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Professional timeline');
        container.setAttribute('aria-live', 'polite');
        timelineWrap.append(filterRow, container);
        section.appendChild(timelineWrap);

        root.appendChild(section);

        // Data-dependent pieces after the skeleton is attached
        void loadSkills();
        await initializeTimeline();

        try {
            const response = await fetch('/data/timeline.json');
            const data = await response.json();
            const items = (data.timelineItems ?? []) as TimelineItem[];
            requestFormation(constellationBuilder(items));
        } catch {
            /* constellation is decoration; timeline already rendered */
        }
    },

    unmount() {
        /* filter listeners live on removed nodes */
    }
};

export default view;
