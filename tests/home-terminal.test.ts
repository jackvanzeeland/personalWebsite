import { describe, it, expect } from 'vitest';
import {
    CommandHistory,
    HOME_STATEMENT,
    bootLines,
    complete,
    promptLine,
    runCommand,
    type CommandResult,
    type Line
} from '../src/app/views/homeTerminal';

const ctx = { projectCount: 16, now: new Date('2026-11-01T09:00:00-06:00') };
const lineText = (l: Line) => l.map((s) => s.text).join('');
const text = (r: CommandResult) => r.lines.map(lineText).join('\n');

describe('home terminal commands', () => {
    it('keeps the approved statement verbatim', () => {
        expect(HOME_STATEMENT).toBe(
            "I like building things and figuring things out. Give me a problem and I'll find a way through it, and probably have fun doing it."
        );
    });

    it('cd navigates to known pages, case/space/slash tolerant', () => {
        expect(runCommand('cd projects', ctx).navigateTo).toBe('/projects');
        expect(runCommand('  CD Journey/ ', ctx).navigateTo).toBe('/journey');
        expect(runCommand('cd beyond', ctx).navigateTo).toBe('/beyond');
    });

    it('cd accepts absolute and home-relative page paths', () => {
        expect(runCommand('cd /projects', ctx).navigateTo).toBe('/projects');
        expect(runCommand('cd ~/journey', ctx).navigateTo).toBe('/journey');
    });

    it('cd .. is treated as home', () => {
        const r = runCommand('cd ..', ctx);
        expect(r.navigateTo).toBeUndefined();
        expect(text(r)).not.toContain('no such page');
    });

    it('cd home targets do not navigate', () => {
        for (const t of ['cd', 'cd ~', 'cd /']) expect(runCommand(t, ctx).navigateTo, t).toBeUndefined();
        expect(text(runCommand('cd ~', ctx))).not.toBe('');
    });

    it('cd unknown page', () => {
        const r = runCommand('cd nope', ctx);
        expect(r.navigateTo).toBeUndefined();
        expect(text(r)).toContain('cd: no such page: nope');
    });

    it('contact navigates', () => {
        expect(runCommand('contact', ctx).navigateTo).toBe('/contact');
    });

    it('unknown command', () => {
        expect(text(runCommand('foo', ctx))).toContain('command not found: foo');
    });

    it('empty input yields nothing', () => {
        expect(runCommand('   ', ctx).lines).toEqual([]);
    });

    it('help lists the public commands', () => {
        const out = text(runCommand('help', ctx));
        for (const c of ['ls', 'cd', 'whoami', 'uptime', 'contact', 'clear']) expect(out).toContain(c);
        expect(out).not.toContain('sudo');
    });

    it('ls lists pages', () => {
        expect(text(runCommand('ls', ctx))).toBe('projects/  journey/  beyond/  contact/');
    });

    it('whoami and boot use project count', () => {
        expect(text(runCommand('whoami', ctx))).toContain('16 side projects');
        expect(bootLines(ctx, ctx.now).map(lineText).join('\n')).toContain('16 found');
    });

    it('boot lines match the approved sequence', () => {
        const lines = bootLines(ctx, ctx.now).map(lineText);
        expect(lines).toHaveLength(6);
        expect(lines[0]).toMatch(/^Last login: .+ on ttys000$/);
        expect(lines[1]).toBe('source ~/.bashrc');
        expect(lines.slice(2).join('\n')).toMatch(/curiosity\.sh.*ok\n.*side-projects\/.*16 found\n.*coffee.*low\n.*problem-solver.*ok/);
    });

    it('uptime uses calendar parts', () => {
        expect(text(runCommand('uptime', ctx))).toContain('up 2 years, 9 months, 0 days');
    });

    it('uptime pluralises correctly', () => {
        const one = { projectCount: 16, now: new Date('2025-03-02T09:00:00-06:00') };
        expect(text(runCommand('uptime', one))).toContain('up 1 year, 1 month, 1 day.');
    });

    it('clear', () => {
        expect(runCommand('clear', ctx).clear).toBe(true);
    });

    it('sudo hire jack links to contact; other sudo refuses', () => {
        expect(runCommand('sudo hire jack', ctx).lines.flat().some((s) => s.href === '/contact')).toBe(true);
        expect(text(runCommand('sudo rm -rf /', ctx))).toContain('not in the sudoers file');
    });

    it('vim and rm easter eggs', () => {
        expect(text(runCommand('vim', ctx))).toContain('never leave');
        expect(text(runCommand('rm -rf *', ctx))).toBe('nice try.');
    });

    it('echo of html input stays literal', () => {
        const evil = '<img src=x onerror=alert(1)>';
        expect(lineText(promptLine(evil))).toBe(`guest@jvz:~$ ${evil}`);
        expect(text(runCommand(evil, ctx))).toContain('command not found: <img');
    });

    it('tab completes commands and cd targets', () => {
        expect(complete('wh')).toBe('whoami');
        expect(complete('cd pro')).toBe('cd projects');
        expect(complete('cd zz')).toBe('cd zz');
        expect(complete('')).toBe('');
    });

    it('history walks back and forward', () => {
        const h = new CommandHistory();
        h.push('ls');
        h.push('help');
        expect(h.prev()).toBe('help');
        expect(h.prev()).toBe('ls');
        expect(h.prev()).toBe('ls');
        expect(h.next()).toBe('help');
        expect(h.next()).toBe('');
    });

    it('history on empty returns nothing', () => {
        const h = new CommandHistory();
        expect(h.prev()).toBeUndefined();
        expect(h.next()).toBe('');
    });
});
