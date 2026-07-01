/**
 * About Page Entry Point
 * Owns the skills section, resume manager, and the career timeline
 * (formerly a ~450-line inline script in about.html).
 */

import '../styles/color-scheme.css';
import '../styles/main.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';
import '../styles/components/timeline.css';

import { initializeLayout } from '../components/Layout';
import { initializeTimeline } from '../components/Timeline';
import { ResumeManager } from '../components/ResumeManager';
import { getGraphicsTier } from '../utils/capabilities';

const resumeManager = new ResumeManager();

async function loadSkills(): Promise<void> {
    try {
        await resumeManager.ensureLoaded();
        const skills = resumeManager.getSkills();

        const populate = (id: string, items?: string[]): void => {
            const list = document.getElementById(id);
            if (list && items?.length) {
                list.replaceChildren(
                    ...items.map((skill) => {
                        const li = document.createElement('li');
                        li.textContent = skill;
                        return li;
                    })
                );
            }
        };

        populate('programming-skills', skills.programming);
        populate('automation-skills', skills.automation);
        populate('data-skills', skills.data);
    } catch (error) {
        console.error('Failed to load resume data:', error);
    }
}

/** Mount the GSAP cinematic layer only on capable, motion-friendly devices. */
function scheduleCinematicTimeline(): void {
    if (getGraphicsTier() !== 'high') return;

    const mount = (): void => {
        import('../components/TimelineCinematic')
            .then(({ initializeTimelineCinematic }) => initializeTimelineCinematic())
            .catch(() => { /* static timeline remains — progressive enhancement */ });
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(mount, { timeout: 2000 });
    } else {
        setTimeout(mount, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 About page initializing...');

    initializeLayout();
    loadSkills();

    initializeTimeline().then(() => {
        scheduleCinematicTimeline();
    });

    // Keep legacy console access working
    (window as Window & { resumeManager?: ResumeManager }).resumeManager = resumeManager;

    console.log('✅ About page ready');
});
