# Home Terminal Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home hero's subhead + stats row with an interactive fake terminal and a rolling "years building professionally" odometer.

**Architecture:** Two pure, unit-tested modules (command engine, experience math) feed two small DOM components (terminal, odometer), which `home.ts` mounts in place of `.home-sub`/`.home-ctas`/`.home-stats`. Terminal output is structured data (segments with a tone), rendered with `textContent` only, so user input can never become HTML. Compact (narrow-screen) mode is CSS-driven by the same aspect cutoff the monogram uses.

**Tech Stack:** Vanilla TypeScript, Vite, vitest + happy-dom, plain CSS with `tokens.css` variables.

**Spec:** `docs/superpowers/specs/2026-11-01-home-terminal-hero-design.md`. Read it first; it has the full copy, layout and accessibility rules. Behavior references: `.superpowers/brainstorm/90586-1793560916/content/home-terminal-v3.html` (terminal) and `clock-formats-v2.html` option 1 (odometer). These are throwaway prototypes, not code to copy.

## Global Constraints

- No new dependencies. No changes to `src/scene/**` (formations, `stage.ts`).
- Statement copy, verbatim: `I like building things and figuring things out. Give me a problem and I'll find a way through it, and probably have fun doing it.`
- Experience start: `2024-02-01T09:00:00-06:00`. Year length: `365.2425` days. Odometer shows **7 decimals**.
- Session flag: `sessionStorage` key `jvz:terminalBooted`; every access wrapped in try/catch, and a throw counts as first visit.
- Compact-mode media query (CSS and JS use the same string): `(max-aspect-ratio: 11/10)`. This matches `aspect > 1.1` in `src/scene/formations/monogram.ts`.
- Styles go in `src/styles/redesign/home.css` only: dark-only, token-driven (`--panel`, `--bg-raise`, `--line`, `--accent`, `--accent-teal`, `--accent-warm`, `--text*`, `--font-mono`, `--font-body`). Hide-until-JS CSS must be scoped under `.js`.
- Never auto-focus the terminal input. Key handlers live on the input element only.
- New home description, verbatim, used in `routeMeta.ts` and all three `index.html` meta tags: `Jack Van Zeeland is a Chicago software engineer who loves building things — AI tooling, automation, and a growing pile of side projects you can try.`
- Commits: this repo's `Stop` hook auto-commits at session end, so don't commit manually unless the user asks.
- Before calling any task done: `npm run lint && npm run typecheck && npm test`.

## Review Focus

1. **Navigating away mid-boot** (user clicks a nav link 300ms in): `unmount()` must cancel every pending boot/typing timeout. Nothing may append to a detached node or throw. *(Task 4 test: `destroy() mid-boot cancels pending timers`)*
2. **Interacting before boot finishes** (clicking a chip or the terminal while lines are still typing): skip straight to the finished state, then run the chip's command. Input is never lost or interleaved. *(Task 4 test: `chip during boot finishes boot then runs command`)*
3. **Hostile or huge input** (`<img src=x onerror=…>`, 5,000 characters): rendered as literal text, and the body scrolls inside itself rather than growing the page. *(Task 2 test: `echo of html input stays literal`; Task 4 test: `rendered output never creates elements from input`)*
4. **`sessionStorage` unavailable** (Safari private mode, blocked storage): there's no crash, and the boot plays. *(Task 4 test: `storage throwing is treated as first visit`)*
5. **Arrow/space keys when the terminal isn't focused**: the page scrolls normally. *(Task 4 test: `keydown on document is not intercepted`)*

---

### Task 1: Experience math

**Files:**
- Create: `src/app/views/homeExperience.ts`
- Test: `tests/home-experience.test.ts`

**Interfaces:**
- Produces:
  - `export const EXPERIENCE_START: Date`
  - `export function yearsSince(now: Date): number`
  - `export function formatYears(now: Date): string` returns `yearsSince(now).toFixed(7)`, clamped at `0` before the start date
  - `export function ageParts(now: Date): { years: number; months: number; days: number }` (calendar difference, borrowing months/days like the prototype)
  - `export function experienceAriaLabel(now: Date): string` returns `` `About ${yearsSince(now).toFixed(2)} years building professionally` ``

- [ ] **Step 1: Write failing tests**

```ts
const NOW = new Date('2026-11-01T09:00:00-06:00'); // exactly 1004 days after start
it('formats decimal years to 7 places', () => expect(formatYears(NOW)).toBe('2.7488586'));
it('is zero at start and clamps before it', () => {
    expect(formatYears(EXPERIENCE_START)).toBe('0.0000000');
    expect(formatYears(new Date('2020-01-01'))).toBe('0.0000000');
});
it('splits calendar parts', () => expect(ageParts(NOW)).toEqual({ years: 2, months: 9, days: 0 }));
it('borrows days across month ends', () =>
    expect(ageParts(new Date('2026-03-15T09:00:00-06:00'))).toEqual({ years: 2, months: 1, days: 14 }));
it('aria label rounds to 2 places', () =>
    expect(experienceAriaLabel(NOW)).toBe('About 2.75 years building professionally'));
```

- [ ] **Step 2:** `npx vitest run tests/home-experience.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3:** Implement the five exports in `src/app/views/homeExperience.ts`.
- [ ] **Step 4:** Rerun. Expected: PASS.

---

### Task 2: Terminal command engine (pure)

**Files:**
- Create: `src/app/views/homeTerminal.ts`
- Test: `tests/home-terminal.test.ts`

**Interfaces:**
- Consumes: `ageParts` (Task 1).
- Produces:
  ```ts
  export type Tone = 'plain' | 'dim' | 'ok' | 'warn' | 'prompt' | 'bright';
  export interface Segment { text: string; tone?: Tone; href?: string }
  export type Line = Segment[];
  export interface CommandContext { projectCount: number; now: Date }
  export interface CommandResult { lines: Line[]; navigateTo?: string; clear?: boolean }
  export const HOME_STATEMENT: string;            // verbatim copy from Global Constraints
  export const PAGES: readonly ['projects', 'journey', 'beyond', 'contact'];
  export function bootLines(ctx: CommandContext, today: Date): Line[];
  export function promptLine(input: string): Line;  // `guest@jvz:~$ <input>`, prompt tone on `guest@jvz`
  export function runCommand(input: string, ctx: CommandContext): CommandResult;
  export function complete(input: string): string;  // returns the completed input, or the input unchanged
  export class CommandHistory { push(cmd: string): void; prev(): string | undefined; next(): string }
  ```

Copy for every command is in the spec's **Commands** table. Use it verbatim. `bootLines` returns the six spec lines, and `side-projects/` reports `` `${ctx.projectCount} found` ``. `help` lists `ls`, `cd <page>`, `whoami`, `uptime`, `contact`, `clear` (spec descriptions; the easter eggs stay unlisted). `whoami` uses `ctx.projectCount`. `uptime` uses `ageParts(ctx.now)`. `cd`/`contact` set `navigateTo` to `/<page>`. The `/contact` link in `sudo hire jack` is a segment with `href: '/contact'`.

- [ ] **Step 1: Write failing tests**

```ts
const ctx = { projectCount: 16, now: new Date('2026-11-01T09:00:00-06:00') };
const text = (r: CommandResult) => r.lines.map((l) => l.map((s) => s.text).join('')).join('\n');

it('cd navigates to known pages, case/space/slash tolerant', () => {
    expect(runCommand('cd projects', ctx).navigateTo).toBe('/projects');
    expect(runCommand('  CD Journey/ ', ctx).navigateTo).toBe('/journey');
});
it('cd home targets do not navigate', () => {
    for (const t of ['cd', 'cd ~', 'cd /']) expect(runCommand(t, ctx).navigateTo).toBeUndefined();
});
it('cd unknown page', () => expect(text(runCommand('cd nope', ctx))).toContain('cd: no such page: nope'));
it('contact navigates', () => expect(runCommand('contact', ctx).navigateTo).toBe('/contact'));
it('unknown command', () => expect(text(runCommand('foo', ctx))).toContain('command not found: foo'));
it('empty input yields nothing', () => expect(runCommand('   ', ctx).lines).toEqual([]));
it('ls lists pages', () => expect(text(runCommand('ls', ctx))).toBe('projects/  journey/  beyond/  contact/'));
it('whoami and boot use project count', () => {
    expect(text(runCommand('whoami', ctx))).toContain('16 side projects');
    expect(bootLines(ctx, ctx.now).map((l) => l.map((s) => s.text).join('')).join('\n')).toContain('16 found');
});
it('uptime uses calendar parts', () => expect(text(runCommand('uptime', ctx))).toContain('up 2 years, 9 months, 0 days'));
it('clear', () => expect(runCommand('clear', ctx).clear).toBe(true));
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
    expect(promptLine(evil).map((s) => s.text).join('')).toContain(evil);
    expect(text(runCommand(evil, ctx))).toContain('command not found: <img');
});
it('tab completes commands and cd targets', () => {
    expect(complete('wh')).toBe('whoami');
    expect(complete('cd pro')).toBe('cd projects');
    expect(complete('cd zz')).toBe('cd zz');
});
it('history walks back and forward', () => {
    const h = new CommandHistory(); h.push('ls'); h.push('help');
    expect(h.prev()).toBe('help'); expect(h.prev()).toBe('ls'); expect(h.prev()).toBe('ls');
    expect(h.next()).toBe('help'); expect(h.next()).toBe('');
});
```

- [ ] **Step 2:** `npx vitest run tests/home-terminal.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement in `src/app/views/homeTerminal.ts`. Use a `Record<string, (args: string[], ctx) => CommandResult>` table keyed by the lower-cased first word.
- [ ] **Step 4:** Rerun. Expected: PASS.

---

### Task 3: Odometer component

**Files:**
- Create: `src/app/views/homeOdometer.ts`
- Modify: `src/styles/redesign/home.css` (append the `.home-odo*` rules)
- Test: `tests/home-odometer.test.ts`

**Interfaces:**
- Consumes: `formatYears`, `experienceAriaLabel` (Task 1).
- Produces: `export function createOdometer(opts: { reducedMotion: boolean; now?: () => Date }): { el: HTMLElement; destroy(): void }`

Markup: `div.home-odo` with an `aria-label` from `experienceAriaLabel`, containing `div.home-odo-label` "BUILDING PROFESSIONALLY", `div.home-odo-value[aria-hidden="true"]`, and `div.home-odo-unit` "years and counting". The value holds one `span.home-odo-digit > span.home-odo-strip` (0–9 stacked, each 1em tall) per digit and a `span.home-odo-sep` for `.`. Position each strip with `style.transform = translateY(-<n>em)`. Rebuild cells only when the string length changes.

Timing: update every 100ms (every 1000ms when `reducedMotion`). Pause while `document.hidden` or while an `IntersectionObserver` reports the element off-screen; skip the observer if `IntersectionObserver` is undefined. Update `aria-label` at most once per 60s. CSS: the last 3 digit strips get `transition: transform 120ms`, the rest `450ms cubic-bezier(.2,.8,.2,1)`. Under `@media (prefers-reduced-motion: reduce)` there's no transition. Value font: `--font-mono`, `font-variant-numeric: tabular-nums`.

- [ ] **Step 1: Write failing tests** (vitest fake timers)

```ts
it('renders the current value as digit strips', () => {
    const o = createOdometer({ reducedMotion: false, now: () => new Date('2026-11-01T09:00:00-06:00') });
    const digits = [...o.el.querySelectorAll('.home-odo-strip')].map((s) => (s as HTMLElement).style.transform);
    expect(digits[0]).toBe('translateY(-2em)');              // "2.7488586"
    expect(digits).toHaveLength(8);
    expect(o.el.getAttribute('aria-label')).toBe('About 2.75 years building professionally');
    o.destroy();
});
it('ticks every 100ms and stops after destroy', () => { /* advance 100ms → now() called again; destroy(); advance 1s → no more calls */ });
it('reduced motion ticks once per second', () => { /* advance 999ms → no extra call; 1ms more → one call */ });
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement and add the CSS.
- [ ] **Step 4:** Run. Expected: PASS.

---

### Task 4: Terminal component (DOM, boot, input, chips)

**Files:**
- Create: `src/app/views/homeTerminalView.ts`
- Modify: `src/styles/redesign/home.css` (append the `.home-term*` rules)
- Test: `tests/home-terminal-view.test.ts`

**Interfaces:**
- Consumes: everything from Task 2; `navigate` from `src/app/router.ts`; `PROJECTS` from `src/data/projects.ts`.
- Produces: `export function createTerminal(opts: { animate: boolean; navigate?: (path: string) => void; now?: () => Date }): { el: HTMLElement; destroy(): void }` and `export const BOOT_FLAG = 'jvz:terminalBooted'`.

**Structure** (class names fixed so CSS and tests agree):
- `div.home-term`, containing:
  - `div.home-term-bar` (three dots + `guest@jvz: ~`)
  - `div.home-term-body[role="log"]`, which holds `div.home-term-boot` (the boot lines), `p.home-term-statement` (`HOME_STATEMENT`), `div.home-term-hint`, the output lines, and `div.home-term-input` (prompt + `input[aria-label="Terminal: type a command"]`, with spellcheck/autocomplete off)
  - `nav.home-term-chips`: `<button data-cmd="help">`, `<button data-cmd="ls">`, `<a href="/projects" data-cmd="cd projects">`, `<a href="/journey" data-cmd="cd journey">`, `<a href="/contact" data-cmd="contact">`
- Render each `Segment` as a `span.tone-<tone>` with `textContent`. When `href` is set, render an `<a href>` instead. Never use `innerHTML` with dynamic data.

**Behavior:**
- `mount` always builds the **finished state** synchronously.
- When `opts.animate` is true **and** `BOOT_FLAG` isn't set, set the flag. Then, after 600ms, clear the boot, statement and hint, and replay: boot lines (120–380ms apart; skipped entirely, with no delay, when `matchMedia('(max-aspect-ratio: 11/10)')` matches), then the statement typed 2 characters per 18ms, then the hint. `aria-live="polite"` is added to the body only once boot finishes.
- Any click in the terminal, or any chip activation, during boot cancels the boot timers and jumps to the finished state.
- Clicking the body focuses the input. Enter runs `runCommand`, appends `promptLine(input)` and the result lines, then scrolls the body to the bottom. `clear` empties the output. `navigateTo` calls `opts.navigate` (default: router `navigate`) after 250ms. ↑/↓ use `CommandHistory`, and Tab uses `complete` with `preventDefault`.
- Chip click: `preventDefault()` (the router skips `defaultPrevented` clicks), then run `data-cmd` exactly as if it had been typed. Modifier-clicks (meta/ctrl/shift/middle) on anchor chips are left alone, so they open in a new tab.
- `destroy()` clears every timeout and interval this component created.

**CSS:**
- `.js .home-term-body` text stays hidden (`visibility: hidden`) until the component adds `.is-ready` (set right after the finished render, or at replay start). Prerendered/no-JS HTML has no `.js`, so it stays visible.
- Body: fixed height ~240px with `overflow-y: auto` and `overscroll-behavior: contain`. The statement uses `--font-body` at ~14.5px in `--text`; everything else uses `--font-mono` at 13px.
- Tones: `prompt` → `--accent-teal`, `ok` → `--accent`, `warn` → `--accent-warm`, `dim` → `--text-faint`, `bright` → `--text`.
- `@media (max-aspect-ratio: 11/10)`: `.home-term-boot { display: none }`, body `max-height` ≈ 4 lines + prompt, and smaller padding. The chips wrap.
- Width: `max-width: 600px`. In the 901–1150px range, cap the width so `.home-term` ends left of the avatar (avatar left edge ≈ `69vw - 125px` relative to the container). Use a `min()` expression, and leave `.home-avatar` rules untouched.

- [ ] **Step 1: Write failing tests** (fake timers, `sessionStorage.clear()` in `beforeEach`)

```ts
it('builds the finished state synchronously', () => {
    const t = createTerminal({ animate: false });
    expect(t.el.querySelector('.home-term-statement')?.textContent).toBe(HOME_STATEMENT);
    expect([...t.el.querySelectorAll('.home-term-chips a')].map((a) => a.getAttribute('href')))
        .toEqual(['/projects', '/journey', '/contact']);
    t.destroy();
});
it('first animated mount sets the flag and replays; second does not', () => { /* flag set; advance 600ms → statement text shorter than full; second createTerminal with flag → full text, no pending timers after destroy */ });
it('storage throwing is treated as first visit', () => { /* vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error() }) → no throw, replay starts */ });
it('destroy() mid-boot cancels pending timers', () => { /* advance 700ms, destroy(), vi.getTimerCount() === 0 */ });
it('chip during boot finishes boot then runs command', () => { /* advance 700ms, click [data-cmd="ls"] → statement full, last output contains "projects/" */ });
it('enter runs a command and cd navigates after 250ms', () => { /* type "cd journey" + Enter; navigate spy not called; advance 250ms → called with "/journey" */ });
it('rendered output never creates elements from input', () => { /* run '<img src=x>' → body.querySelector("img") === null */ });
it('anchor chip click is preventDefaulted and navigates via opts.navigate', () => { /* dispatch click on cd projects chip → event.defaultPrevented; advance 250ms → navigate("/projects") */ });
it('keydown on document is not intercepted', () => { /* dispatch ArrowDown on document → not defaultPrevented */ });
it('does not focus the input on mount', () => { /* document.activeElement !== input */ });
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement and add the CSS.
- [ ] **Step 4:** Run. Expected: PASS.

---

### Task 5: Wire into home, remove stats, update SEO copy

**Files:**
- Modify: `src/app/views/home.ts`, `src/styles/redesign/home.css` (delete `.home-sub`, `.home-ctas`, `.home-stats`, `.home-stat*`), `src/app/routeMeta.ts:29`, `index.html:11,33,42`
- Test: `tests/views-home.test.ts`

**Interfaces:**
- Consumes: `createTerminal` (Task 4), `createOdometer` (Task 3), `prefersReducedMotion` from `src/utils/capabilities.ts`.

`home.ts`: remove `STATS`, the sub, the CTAs and the stats row. After `h1`, append `createTerminal({ animate: !prefersReducedMotion() }).el` and `createOdometer({ reducedMotion: prefersReducedMotion() }).el`. Keep both handles and call `destroy()` in `unmount()`. Leave the eyebrow, h1, avatar and `requestFormation(monogramBuilder)` unchanged. Update the stale comment in the `max-width: 900px` block of `home.css` ("behind the CTAs") to describe the compact terminal.

- [ ] **Step 1: Rewrite `tests/views-home.test.ts`**

```ts
it('renders name, statement, nav chips and odometer', async () => {
    await homeView.mount(root, {});
    expect(root.querySelector('h1')?.textContent).toContain('Jack Van Zeeland');
    expect(root.querySelector('.home-term-statement')?.textContent).toBe(HOME_STATEMENT);
    const hrefs = [...root.querySelectorAll('.home-term-chips a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/projects', '/journey', '/contact']));
    expect(root.querySelector('.home-odo')).not.toBeNull();
    expect(root.querySelector('.home-stats')).toBeNull();
    homeView.unmount();
});
it('unmount leaves no timers', async () => { /* fake timers; mount; unmount; vi.getTimerCount() === 0 */ });
```

- [ ] **Step 2:** Run it. Expected: FAIL.
- [ ] **Step 3:** Make the `home.ts` and CSS changes. Set the new description (Global Constraints) in `routeMeta.ts` and the three `index.html` meta tags.
- [ ] **Step 4:** `grep -rn "48K\|22 automations\|STATS" src public index.html tests`. Expected: no matches.
- [ ] **Step 5:** `npm run lint && npm run typecheck && npm test`. Expected: all pass (`tests/seo.test.ts` includes the length check).
- [ ] **Step 6:** `npm run build`, then `grep -c "home-term-statement" dist/index.html` → `1` and `grep -c "48K" dist/index.html` → `0`.
- [ ] **Step 7: Manual check** with `npm run dev` (first `pkill -f vite` to avoid duplicate servers):
  - A fresh tab plays the boot, and a reload in the same tab shows the finished state instantly.
  - DevTools reduced-motion emulation shows no animation, and the odometer digits swap without rolling.
  - `cd projects` morphs the particles and lands on /projects. Back, then forward, works.
  - At 390×844 and 820×1180 there are no boot lines and the monogram is mostly visible below the odometer. At 1000×800 and 1440×900 the terminal doesn't touch the avatar.
  - Page load doesn't focus the input, and arrow keys scroll the page.
