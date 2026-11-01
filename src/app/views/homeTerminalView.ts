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
import { WORK_ITEMS, workItemHref } from '../../data/workItems';
import { navigate as routerNavigate } from '../router';
import {
    CommandHistory,
    HOME_STATEMENT,
    bootLines,
    complete,
    promptLine,
    runCommand,
    type CommandContext,
    type Line,
    type ProjectEntry
} from './homeTerminal';

export const BOOT_FLAG = 'jvz:terminalBooted';
/** Same cutoff as monogram.ts (aspect > 1.1 is the wide layout). */
export const COMPACT_QUERY = '(max-aspect-ratio: 11/10)';

const BOOT_START_MS = 600;
const BOOT_GAPS_MS = [120, 260, 220, 220, 300, 380];
const TYPE_CHARS = 2;
const TYPE_TICK_MS = 18;
const NAVIGATE_DELAY_MS = 250;
const RESUME_FILENAME = 'Jack-Van-Zeeland-Resume.pdf';
const PROGRESS_FRAME_MS = 50;
const PROGRESS_WIDTH = 40;

function progressText(fraction: number): string {
    const f = Math.min(1, Math.max(0, fraction));
    return `${'#'.repeat(Math.round(f * PROGRESS_WIDTH)).padEnd(PROGRESS_WIDTH, ' ')} ${(f * 100).toFixed(1)}%`;
}

const PROJECT_ENTRIES: ProjectEntry[] = WORK_ITEMS.map((item) => {
    const { href, external } = workItemHref(item);
    return { slug: item.slug, title: item.title, href, external };
});
const PROJECT_SLUGS = PROJECT_ENTRIES.map((p) => p.slug);

interface TerminalOptions {
    animate: boolean;
    navigate?: (path: string) => void;
    /** Full page load, for projects served by a separate app. */
    assign?: (url: string) => void;
    /** Start the boot replay when this settles instead of after the fixed delay (phone monogram intro). */
    startAfter?: Promise<unknown>;
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

/** Has this session already seen the boot sequence? */
export function hasBooted(): boolean {
    return readFlag();
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

/** Stacked phone/portrait layout (same cutoff as monogram.ts). */
export function isCompact(): boolean {
    try {
        return window.matchMedia(COMPACT_QUERY).matches;
    } catch {
        return false;
    }
}

export function createTerminal(opts: TerminalOptions): { el: HTMLElement; destroy(): void } {
    const now = opts.now ?? (() => new Date());
    const go = opts.navigate ?? routerNavigate;
    const assign = opts.assign ?? ((url: string) => window.location.assign(url));
    const history = new CommandHistory();
    const ctx = (): CommandContext => ({
        projectCount: PROJECTS.length,
        now: now(),
        projects: PROJECT_ENTRIES,
        history: history.entries()
    });

    const timers = new Set<ReturnType<typeof setTimeout>>();
    const bootTimers = new Set<ReturnType<typeof setTimeout>>();
    const stageTimers = new Set<ReturnType<typeof setTimeout>>();
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
    bar.append(node('i'), node('i'), node('i'), node('span', 'home-term-title', 'guest@jvz: ~'));

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
    let destroyed = false;

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
        // role=log is implicitly polite; silence it while the boot types out
        body.setAttribute('aria-live', 'off');
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
        if (opts.startAfter) {
            const begin = () => {
                if (booting && !destroyed) replay();
            };
            opts.startAfter.then(begin, begin);
        } else {
            later(replay, BOOT_START_MS, bootTimers);
        }
    }

    // ── paced output (e.g. brew coffee) ──
    let flushStage: (() => void) | null = null;

    function playStaged(lines: Line[], pace: number[], progressLine?: number): void {
        let i = 0;
        let bar: HTMLElement | null = null;
        const show = () => {
            const row = renderLine(lines[i]);
            output.appendChild(row);
            if (i === progressLine) {
                bar = row.firstElementChild as HTMLElement | null;
                const duration = pace[i + 1] ?? 0;
                const started = Date.now();
                const frame = () => {
                    const f = duration ? (Date.now() - started) / duration : 1;
                    if (bar) bar.textContent = progressText(f);
                    if (f < 1) later(frame, PROGRESS_FRAME_MS, stageTimers);
                };
                frame();
            }
            body.scrollTop = body.scrollHeight;
            i++;
            if (i < lines.length) later(show, pace[i], stageTimers);
            else flushStage = null;
        };
        flushStage = () => {
            stageTimers.forEach(clearTimeout);
            stageTimers.clear();
            if (bar) bar.textContent = progressText(1);
            for (; i < lines.length; i++) output.appendChild(renderLine(lines[i]));
            flushStage = null;
        };
        if (pace[0]) later(show, pace[0], stageTimers);
        else show();
    }

    // ── commands ──
    function execute(cmd: string): void {
        finishBoot();
        flushStage?.();
        if (cmd.trim()) history.push(cmd);
        output.appendChild(renderLine(promptLine(cmd)));
        const result = runCommand(cmd, ctx());
        if (result.clear) output.replaceChildren();
        if (result.pace) playStaged(result.lines, result.pace, result.progressLine);
        else for (const line of result.lines) output.appendChild(renderLine(line));
        body.scrollTop = body.scrollHeight;
        // New tabs and downloads run synchronously so they keep the
        // keypress/click's user activation (popup blockers need it).
        if (result.openUrl) window.open(result.openUrl, '_blank', 'noopener');
        if (result.download) {
            const a = node('a');
            a.href = result.download;
            a.setAttribute('download', RESUME_FILENAME);
            a.click();
        }
        const target = result.navigateTo;
        if (target) later(() => (result.external ? assign(target) : go(target)), NAVIGATE_DELAY_MS);
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
            input.value = complete(input.value, PROJECT_SLUGS);
        }
    });

    body.addEventListener('click', (e) => {
        if ((e.target as Element).closest?.('a')) return; // let output links navigate
        if (window.getSelection?.()?.toString()) return; // don't eat a text selection
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
            destroyed = true;
            timers.forEach(clearTimeout);
            bootTimers.forEach(clearTimeout);
            stageTimers.forEach(clearTimeout);
            stageTimers.clear();
            timers.clear();
            bootTimers.clear();
        }
    };
}
