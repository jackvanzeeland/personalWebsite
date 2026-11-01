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

    describe('projects, links, resume, history', () => {
        const projects = [
            { slug: 'wordle-solver', title: 'Wordle Algorithm Solver', href: '/projects/wordle-solver', external: false },
            { slug: 'woku', title: 'Woku', href: '/projects/woku', external: true },
            { slug: 'secret-santa', title: 'Secret Santa Matching', href: '/projects/secret-santa', external: false }
        ];
        const full = { ...ctx, projects, history: ['ls', 'help'] };

        it('ls projects lists project slugs', () => {
            for (const input of ['ls projects', 'ls projects/', 'ls /projects']) {
                const out = text(runCommand(input, full));
                expect(out, input).toContain('wordle-solver/');
                expect(out, input).toContain('woku/');
                expect(out, input).toContain('secret-santa/');
            }
        });

        it('ls of an unknown dir', () => {
            expect(text(runCommand('ls nope', full))).toContain('ls: nope: no such directory');
        });

        it('cd projects/<slug> and open <slug> navigate to the project', () => {
            expect(runCommand('cd projects/wordle-solver', full)).toMatchObject({ navigateTo: '/projects/wordle-solver' });
            expect(runCommand('cd /projects/secret-santa/', full)).toMatchObject({ navigateTo: '/projects/secret-santa' });
            expect(runCommand('open wordle-solver', full)).toMatchObject({ navigateTo: '/projects/wordle-solver' });
            expect(runCommand('cd projects/wordle-solver', full).external).toBeFalsy();
        });

        it('separately hosted projects are marked external (full page load)', () => {
            expect(runCommand('open woku', full)).toMatchObject({ navigateTo: '/projects/woku', external: true });
        });

        it('unknown projects', () => {
            expect(text(runCommand('cd projects/nope', full))).toContain('cd: no such project: nope');
            expect(text(runCommand('open nope', full))).toContain('open: no such project: nope');
            expect(text(runCommand('open', full))).toContain('usage: open <project>');
        });

        it('github and linkedin open profiles', () => {
            expect(runCommand('github', full).openUrl).toBe('https://github.com/jackvanzeeland');
            expect(runCommand('linkedin', full).openUrl).toBe('https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/');
        });

        it('resume downloads the pdf', () => {
            expect(runCommand('resume', full).download).toBe('/files/resume.pdf');
        });

        it('history lists numbered commands', () => {
            expect(text(runCommand('history', full))).toBe('    1  ls\n    2  help');
            expect(text(runCommand('history', { ...full, history: [] }))).toBe('');
        });

        it('help lists the new commands but not the easter eggs', () => {
            const out = text(runCommand('help', full));
            for (const c of ['ls projects', 'open <project>', 'github', 'linkedin', 'resume', 'history']) expect(out).toContain(c);
            expect(out).not.toContain('brew');
        });

        it('brew coffee refills the coffee', () => {
            const out = text(runCommand('brew coffee', full));
            expect(out).toContain('==> Pouring coffee');
            expect(out).toMatch(/coffee .*ok/);
            expect(text(runCommand('brew install coffee', full))).toContain('==> Pouring coffee');
            expect(text(runCommand('brew', full))).toContain('usage: brew coffee');
        });

        it('tab completes project slugs and new commands', () => {
            const slugs = projects.map((p) => p.slug);
            expect(complete('cd projects/wor', slugs)).toBe('cd projects/wordle-solver');
            expect(complete('open se', slugs)).toBe('open secret-santa');
            expect(complete('li', slugs)).toBe('linkedin');
            expect(complete('res', slugs)).toBe('resume');
            expect(complete('cd projects/zz', slugs)).toBe('cd projects/zz');
        });
    });
});
