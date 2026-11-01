import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BOOT_FLAG, createTerminal } from '../src/app/views/homeTerminalView';
import { HOME_STATEMENT } from '../src/app/views/homeTerminal';

const NOW = () => new Date('2026-11-01T09:00:00-06:00');

function mountTerminal(opts: { animate: boolean; navigate?: (p: string) => void }) {
    const t = createTerminal({ now: NOW, ...opts });
    document.body.appendChild(t.el);
    const q = <T extends Element>(sel: string) => t.el.querySelector<T>(sel)!;
    return {
        ...t,
        statement: () => q<HTMLElement>('.home-term-statement').textContent ?? '',
        input: () => q<HTMLInputElement>('.home-term-input input'),
        output: () => q<HTMLElement>('.home-term-output').textContent ?? '',
        q
    };
}

function press(input: HTMLInputElement, key: string): KeyboardEvent {
    const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    input.dispatchEvent(ev);
    return ev;
}

function click(target: Element, init: MouseEventInit = {}): MouseEvent {
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
    target.dispatchEvent(ev);
    return ev;
}

describe('home terminal view', () => {
    beforeEach(() => {
        sessionStorage.clear();
        document.body.innerHTML = '';
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('builds the finished state synchronously', () => {
        const t = mountTerminal({ animate: false });
        expect(t.statement()).toBe(HOME_STATEMENT);
        expect(t.q('.home-term-boot').textContent).toContain('source ~/.bashrc');
        expect(t.q('.home-term-hint').textContent).toContain('help');
        expect([...t.el.querySelectorAll('.home-term-chips a')].map((a) => a.getAttribute('href'))).toEqual([
            '/projects',
            '/journey',
            '/contact'
        ]);
        expect(t.q('.home-term-body').getAttribute('role')).toBe('log');
        expect(t.q('.home-term-body').getAttribute('aria-live')).toBe('polite');
        expect(t.input().getAttribute('aria-label')).toBe('Terminal: type a command');
        expect(t.q('.home-term-title').textContent).toBe('guest@jvz: ~'); // title bar reads guest
        expect(t.el.classList.contains('is-ready')).toBe(true);
        t.destroy();
    });

    it('first animated mount sets the flag and replays; second does not', () => {
        const first = mountTerminal({ animate: true });
        expect(sessionStorage.getItem(BOOT_FLAG)).toBe('1');
        expect(first.el.classList.contains('is-ready')).toBe(false);
        vi.advanceTimersByTime(700);
        expect(first.el.classList.contains('is-ready')).toBe(true);
        expect(first.statement().length).toBeLessThan(HOME_STATEMENT.length);
        expect(first.q('.home-term-body').getAttribute('aria-live')).toBe('off');
        vi.advanceTimersByTime(10_000);
        expect(first.statement()).toBe(HOME_STATEMENT);
        expect(first.q('.home-term-body').getAttribute('aria-live')).toBe('polite');
        first.destroy();

        const second = mountTerminal({ animate: true });
        expect(second.statement()).toBe(HOME_STATEMENT);
        vi.advanceTimersByTime(1000);
        expect(second.statement()).toBe(HOME_STATEMENT);
        second.destroy();
    });

    it('storage throwing is treated as first visit', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked');
        });
        const t = mountTerminal({ animate: true });
        vi.advanceTimersByTime(700);
        expect(t.statement().length).toBeLessThan(HOME_STATEMENT.length);
        t.destroy();
    });

    it('destroy() mid-boot cancels pending timers', () => {
        const t = mountTerminal({ animate: true });
        vi.advanceTimersByTime(700);
        t.destroy();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('chip during boot finishes boot then runs command', () => {
        const t = mountTerminal({ animate: true });
        vi.advanceTimersByTime(700);
        click(t.q('button[data-cmd="ls"]'));
        expect(t.statement()).toBe(HOME_STATEMENT);
        expect(t.output()).toContain('projects/');
        vi.advanceTimersByTime(10_000);
        expect(t.statement()).toBe(HOME_STATEMENT);
        expect(t.output()).toContain('projects/');
        t.destroy();
    });

    it('enter runs a command and cd navigates after 250ms', () => {
        const navigate = vi.fn();
        const t = mountTerminal({ animate: false, navigate });
        t.input().value = 'cd journey';
        press(t.input(), 'Enter');
        expect(t.input().value).toBe('');
        expect(t.output()).toContain('guest@jvz:~$ cd journey');
        expect(navigate).not.toHaveBeenCalled();
        vi.advanceTimersByTime(250);
        expect(navigate).toHaveBeenCalledWith('/journey');
        t.destroy();
    });

    it('clear empties the output', () => {
        const t = mountTerminal({ animate: false });
        t.input().value = 'ls';
        press(t.input(), 'Enter');
        t.input().value = 'clear';
        press(t.input(), 'Enter');
        expect(t.output()).toBe('');
        t.destroy();
    });

    it('rendered output never creates elements from input', () => {
        const t = mountTerminal({ animate: false });
        t.input().value = '<img src=x onerror=alert(1)>';
        press(t.input(), 'Enter');
        expect(t.el.querySelector('img')).toBeNull();
        expect(t.output()).toContain('<img src=x onerror=alert(1)>');
        t.destroy();
    });

    it('tab completes and arrows walk history', () => {
        const t = mountTerminal({ animate: false });
        t.input().value = 'wh';
        expect(press(t.input(), 'Tab').defaultPrevented).toBe(true);
        expect(t.input().value).toBe('whoami');
        press(t.input(), 'Enter');
        press(t.input(), 'ArrowUp');
        expect(t.input().value).toBe('whoami');
        press(t.input(), 'ArrowDown');
        expect(t.input().value).toBe('');
        t.destroy();
    });

    it('anchor chip click is preventDefaulted and navigates via opts.navigate', () => {
        const navigate = vi.fn();
        const t = mountTerminal({ animate: false, navigate });
        const ev = click(t.q('a[data-cmd="cd projects"]'));
        expect(ev.defaultPrevented).toBe(true);
        expect(t.output()).toContain('cd projects');
        vi.advanceTimersByTime(250);
        expect(navigate).toHaveBeenCalledWith('/projects');
        t.destroy();
    });

    it('modifier-click on an anchor chip is left to the browser', () => {
        const navigate = vi.fn();
        const t = mountTerminal({ animate: false, navigate });
        const ev = click(t.q('a[data-cmd="cd projects"]'), { metaKey: true });
        expect(ev.defaultPrevented).toBe(false);
        vi.advanceTimersByTime(250);
        expect(navigate).not.toHaveBeenCalled();
        t.destroy();
    });

    it('keydown on document is not intercepted', () => {
        const t = mountTerminal({ animate: false });
        for (const key of ['ArrowDown', ' ', 'Tab']) {
            const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            document.dispatchEvent(ev);
            expect(ev.defaultPrevented, key).toBe(false);
        }
        t.destroy();
    });

    it('a click that ends a text selection does not steal it', () => {
        const t = mountTerminal({ animate: false });
        vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => 'building' } as Selection);
        click(t.q('.home-term-statement'));
        expect(document.activeElement).not.toBe(t.input());
        t.destroy();
    });

    it('does not focus the input on mount, but a body click does', () => {
        const t = mountTerminal({ animate: true });
        vi.advanceTimersByTime(10_000);
        expect(document.activeElement).not.toBe(t.input());
        click(t.q('.home-term-body'));
        expect(document.activeElement).toBe(t.input());
        t.destroy();
    });

    it('github opens a new tab immediately (keeps the click/keypress activation)', () => {
        const open = vi.spyOn(window, 'open').mockReturnValue(null);
        const t = mountTerminal({ animate: false });
        t.input().value = 'github';
        press(t.input(), 'Enter');
        expect(open).toHaveBeenCalledWith('https://github.com/jackvanzeeland', '_blank', 'noopener');
        t.destroy();
    });

    it('resume triggers a download of the pdf', () => {
        const clicks: { href: string | null; download: string | null }[] = [];
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
            clicks.push({ href: this.getAttribute('href'), download: this.getAttribute('download') });
        });
        const t = mountTerminal({ animate: false });
        t.input().value = 'resume';
        press(t.input(), 'Enter');
        expect(clicks).toEqual([{ href: '/files/resume.pdf', download: 'Jack-Van-Zeeland-Resume.pdf' }]);
        t.destroy();
    });

    it('separately hosted projects use a full page load instead of the router', () => {
        const navigate = vi.fn();
        const assign = vi.fn();
        const t = createTerminal({ animate: false, navigate, assign, now: NOW });
        document.body.appendChild(t.el);
        const input = t.el.querySelector<HTMLInputElement>('.home-term-input input')!;
        input.value = 'open super-bowl-competition';
        press(input, 'Enter');
        vi.advanceTimersByTime(250);
        expect(assign).toHaveBeenCalledWith('/projects/superbowl/');
        expect(navigate).not.toHaveBeenCalled();
        t.destroy();
    });

    it('history shows what was typed', () => {
        const t = mountTerminal({ animate: false });
        for (const cmd of ['ls', 'whoami', 'history']) {
            t.input().value = cmd;
            press(t.input(), 'Enter');
        }
        expect(t.output()).toContain('1  ls');
        expect(t.output()).toContain('2  whoami');
        t.destroy();
    });

    it('brew coffee plays out over time with a filling bar', () => {
        const t = mountTerminal({ animate: false });
        t.input().value = 'brew coffee';
        press(t.input(), 'Enter');
        expect(t.output()).toContain('==> Downloading');
        expect(t.output()).not.toContain('Pouring');
        vi.advanceTimersByTime(700);
        expect(t.output()).toMatch(/#+\s*\d+(\.\d)?%/);
        expect(t.output()).not.toContain('100.0%');
        vi.advanceTimersByTime(5000);
        expect(t.output()).toContain('100.0%');
        expect(t.output()).toContain('Pouring');
        expect(t.output()).toContain('refilled');
        t.destroy();
    });

    it('a new command mid-brew flushes the rest first', () => {
        const t = mountTerminal({ animate: false });
        t.input().value = 'brew coffee';
        press(t.input(), 'Enter');
        vi.advanceTimersByTime(300);
        t.input().value = 'ls';
        press(t.input(), 'Enter');
        const out = t.output();
        expect(out.indexOf('refilled')).toBeGreaterThan(-1);
        expect(out.indexOf('refilled')).toBeLessThan(out.indexOf('guest@jvz:~$ ls'));
        expect(out).toContain('100.0%');
        vi.advanceTimersByTime(5000);
        expect(t.output().match(/refilled/g)).toHaveLength(1);
        t.destroy();
    });

    it('destroy mid-brew clears its timers', () => {
        const t = mountTerminal({ animate: false });
        t.input().value = 'brew coffee';
        press(t.input(), 'Enter');
        vi.advanceTimersByTime(300);
        t.destroy();
        expect(vi.getTimerCount()).toBe(0);
    });
});
