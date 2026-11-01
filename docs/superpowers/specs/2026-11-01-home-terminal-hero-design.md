# Home hero: interactive terminal + experience odometer

**Date:** 2026-11-01
**Status:** design, awaiting approval
**Prototype:** `.superpowers/brainstorm/90586-1793560916/content/home-terminal-v3.html` (terminal) and
`clock-formats-v2.html` option 1 (odometer). Both are throwaway; use them as behavior references, not code to copy.

## Why

The current home hero (`src/app/views/home.ts`) has two parts Jack doesn't feel connected to:

- The subhead, *"I automate the repetitive — at work, at home, and everywhere in between…"*: it reads like a pitch
  and reduces him to one skill.
- The stats row (`22 AUTOMATIONS AT WORK / 48K+ HOURS SAVED / 16 SIDE PROJECTS`): the numbers aren't something he can
  stand behind, and they need constant upkeep.

What he wants a visitor to get in the first few seconds: **a picture of him, some creativity/wow (the JVZ particle
monogram), then a brief overview.** In a friend's words, he's *"smart and fun, loves to build things and is always
capable of finding a solution."* The new hero should feel like that: playful, built by him, and true without
maintenance.

## Goals

1. Replace the subhead with an **interactive fake terminal** that boots like a shell, types out Jack's statement and
   then accepts a small set of commands, including real navigation via `cd <page>`.
2. Replace the stats row with a **live experience odometer**: decimal years since Feb 1, 2024, with digits that
   physically roll.
3. Keep the photo, the JVZ monogram, the eyebrow and the name exactly as they are.
4. Remove the "22 automations / 48K+ hours" claims everywhere they appear, including the home SEO description.

## Non-goals

- No real shell, filesystem or arbitrary code execution. The command set is a fixed lookup table.
- No changes to other pages, the particle scene, or `stage.ts` formations.
- No new dependencies. Vanilla TS + CSS like the rest of the site.

## Anti-goals (failure even if it "works")

- **The statement disappears for crawlers or no-JS visitors.** The statement and the navigation links must be in the
  prerendered HTML.
- **It steals focus or the keyboard.** Loading the page must not focus the terminal input. Arrow keys and space must
  scroll the page unless the user has clicked or tabbed into the input.
- **It's a gimmick wall for non-technical visitors.** A recruiter who never types must still see the statement and
  reach Projects/Journey/Contact in one click (the chips).
- **It janks the particle intro.** Boot typing must not compete with the monogram formation for main-thread time.
  Use `setTimeout`/rAF-paced DOM appends only, with no layout thrash and no per-frame reflow of the whole terminal.
- **It plays the full boot every time.** That gets annoying fast (see "First visit only").

## Layout

Same hero grid and avatar positioning as today (`home.css`). In `.home-hero-text`, top to bottom:

1. Eyebrow `// SOFTWARE ENGINEER — CHICAGO` (unchanged)
2. `h1` name (unchanged)
3. **Terminal window**, replacing `.home-sub` and `.home-ctas`:
   - Title bar: three dots plus `guest@jvz: ~`
   - Scrollable body with a fixed height (about 240px desktop, smaller on mobile) that auto-scrolls to the bottom
   - Chip row: `help`, `ls`, `cd projects`, `cd journey`, `contact`
4. **Experience odometer**, replacing `.home-stats`, directly under the terminal.

Width: the terminal fills `.home-hero-text` (max ~600px). It must not overlap the avatar at any breakpoint. The
avatar is pinned at 69vw (`home.css`), so between about 900px and 1150px a 600px terminal would collide with it.
Narrow the terminal at those widths, and leave the breakpoint and avatar alone.

**Narrow screens (Jack's decision).** At the narrow layout (aspect ≤ 1.1, where `monogramBuilder` puts the monogram
lower-center, full width, and where `home.css`'s `max-width: 900px` block applies), the terminal goes **compact** so
the monogram stays visible below it:
- No boot lines, on any visit. The body shows only the statement (typed on a first visit, instant otherwise) and the
  hint.
- The typing area is small: a single-line prompt, with the body capped at about 3–4 lines of output and scrolling
  inside itself.
- The chips are the main way in; typing still works.
- The odometer stays under the terminal.
- Don't move the monogram or change `stage.ts` formations. Verify on a phone-sized and a portrait-tablet viewport
  that most of the monogram is visible below the hero content.

Styling: dark-only and token-driven (`tokens.css`: `--bg-raise`/`--panel`, `--line`, `--accent`, `--accent-teal` for
the prompt, `--accent-warm` for warnings, `--font-mono`). The statement line renders in the body font, not mono, so it
reads as prose. The prototype's look is approved; match it.

## Terminal behavior

### Boot sequence (first visit only)

Plays once per browser session on the first mount of the home view. Track it with `sessionStorage` key
`jvz:terminalBooted`, wrapped in try/catch; if storage throws, treat it as first visit. Lines, roughly 120–380ms apart:

```
Last login: <today's date> on ttys000
source ~/.bashrc
  loading curiosity.sh ......... ok
  loading side-projects/ ....... 16 found
  loading coffee ............... low
  loading problem-solver ....... ok
```

`16` comes from `PROJECTS.length`, not a literal. Then the statement types out quickly (a few characters per tick,
about 2s total), followed by `type help to look around` and a live prompt.

Start the boot about 600ms after mount so the particle formation gets first paint.

**Later visits** in the same session, **reduced-motion** visitors (`prefersReducedMotion()` from
`src/utils/capabilities.ts`) and **no-JS** visitors all see the finished state immediately: the boot lines, the
statement, the hint and an idle prompt, with no typing animation.

### Statement

> I like building things and figuring things out. Give me a problem and I'll find a way through it, and probably
> have fun doing it.

Keep it in one exported constant (e.g. `HOME_STATEMENT`) so Jack can edit the wording in one place.

### Commands

Case-insensitive, whitespace-trimmed. Unknown → `command not found: <cmd>  (type help)`. All user input is
rendered as text, never as HTML.

| Command | Output / effect |
|---|---|
| `help` | List of the commands below with one-line descriptions |
| `ls` | `projects/  journey/  beyond/  contact/` |
| `cd <page>` | `projects`, `journey`, `beyond`, `contact` (trailing `/` allowed) → echo a loading line, then `navigate('/<page>')` from `src/app/router.ts`. `cd`, `cd ~`, `cd /` → no-op message (already home). Unknown → `cd: no such page: <x>  (try ls)` |
| `whoami` | One short paragraph: Chicago software engineer, UW–Madison Data Science & Finance, Business Automation Engineer at Echo Global Logistics, `PROJECTS.length` side projects |
| `uptime` | `up X years, Y months, Z days. load average: high, mostly side projects` (same start date as the odometer) |
| `contact` | Echo, then navigate to `/contact` |
| `clear` | Clears the body, leaving the prompt |
| `sudo hire jack` | `✓ permission granted.` plus a `/contact` link |
| `sudo <anything else>` | `jack is not in the sudoers file. This incident will be reported.` |
| `vim` | `you can check out any time you like, but you can never leave.` |
| `rm …` | `nice try.` |

Input niceties: Enter runs the command, ↑/↓ walks session history, Tab completes command names and `cd` targets.
Clicking anywhere in the terminal body focuses the input.

Navigation should go through the existing router so the particle morph happens. Leave a short delay (~250ms)
after the echo so the user sees their command land.

### Chips

Real `<a href="/projects">`-style anchors for the `cd …` and `contact` chips, so they work without JS, get crawled
and are picked up by the router's link interception. On click with JS, also echo the command into the terminal
before the router navigates. `help` and `ls` are `<button>`s that run the command.

### Prerendered / no-JS markup

The prerendered HTML must contain the full finished state as real elements: boot lines, the statement as a `<p>`,
the hint, and the chip links. There is no hydration: `src/app/main.ts` calls `viewRoot.replaceChildren()` and
remounts every view on load. So `mount()` always builds the finished state; on a first-visit boot it then clears
and replays the sequence. To avoid the statement flashing, vanishing and retyping for first-time visitors, hide the
terminal body's text behind `.js` until the boot (or the instant render) takes over. This is the `.js`-gated reveal
pattern from `CLAUDE.md`. Prerender takes its snapshot about 100ms after mount, before the 600ms boot delay, so
`dist/index.html` gets the finished state.

### Accessibility

- The terminal body is a `role="log"` region with `aria-live="polite"` *after* boot finishes, so screen readers
  don't get every boot line announced. The statement is always available as a static `<p>`.
- The input has `aria-label="Terminal: type a command"`.
- Chips are keyboard-reachable in normal tab order.
- Mobile/coarse pointer: the input works, but chips are the primary affordance. Don't auto-focus on mobile, since
  that would pop the keyboard.

## Experience odometer

- Label: `BUILDING PROFESSIONALLY` above, `years and counting` below (from prototype option 1).
- Value: `(now − 2024-02-01T09:00:00-06:00) / (365.2425 days)`, formatted to **7 decimals** (e.g. `2.7503829`).
  Put the start date in one exported constant.
- Each digit is a vertical 0–9 strip in an overflow-hidden 1em cell, positioned with `translateY(-n em)`. The last
  three digits use a short transition (~120ms) and the rest ease (~450ms) so they click over like an odometer. At 7
  decimals the last digit rolls about every 3.2 seconds. That's the prototype's behavior and what Jack approved;
  match it.
- Update interval: ~100ms while visible. Pause on `document.hidden` and use an `IntersectionObserver` so it stops when
  scrolled away. Clear all timers and observers in `unmount()`.
- Reduced motion: no transition; digits update in place once per second.
- Prerender: render the value as of build time as plain text, then JS takes over. It's fine that it's slightly stale
  before hydration.
- `aria-label` on the container with a rounded human value (e.g. "About 2.75 years building professionally"),
  updated at most once a minute. Hide the spinning digit strips from assistive tech (`aria-hidden`).

## Other changes

- `src/app/routeMeta.ts` home `description`: drop the "22 automations shipped, 48K+ hours saved" claim. Suggested:
  *"Jack Van Zeeland is a Chicago software engineer who loves building things — AI tooling, automation, and a
  growing pile of side projects you can try."* It must pass `tests/seo.test.ts` length limits.
- Remove the `STATS` export and its CSS (`.home-stats`, `.home-stat*`). Update `tests/views-home.test.ts`
  accordingly.
- Root `index.html` carries the same claim in its `description`, `og:description` and `twitter:description` meta
  tags. Update all three to the new description.
- Check for and delete any other "48K"/"22 automations" copy (`grep -rn "48K\|22 automations" src public index.html`).

## Tests (vitest + happy-dom)

Keep the terminal logic in a pure, unit-testable module (e.g. `src/app/views/home/terminal.ts` with
`runCommand(input, ctx) → { output, navigateTo? }`) separate from DOM wiring.

- Each command's output, including unknown commands, `cd` to valid/invalid/home targets, and case/whitespace
  handling.
- HTML in user input is escaped.
- Tab completion and history.
- Odometer formatting: a known `now` gives the expected string, and decimal places stay fixed width.
- Home view mount: h1 present, statement text present, chip links include `/projects`, `/journey` and `/contact`;
  with `sessionStorage` flagged as booted, it renders the finished state synchronously.
- `unmount()` clears intervals (use fake timers).

## Builder's discretion

- Exact file split, class names and CSS structure (one stylesheet per view rule still applies: `home.css`).
- Exact boot timings and typing speed, within the feel of the prototype.
- Exact compact-terminal height (within "monogram mostly visible") and whether the chip row wraps or scrolls
  horizontally.
- Whether the compact mode is triggered by a CSS media query, a JS aspect check matching `monogram.ts`, or both.
- Whether `ls projects` / `cd projects/<slug>` is supported (nice to have, not required).

## Done when

`npm run lint`, `npm run typecheck` and `npm test` pass; `npm run build` prerenders `/` with the statement and chip
links in `dist/index.html`; and a manual check in `npm run dev` confirms the first-visit boot, the instant render on
reload in the same tab, reduced motion, `cd projects` morphing the particles, and no overlap with the avatar at
mobile, tablet and desktop widths.

## Addendum (2026-11-01): phone monogram intro

Approved by Jack after testing. On the compact (phone/portrait) layout the monogram has no empty zone, so:

- The home view calls `loadSceneNow()` (`src/scene/stage.ts`), which skips the low tier's wait for a first tap/scroll. That's about 125KB of three.js per phone homepage visit. Reduced motion, save-data and no-WebGL visitors are unchanged.
- **First visit in a session:** the whole terminal stays hidden while "JVZ" forms (`sceneReady()` + 1.9s, capped at 2.5s after mount, with no wait if particles will never load). Then `html.home-scene-dim` fades `#scene-root` to 30% and the terminal fades in and boots.
- **Later visits:** dimmed immediately, with the finished terminal.
- Leaving home removes the dim class. Desktop is unaffected.
- On phones the terminal is see-through (25% background, no blur, text shadow).
