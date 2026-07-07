import { describe, it, expect, beforeEach } from 'vitest';
import { SecretSanta } from '../src/components/SecretSanta';

function mountSantaDom(): void {
    document.body.innerHTML = `
        <div class="santa-demo-container">
            <h3 class="santa-demo-heading">Secret Santa</h3>
            <input id="name-input" type="text">
            <button id="add-name">Add</button>
            <div id="name-list"></div>
            <button id="generate-matches">Generate</button>
            <button id="clear-all">Clear</button>
            <div id="santa-results"></div>
        </div>
    `;
}

function addName(name: string): void {
    const input = document.getElementById('name-input') as HTMLInputElement;
    input.value = name;
    (document.getElementById('add-name') as HTMLButtonElement).click();
}

describe('SecretSanta', () => {
    beforeEach(() => {
        mountSantaDom();
        new SecretSanta();
    });

    it('renders participant names as text, not markup (XSS regression)', () => {
        const payload = '<img src=x onerror="window.__pwned=true">';
        addName(payload);

        const pill = document.querySelector('.santa-name-pill')!;
        expect(pill).toBeTruthy();
        expect(pill.querySelector('img')).toBeNull();
        expect(pill.textContent).toContain('<img src=x onerror="window.__pwned=true">');
    });

    it('escapes names in generated match cards (XSS regression)', () => {
        addName('<script>bad()</script>');
        addName('"><svg onload=x>');
        (document.getElementById('generate-matches') as HTMLButtonElement).click();

        const results = document.getElementById('santa-results')!;
        expect(results.querySelectorAll('.match-card').length).toBe(2);
        expect(results.querySelector('script, svg, img')).toBeNull();
    });

    it('matches everyone to someone else', () => {
        for (const name of ['Alice', 'Bob', 'Cleo']) addName(name);
        (document.getElementById('generate-matches') as HTMLButtonElement).click();

        const givers = [...document.querySelectorAll('.giver-name')].map((el) => el.textContent);
        expect(new Set(givers).size).toBe(3);
    });
});
