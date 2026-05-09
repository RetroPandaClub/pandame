# AGENTS.md

Canonical entry point for **all** AI coding agents working in this repository
(Claude Code, Cursor, OpenAI Codex / GPT, Aider, GitHub Copilot, Continue,
opencode, …). If your tool reads `AGENTS.md` automatically, this is the right
file. If it doesn't, point it here.

> **Read this first. Always.** It is short on purpose. Everything deeper lives
> under [`docs/ai/`](./docs/ai/) and is linked below.

---

## 1. What this repo is

Pandame is a SvelteKit + [Juno](https://juno.build) starter app: a tiny
notes + image upload datastore that authenticates users with Internet
Identity and stores data in a Juno satellite on the Internet Computer.

| Stack            | Path                                     | Language                                  | Status              |
| ---------------- | ---------------------------------------- | ----------------------------------------- | ------------------- |
| Frontend         | `src/`, `src/routes/`, `src/lib/`        | SvelteKit 2 + Svelte 5 + TS + Tailwind v4 | **AI-active**       |
| i18n scaffolding | `src/lib/i18n/`, `scripts/i18n.ts`       | JSON + TS codegen                         | **AI-active**       |
| Juno wiring      | `juno.config.ts`, `juno.dev.config.ts`   | TypeScript                                | Restricted boundary |
| CI / infra       | `.github/workflows/`, `.github/actions/` | YAML                                      | Restricted          |

There is **no satellite serverless code** in this repo (no `src/satellite/`,
no `dfx.json`, no Rust). The data layer is the default Juno satellite
container with two collections: `notes` (datastore) and `images` (storage).

---

## 2. The 10 commandments (read before every change)

1. **Always idiomatic.** Use the conventions of the surrounding code (this
   repo's style), not the ones from your training data.
2. **Always atomic.** One logical change per PR. No drive-by refactors. No
   "while I'm here" edits.
3. **Always small.** Prefer 5 small PRs over 1 big PR.
4. **Always reusable.** Before adding a new component / util / store /
   type, search for an existing one. Extend the catalog in
   [`docs/ai/frontend/reusability.md`](./docs/ai/frontend/reusability.md)
   instead of duplicating.
5. **Always typed.** No `any`, no `as unknown as …`, no ignored
   `svelte-check` warnings. Types from `@junobuild/core` are the source of
   truth at the datastore boundary.
6. **Always a11y safe.** No bare clickable `<div>`s. Real `<button>` /
   `<a>` elements, labelled inputs, decorative icons `aria-hidden`. See
   [`docs/ai/frontend/a11y.md`](./docs/ai/frontend/a11y.md).
7. **Respect the structure.** New code goes in the folder that already
   owns that concern (`$lib/{components,stores,derived,types,utils,i18n}`).
   The taxonomy is closed — see
   [`docs/ai/frontend/structure.md`](./docs/ai/frontend/structure.md).
8. **Respect the i18n discipline.** User-visible copy goes through the
   `$i18n` store (typed via `npm run i18n`); never inline new English
   strings into components without adding the matching `en.json` key.
9. **Respect CI.** Run the local gates from
   [`docs/ai/pr-and-ci.md`](./docs/ai/pr-and-ci.md#4-local-quality-gates)
   before opening a PR.
10. **Don't overengineer.** A 10x engineer ships the smallest correct
    change. No new abstractions unless they remove duplication that
    already exists. **No new dependencies without explicit user
    approval.**

---

## 3. Where to look

| You're about to…                              | Read first                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Open any PR                                   | [`docs/ai/pr-and-ci.md`](./docs/ai/pr-and-ci.md)                                               |
| Touch any frontend file                       | [`docs/ai/frontend/README.md`](./docs/ai/frontend/README.md)                                   |
| Add or move a file                            | [`docs/ai/frontend/structure.md`](./docs/ai/frontend/structure.md)                             |
| Write Svelte 5 / runes / TS                   | [`docs/ai/frontend/stack-and-patterns.md`](./docs/ai/frontend/stack-and-patterns.md)           |
| Add UI                                        | [`docs/ai/frontend/reusability.md`](./docs/ai/frontend/reusability.md)                         |
| Add a Svelte component                        | [`docs/ai/frontend/workflows/new-component.md`](./docs/ai/frontend/workflows/new-component.md) |
| Add a store / derived                         | [`docs/ai/frontend/workflows/new-store.md`](./docs/ai/frontend/workflows/new-store.md)         |
| Add or change tests                           | [`docs/ai/frontend/testing.md`](./docs/ai/frontend/testing.md)                                 |
| Add user-visible text or interactive elements | [`docs/ai/frontend/a11y.md`](./docs/ai/frontend/a11y.md)                                       |
| Add or rename an i18n key                     | [`docs/ai/frontend/workflows/i18n.md`](./docs/ai/frontend/workflows/i18n.md)                   |
| Deploy / restart locally                      | [`.agents/workflows/deployment.md`](./.agents/workflows/deployment.md)                         |

---

## 4. Governance & meta

- **Truth hierarchy** (highest wins on conflict):
  1. **Code** (`src/**`, `scripts/**`) — current state of the world.
  2. **CI** ([`.github/workflows/**`](./.github/workflows/)) — non-negotiable
     checks.
  3. **CODEOWNERS** ([`.github/CODEOWNERS`](./.github/CODEOWNERS)) — review
     routing.
  4. [`docs/ai/governance.md`](./docs/ai/governance.md) — policies & boundaries.
  5. This file (`AGENTS.md`) — universal entry.
  6. Tool-specific layers ([`CLAUDE.md`](./CLAUDE.md),
     `.claude/rules/`, `.cursor/rules/`,
     `.github/copilot-instructions.md`) — never contradict the above.
- **Auto-adapting docs.** When a PR introduces a new pattern, convention,
  shared component, shared type, workflow, or policy, the agent **MUST**
  update the relevant `docs/ai/**` file in the same PR. See
  [`docs/ai/governance.md#meta-update-rule`](./docs/ai/governance.md#meta-update-rule).

---

## 5. Tool-specific entry points

These are thin layers on top of this file. They never contradict it.

- **Claude Code / Anthropic:** [`CLAUDE.md`](./CLAUDE.md) (+ legacy
  [`.claude/rules/`](./.claude/rules/) cards).
- **Cursor:** drop a rule under `.cursor/rules/` that points here.
- **GitHub Copilot:** drop `.github/copilot-instructions.md` that points
  here.
- **OpenAI Codex / Aider / opencode / Continue / …:** read this file
  (`AGENTS.md`).

If you add a new agent / tool, add a tiny pointer file (≤ 30 lines) here
that references this `AGENTS.md` — do **not** duplicate the rules.
