# Agent Roles — jackvanzeeland.com

Solo personal-portfolio repo — these are working modes for an AI session, not
separate people. Pick the one that matches the change; most sessions are
"Frontend/View".

| Role | Trigger context | Primary tools | Constraints |
|------|-----------------|---------------|-------------|
| Frontend / View | New/changed route, view, or component (`src/app/views/`, `src/components/`) | All | Follow the `View` `mount`/`unmount` contract ([CLAUDE.md](CLAUDE.md)); update [MAPPING.md](MAPPING.md) if routes/component tree change |
| Scene / Formation | Changes under `src/scene/` (particle formations, `SceneDirector`) | All | Formations stay deterministic and unit-tested (`tests/formations.test.ts`); respect the reduced-motion/save-data/no-WebGL gate in `src/utils/capabilities.ts` |
| Build & Infra | `vite.config.ts`, `scripts/*.mjs`, `.github/workflows/`, `infrastructure.yaml`, `deploy.sh` | All | A changed `infrastructure.yaml` needs a manual CloudFormation stack update — CI does not apply it; keep `legacyRedirects.mjs` → generated redirects in sync (enforced by `tests/redirects-sync.test.ts`) |
| Docs Sync | Structural change to routes, stack, or commands | Read, Edit | Update `README.md` / `CLAUDE.md` / `AGENTS.md` / `MAPPING.md` together, not in isolation |
| Reviewer / Cleanup | Pre-commit check, dependency/dead-code sweep | Read, Grep, Bash | No behavior changes; flag but don't silently delete anything ambiguous |

## Session Initialization

All sessions should:
1. Read [CLAUDE.md](CLAUDE.md) for commands/conventions and [MAPPING.md](MAPPING.md) for current routes.
2. Check `git status` — note the `Stop` hook auto-commits edits on session end (see CLAUDE.md).
3. Run `npm run typecheck` and `npm test` before trusting the working tree is clean.
4. Watch for iCloud-drive duplicate files (`"name 2.ext"`) after any external merge/pull.
