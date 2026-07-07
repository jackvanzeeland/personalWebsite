/**
 * The achievements system, reborn as a site-wide easter egg:
 * a quiet mono counter in the corner that opens a panel listing unlocks.
 * Existing visitors' progress carries over (same localStorage keys).
 */

import { checkTimeBasedAchievements, getAchievements } from '../utils/journey';

function refreshCount(button: HTMLButtonElement): void {
    const achievements = getAchievements();
    const unlocked = achievements.filter((a) => a.unlocked).length;
    button.textContent = `▲ ${unlocked}/${achievements.length}`;
    button.setAttribute(
        'aria-label',
        `Achievements: ${unlocked} of ${achievements.length} unlocked`
    );
}

function renderPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'panel achievement-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Achievements');

    const title = document.createElement('div');
    title.className = 'achievement-panel-title';
    title.textContent = '// ACHIEVEMENTS';
    panel.appendChild(title);

    for (const a of getAchievements()) {
        const row = document.createElement('div');
        row.className = `achievement-row${a.unlocked ? ' unlocked' : ''}`;
        const icon = document.createElement('span');
        icon.className = 'achievement-row-icon';
        icon.textContent = a.unlocked ? a.icon : '?';
        const text = document.createElement('span');
        text.className = 'achievement-row-text';
        text.textContent = a.unlocked ? `${a.title} — ${a.description}` : '???';
        row.append(icon, text);
        panel.appendChild(row);
    }
    return panel;
}

export function initAchievementTracker(): void {
    checkTimeBasedAchievements();

    const wrap = document.createElement('div');
    wrap.className = 'achievement-tracker';

    const button = document.createElement('button');
    button.className = 'achievement-button';
    refreshCount(button);

    let panel: HTMLElement | null = null;
    button.addEventListener('click', () => {
        if (panel) {
            panel.remove();
            panel = null;
            return;
        }
        panel = renderPanel();
        wrap.appendChild(panel);
    });

    wrap.appendChild(button);
    document.body.appendChild(wrap);

    // Keep the count fresh as achievements unlock anywhere in the app
    const observer = setInterval(() => refreshCount(button), 4000);
    window.addEventListener('pagehide', () => clearInterval(observer), { once: true });
}
