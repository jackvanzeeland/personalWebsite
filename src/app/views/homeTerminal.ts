/**
 * Command engine for the home-page terminal. Pure: input string in,
 * structured lines out. Output is data (segments with a tone), never HTML,
 * so the DOM layer renders everything with textContent and user input can't
 * become markup.
 */

import { ageParts } from './homeExperience';

export type Tone = 'plain' | 'dim' | 'ok' | 'warn' | 'prompt' | 'bright';
export interface Segment {
    text: string;
    tone?: Tone;
    href?: string;
}
export type Line = Segment[];
export interface CommandContext {
    projectCount: number;
    now: Date;
}
export interface CommandResult {
    lines: Line[];
    navigateTo?: string;
    clear?: boolean;
}

export const HOME_STATEMENT =
    "I like building things and figuring things out. Give me a problem and I'll find a way through it, and probably have fun doing it.";

export const PAGES = ['projects', 'journey', 'beyond', 'contact'] as const;

const seg = (text: string, tone?: Tone): Segment => (tone ? { text, tone } : { text });
const one = (...segments: Segment[]): CommandResult => ({ lines: [segments] });

export function bootLines(ctx: CommandContext, today: Date): Line[] {
    const loading = (name: string, result: string, tone: Tone): Line => [
        seg(`  loading ${name} ${'.'.repeat(Math.max(3, 24 - name.length))} `),
        seg(result, tone)
    ];
    return [
        [seg(`Last login: ${today.toDateString()} on ttys000`, 'dim')],
        [seg('source ~/.bashrc', 'dim')],
        loading('curiosity.sh', 'ok', 'ok'),
        loading('side-projects/', `${ctx.projectCount} found`, 'ok'),
        loading('coffee', 'low', 'warn'),
        loading('problem-solver', 'ok', 'ok')
    ];
}

export function promptLine(input: string): Line {
    return [seg('guest@jvz', 'prompt'), seg(':'), seg('~', 'ok'), seg(`$ ${input}`)];
}

const HELP: [string, string][] = [
    ['ls', 'list pages'],
    ['cd <page>', 'go to a page'],
    ['whoami', 'about me'],
    ['uptime', "how long I've been at it"],
    ['contact', 'get in touch'],
    ['clear', 'clear the screen']
];

type Handler = (args: string[], ctx: CommandContext) => CommandResult;

const COMMANDS: Record<string, Handler> = {
    help: () => ({
        lines: [
            [seg('available commands', 'bright')],
            ...HELP.map(([cmd, desc]): Line => [seg('  '), seg(cmd.padEnd(16), 'ok'), seg(desc)])
        ]
    }),
    ls: () => one(seg(PAGES.map((p) => `${p}/`).join('  '), 'ok')),
    cd: (args) => {
        const raw = (args[0] ?? '~').toLowerCase();
        const target = raw === '/' ? '/' : raw.replace(/^~?\/+/, '').replace(/\/+$/, '') || '~';
        if (target === '~' || target === '/' || target === '..' || target === '.') {
            return one(seg("you're already home.", 'dim'));
        }
        if ((PAGES as readonly string[]).includes(target)) {
            return { lines: [[seg(`cd ${target} … `), seg('loading', 'dim')]], navigateTo: `/${target}` };
        }
        return one(seg(`cd: no such page: ${args[0]}  `), seg('(try ls)', 'dim'));
    },
    whoami: (_args, ctx) =>
        one(
            seg(
                `Jack Van Zeeland: software engineer in Chicago. UW–Madison, Data Science & Finance. Business Automation Engineer at Echo Global Logistics. ${ctx.projectCount} side projects and counting.`
            )
        ),
    uptime: (_args, ctx) => {
        const { years, months, days } = ageParts(ctx.now);
        const n = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;
        return one(
            seg(`up ${n(years, 'year')}, ${n(months, 'month')}, ${n(days, 'day')}. `),
            seg('load average: high, mostly side projects', 'dim')
        );
    },
    contact: () => ({ lines: [[seg('opening '), { text: '/contact', tone: 'ok', href: '/contact' }, seg(' …')]], navigateTo: '/contact' }),
    clear: () => ({ lines: [], clear: true }),
    sudo: (args) =>
        args.join(' ').toLowerCase() === 'hire jack'
            ? one(seg('✓ permission granted. ', 'ok'), { text: '/contact', tone: 'ok', href: '/contact' }, seg(" — let's talk."))
            : one(seg('jack is not in the sudoers file. This incident will be reported.', 'warn')),
    vim: () => one(seg('you can check out any time you like, but you can never leave.', 'dim')),
    rm: () => one(seg('nice try.', 'warn'))
};

export function runCommand(input: string, ctx: CommandContext): CommandResult {
    const words = input.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return { lines: [] };
    const [name, ...args] = words;
    const handler = COMMANDS[name.toLowerCase()];
    if (!handler) return one(seg(`command not found: ${name}  `), seg('(type help)', 'dim'));
    return handler(args, ctx);
}

/** Completable command names: the public ones from help, in help order. */
const COMPLETABLE = ['help', ...HELP.map(([cmd]) => cmd.split(' ')[0])];

export function complete(input: string): string {
    const cd = input.match(/^cd\s+(\S*)$/i);
    if (cd) {
        const hit = PAGES.find((p) => p.startsWith(cd[1].toLowerCase()));
        return hit ? `cd ${hit}` : input;
    }
    if (!input || /\s/.test(input)) return input;
    return COMPLETABLE.find((c) => c.startsWith(input.toLowerCase())) ?? input;
}

export class CommandHistory {
    private items: string[] = [];
    private index = 0;

    push(cmd: string): void {
        this.items.push(cmd);
        this.index = this.items.length;
    }

    prev(): string | undefined {
        if (this.items.length === 0) return undefined;
        this.index = Math.max(0, this.index - 1);
        return this.items[this.index];
    }

    next(): string {
        this.index = Math.min(this.items.length, this.index + 1);
        return this.items[this.index] ?? '';
    }
}
