# Frontend AI Guide

If you are about to touch anything under `src/lib/`, `src/routes/`, or the
top-level `src/*.{css,html,d.ts}` files, this is your starting point. Read
it once per session.

> Higher up the chain: [`AGENTS.md`](../../../AGENTS.md) → [`docs/ai/`](../README.md).

## Pre-flight checklist (every change)

- [ ] I read [`AGENTS.md`](../../../AGENTS.md) and the
      [10 commandments](../../../AGENTS.md#2-the-10-commandments-read-before-every-change).
- [ ] I know which folder my code belongs in — see
      [`structure.md`](./structure.md).
- [ ] I checked [`reusability.md`](./reusability.md) for an existing
      component / util / store before creating one.
- [ ] My code follows [`stack-and-patterns.md`](./stack-and-patterns.md)
      (Svelte 5 runes, named `Props` interface, no `any`).
- [ ] No bare clickable `<div>`s; labelled inputs; `aria-hidden` on
      decorative icons — [`a11y.md`](./a11y.md).
- [ ] User-visible copy goes through `$i18n.*` keys —
      [`workflows/i18n.md`](./workflows/i18n.md).
- [ ] I added Vitest tests for any new pure helper / store logic —
      [`testing.md`](./testing.md).
- [ ] No relative imports from parent directories under `src/`
      (eslint enforces).
- [ ] Local quality gates pass —
      [`../pr-and-ci.md`](../pr-and-ci.md#4-local-quality-gates).
- [ ] PR title + body match conventions — [`../pr-and-ci.md`](../pr-and-ci.md).
- [ ] If I introduced a new pattern, I updated `docs/ai/**` in the same PR
      ([meta-update rule](../governance.md#meta-update-rule)).

## Stack at a glance

- **SvelteKit 2 + Svelte 5 (runes)**, TypeScript everywhere.
- **Tailwind v4** wired via `@tailwindcss/vite`. The lavender-blue palette,
  the `JetBrains Mono` font, the `tall:` custom variant and the
  `animate-fade` keyframe live in [`src/app.css`](../../../src/app.css)
  via `@theme` + `@custom-variant`. No `tailwind.config.ts`.
- **`@junobuild/core`** for auth + datastore + storage.
- **`@dfinity/utils`** for nullish helpers.
- **`nanoid`** for unique IDs.
- **ESLint** flat config (see
  [`eslint.config.js`](../../../eslint.config.js)). Local additions:
  `import/no-relative-parent-imports` is **`error`** under `src/**`,
  `import/no-duplicates` and `import/order` (alphabetical) too.
- **Vitest 3** with `jsdom` for unit tests. **Playwright** for E2E across
  desktop + mobile + tablet devices.
- **Path aliases** (declared in
  [`svelte.config.js`](../../../svelte.config.js) and mirrored in
  [`vite.config.ts`](../../../vite.config.ts)):

  | Alias     | Path         |
  | --------- | ------------ |
  | `$lib`    | `src/lib`    |
  | `$routes` | `src/routes` |
  | `$root`   | repo root    |

## Where things go (one-liner)

```
src/
├── app.css                 Tailwind import + @theme tokens + JetBrains Mono @font-face
├── app.html                HTML shell
├── app.d.ts                Ambient SvelteKit types
├── custom-events.d.ts      Ambient custom-event types for Juno DOM events
├── routes/                 SvelteKit shell (single page with notes table + create modal)
└── lib/
    ├── components/         Svelte components (Auth, Modal, Table, Login, Logout, …)
    ├── derived/            Derived stores (`*.derived.ts`)
    ├── i18n/               Translation dictionaries (one JSON per locale)
    ├── stores/             Svelte stores (`*.store.ts`)
    ├── types/              TS interfaces / types (incl. generated `i18n.d.ts`)
    └── utils/              Pure helpers (`*.utils.ts` + colocated `*.spec.ts`)
```

Full taxonomy and naming conventions: [`structure.md`](./structure.md).

## What "good" looks like in this repo

A 10x change is small, focused, and reuses what's there. Recent merged PRs
to learn from (from `git log` on `main`):

- `build(deps): bump dependencies and migrate to @junobuild/core + Tailwind v4`
  — single dependency-driven migration with all the necessary code edits
  in one commit.
- `chore: modernize repository structure inspired by vici-app`
  — config-only change, no behaviour change.
- `ci: rework CI/CD pipelines and dependabot inspired by vici-app`
  — single-area infra change.

If your PR doesn't look like one of those (single verb, single concern,
small diff), reconsider scope before continuing.
