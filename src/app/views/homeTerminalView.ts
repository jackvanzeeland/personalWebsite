/**
 * The home hero's fake terminal: DOM wiring around the pure command engine
 * in homeTerminal.ts.
 *
 * mount always builds the finished state synchronously (that's what the
 * prerender snapshots and what repeat/reduced-motion visitors see). On the
 * first animated visit of a session it then replays the boot: .bashrc lines,
 * the statement typed out, the hint. Every node is built with textContent —
 * never innerHTML — so nothing a visitor types can become markup.
 */

import { PROJECTS } from '../../data/projects';
import { navigate as routerNavigate } from '../router';
import {
    CommandHistory,
    HOME_STATEMENT,
    bootLines,
    complete,
    promptLine,
    runCommand,
    type CommandContext,
    type Line
} from './homeTerminal';

export const BOOT_FLAG = 'jvz:terminalBooted';
/** Same cutoff as monogram.ts (aspect > 1.1 is the wide layout). */
export const COMPACT_QUERY = '(max-aspect-ratio: 11/10)';

const BOOT_START_MS = 600;
const BOOT_GAPS_MS = [120, 260, 220, 220, 300, 380];
const TYPE_CHARS = 2;
const TYPE_TICK_MS = 18;
const NAVIGATE_DELAY_MS = 250;

interface TerminalOptions {
    animate: boolean;
    navigate?: (path: string) => void;
    now?: () => Date;
}

const CHIPS: { cmd: string; href?: string }[] = [
    { cmd: 'help' },
    { cmd: 'ls' },
    { cmd: 'cd projects', href: '/projects' },
    { cmd: 'cd journey', href: '/journey' },
    { cmd: 'contact', href: '/contact' }
];

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

function renderLine(line: Line): HTMLDivElement {
    const row = node('div', 'home-term-line');
    for (const s of line) {
        const part = s.href ? node('a') : node('span');
        if (part instanceof HTMLAnchorElement && s.href) part.href = s.href;
        part.className = `tone-${s.tone ?? 'plain'}`;
        part.textContent = s.text;
        row.appendChild(part);
    }
    return row;
}

function readFlag(): boolean {
    try {
        return sessionStorage.getItem(BOOT_FLAG) === '1';
    } catch {
        return false;
    }
}

function writeFlag(): void {
    try {
        sessionStorage.setItem(BOOT_FLAG, '1');
    } catch {
        /* storage blocked: the boot just replays next time */
    }
}

function isCompact(): boolean {
    try {
        return window.matchMedia(COMPACT_QUERY).matches;
    } catch {
        return false;
    }
}

export function createTerminal(opts: TerminalOptions): { el: HTMLElement; destroy(): void } {
    const now = opts.now ?? (() => new Date());
    const go = opts.navigate ?? routerNavigate;
    const ctx = (): CommandContext => ({ projectCount: PROJECTS.length, now: now() });
    const history = new CommandHistory();

    const timers = new Set<ReturnType<typeof setTimeout>>();
    const bootTimers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number, set = timers) => {
        const id = setTimeout(() => {
            set.delete(id);
            fn();
        }, ms);
        set.add(id);
    };

    // ── structure ──
    const el = node('div', 'home-term');
    const bar = node('div', 'home-term-bar');
    bar.append(node('i'), node('i'), node('i'), node('span', 'home-term-title', 'jack@jvz: ~'));

    const body = node('div', 'home-term-body');
    body.setAttribute('role', 'log');
    const boot = node('div', 'home-term-boot');
    const statement = node('p', 'home-term-statement');
    const hint = node('div', 'home-term-hint');
    const output = node('div', 'home-term-output');
    const inputRow = node('div', 'home-term-input');
    inputRow.append(renderLine(promptLine('').slice(0, 3).concat({ text: '$' })));
    const input = node('input');
    input.type = 'text';
    input.spellcheck = false;
    input.autocomplete = 'off';
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('enterkeyhint', 'go');
    input.setAttribute('aria-label', 'Terminal: type a command');
    inputRow.appendChild(input);
    body.append(boot, statement, hint, output, inputRow);

    const chips = node('nav', 'home-term-chips');
    chips.setAttribute('aria-label', 'Terminal shortcuts');
    for (const chip of CHIPS) {
        const b = chip.href ? node('a', 'home-term-chip', chip.cmd) : node('button', 'home-term-chip', chip.cmd);
        if (b instanceof HTMLAnchorElement && chip.href) b.href = chip.href;
        if (b instanceof HTMLButtonElement) b.type = 'button';
        b.dataset.cmd = chip.cmd;
        chips.appendChild(b);
    }
    el.append(bar, body, chips);

    const hintLine: Line = [
        { text: 'type ', tone: 'dim' },
        { text: 'help', tone: 'ok' },
        { text: ' to look around', tone: 'dim' }
    ];

    function renderFinished(): void {
        boot.replaceChildren(...bootLines(ctx(), now()).map(renderLine));
        statement.textContent = HOME_STATEMENT;
        hint.replaceChildren(renderLine(hintLine));
        body.setAttribute('aria-live', 'polite');
        el.classList.add('is-ready');
    }

    // ── boot replay ──
    let booting = false;

    function finishBoot(): void {
        if (!booting) return;
        booting = false;
        bootTimers.forEach(clearTimeout);
        bootTimers.clear();
        renderFinished();
    }

    function replay(): void {
        boot.replaceChildren();
        statement.textContent = '';
        hint.replaceChildren();
        body.removeAttribute('aria-live');
        el.classList.add('is-ready');

        const lines = bootLines(ctx(), now());
        const compact = isCompact();
        let i = 0;
        const nextLine = () => {
            if (i < lines.length) {
                boot.appendChild(renderLine(lines[i]));
                const gap = compact ? 0 : BOOT_GAPS_MS[i] ?? 200;
                i++;
                if (gap === 0) nextLine();
                else later(nextLine, gap, bootTimers);
                return;
            }
            let k = 0;
            const type = () => {
                k = Math.min(HOME_STATEMENT.length, k + TYPE_CHARS);
                statement.textContent = HOME_STATEMENT.slice(0, k);
                if (k < HOME_STATEMENT.length) later(type, TYPE_TICK_MS, bootTimers);
                else finishBoot();
            };
            type();
        };
        nextLine();
    }

    renderFinished();
    if (opts.animate && !readFlag()) {
        writeFlag();
        booting = true;
        el.classList.remove('is-ready');
        later(replay, BOOT_START_MS, bootTimers);
    }

    // ── commands ──
    function execute(cmd: string): void {
        finishBoot();
        if (cmd.trim()) history.push(cmd);
        output.appendChild(renderLine(promptLine(cmd)));
        const result = runCommand(cmd, ctx());
        if (result.clear) output.replaceChildren();
        for (const line of result.lines) output.appendChild(renderLine(line));
        body.scrollTop = body.scrollHeight;
        const target = result.navigateTo;
        if (target) later(() => go(target), NAVIGATE_DELAY_MS);
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = input.value;
            input.value = '';
            execute(cmd);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = history.prev();
            if (prev !== undefined) input.value = prev;
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            input.value = history.next();
        } else if (e.key === 'Tab' && input.value) {
            e.preventDefault();
            input.value = complete(input.value);
        }
    });

    body.addEventListener('click', (e) => {
        if ((e.target as Element).closest?.('a')) return; // let output links navigate
        finishBoot();
        input.focus({ preventScroll: true });
    });

    chips.addEventListener('click', (e) => {
        const chip = (e.target as Element).closest?.<HTMLElement>('[data-cmd]');
        if (!chip) return;
        if (chip instanceof HTMLAnchorElement && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)) return;
        e.preventDefault();
        execute(chip.dataset.cmd ?? '');
    });

    return {
        el,
        destroy() {
            timers.forEach(clearTimeout);
            bootTimers.forEach(clearTimeout);
            timers.clear();
            bootTimers.clear();
        }
    };
}
