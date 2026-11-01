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
export interface ProjectEntry {
    slug: string;
    title: string;
    href: string;
    /** Served by a separate app behind CloudFront — needs a full page load, not the SPA router. */
    external: boolean;
}
export interface CommandContext {
    projectCount: number;
    now: Date;
    projects?: ProjectEntry[];
    /** Commands typed this session, oldest first (including the current one). */
    history?: string[];
}
export interface CommandResult {
    lines: Line[];
    navigateTo?: string;
    /** navigateTo must be a full page load rather than a router navigation. */
    external?: boolean;
    /** Open in a new tab. */
    openUrl?: string;
    /** Download this file. */
    download?: string;
    clear?: boolean;
}

export const GITHUB_URL = 'https://github.com/jackvanzeeland';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/jack-van-zeeland-aab0a7221/';
export const RESUME_PATH = '/files/resume.pdf';

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
    ['ls projects', 'list projects'],
    ['cd <page>', 'go to a page'],
    ['open <project>', 'open a project'],
    ['whoami', 'about me'],
    ['uptime', "how long I've been at it"],
    ['github', 'my GitHub (new tab)'],
    ['linkedin', 'my LinkedIn (new tab)'],
    ['resume', 'download my resume'],
    ['contact', 'get in touch'],
    ['history', "what you've typed"],
    ['clear', 'clear the screen']
];

/** "~/projects/", "/projects", "projects/" → "projects"; "/" stays "/". */
function normalizePath(raw: string): string {
    const p = raw.toLowerCase();
    if (p === '/') return '/';
    return p.replace(/^~?\/+/, '').replace(/\/+$/, '') || '~';
}

function goToProject(cmd: string, slug: string, ctx: CommandContext): CommandResult {
    const project = (ctx.projects ?? []).find((p) => p.slug === slug.toLowerCase());
    if (!project) return one(seg(`${cmd}: no such project: ${slug}  `), seg('(try ls projects)', 'dim'));
    return {
        lines: [[seg(`opening ${project.title} … `), seg('loading', 'dim')]],
        navigateTo: project.href,
        ...(project.external ? { external: true } : {})
    };
}

type Handler = (args: string[], ctx: CommandContext) => CommandResult;

const COMMANDS: Record<string, Handler> = {
    help: () => ({
        lines: [
            [seg('available commands', 'bright')],
            ...HELP.map(([cmd, desc]): Line => [seg('  '), seg(cmd.padEnd(16), 'ok'), seg(desc)])
        ]
    }),
    ls: (args, ctx) => {
        const target = args[0] ? normalizePath(args[0]) : '~';
        if (target === '~' || target === '/' || target === '.') return one(seg(PAGES.map((p) => `${p}/`).join('  '), 'ok'));
        if (target === 'projects') return one(seg((ctx.projects ?? []).map((p) => `${p.slug}/`).join('  '), 'ok'));
        return one(seg(`ls: ${args[0]}: no such directory`));
    },
    cd: (args, ctx) => {
        const target = normalizePath(args[0] ?? '~');
        if (target === '~' || target === '/' || target === '..' || target === '.') {
            return one(seg("you're already home.", 'dim'));
        }
        if (target.startsWith('projects/')) return goToProject('cd', target.slice('projects/'.length), ctx);
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
    open: (args, ctx) =>
        args[0] ? goToProject('open', normalizePath(args[0]), ctx) : one(seg('usage: open <project>  '), seg('(try ls projects)', 'dim')),
    github: () => ({ lines: [[seg('opening GitHub in a new tab …')]], openUrl: GITHUB_URL }),
    linkedin: () => ({ lines: [[seg('opening LinkedIn in a new tab …')]], openUrl: LINKEDIN_URL }),
    resume: () => ({ lines: [[seg('downloading '), seg('resume.pdf', 'ok'), seg(' …')]], download: RESUME_PATH }),
    history: (_args, ctx) => ({
        lines: (ctx.history ?? []).map((cmd, i): Line => [seg(`${String(i + 1).padStart(5)}  `, 'dim'), seg(cmd)])
    }),
    brew: (args) => {
        const what = args.join(' ').toLowerCase();
        if (what !== 'coffee' && what !== 'install coffee') return one(seg('usage: brew coffee', 'dim'));
        return {
            lines: [
                [seg('==> ', 'ok'), seg('Downloading https://jvz/bottles/coffee-2.0.tar.gz')],
                [seg('######################################## 100.0%', 'dim')],
                [seg('==> ', 'ok'), seg('Pouring coffee--2.0.chicago.bottle.tar.gz')],
                [seg('  loading coffee ............... '), seg('ok', 'ok'), seg('  ☕ refilled', 'dim')]
            ]
        };
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
const COMPLETABLE = [...new Set(['help', ...HELP.map(([cmd]) => cmd.split(' ')[0])])];

export function complete(input: string, projectSlugs: readonly string[] = []): string {
    const slugHit = (partial: string) => projectSlugs.find((s) => s.startsWith(partial.toLowerCase()));
    const open = input.match(/^open\s+(\S*)$/i);
    if (open) {
        const hit = slugHit(open[1]);
        return hit ? `open ${hit}` : input;
    }
    const cd = input.match(/^cd\s+(\S*)$/i);
    if (cd) {
        const project = cd[1].match(/^((?:~|)\/?projects\/)(\S*)$/i);
        if (project) {
            const hit = slugHit(project[2]);
            return hit ? `cd ${project[1]}${hit}` : input;
        }
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

    entries(): string[] {
        return [...this.items];
    }

    next(): string {
        this.index = Math.min(this.items.length, this.index + 1);
        return this.items[this.index] ?? '';
    }
}
