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
        expect(first.q('.home-term-body').getAttribute('aria-live')).toBeNull();
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
        expect(t.output()).toContain('jack@jvz:~$ cd journey');
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

    it('does not focus the input on mount, but a body click does', () => {
        const t = mountTerminal({ animate: true });
        vi.advanceTimersByTime(10_000);
        expect(document.activeElement).not.toBe(t.input());
        click(t.q('.home-term-body'));
        expect(document.activeElement).toBe(t.input());
        t.destroy();
    });
});
