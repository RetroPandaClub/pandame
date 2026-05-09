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
      component / util / store / service before creating one.
- [ ] My code follows [`stack-and-patterns.md`](./stack-and-patterns.md)
      (Svelte 5 runes, named `Props` interface, no `any`,
      `EscrowDid` types come from `$declarations`).
- [ ] No bare clickable `<div>`s; labelled inputs; `aria-hidden` on
      decorative icons — [`a11y.md`](./a11y.md).
- [ ] User-visible copy goes through `$i18n.*` keys —
      [`workflows/i18n.md`](./workflows/i18n.md).
- [ ] I added Vitest tests for any new pure helper / service / store
      with logic — [`testing.md`](./testing.md).
- [ ] No relative parent imports under `src/` — use the aliases
      (eslint enforces).
- [ ] I went through the service layer, not directly to
      `EscrowCanister` / `IcrcLedgerCanister` / `@junobuild/core`.
- [ ] If I regenerated bindings, I committed `src/declarations/escrow/**`
      together with the calling code change.
- [ ] Local quality gates pass —
      [`../pr-and-ci.md`](../pr-and-ci.md#4-local-quality-gates).
- [ ] PR title + body match conventions — [`../pr-and-ci.md`](../pr-and-ci.md).
- [ ] If I introduced a new pattern, I updated `docs/ai/**` in the same PR
      ([meta-update rule](../governance.md#meta-update-rule)).

## Stack at a glance

- **SvelteKit 2 + Svelte 5 (runes)**, TypeScript everywhere.
- **Tailwind v4** wired via `@tailwindcss/vite`. The lavender-blue
  palette, the `JetBrains Mono` font, the `tall:` custom variant and
  the `animate-fade` keyframe live in
  [`src/app.css`](../../../src/app.css) via `@theme` +
  `@custom-variant`. No `tailwind.config.ts`.
- **`@junobuild/core`** for Internet Identity sign-in.
- **`@dfinity/agent` + `@icp-sdk/canisters`** for talking to the escrow
  canister and the ICP ledger.
- **`@icp-sdk/bindgen`** generates the TS bindings from the upstream
  `escrow.did` (driven by `npm run did`).
- **`qrcode`** renders the share-link QR for the tip flow.
- **`nanoid`** is in the tree (legacy) — not used in the current code.
- **ESLint** flat config (see
  [`eslint.config.js`](../../../eslint.config.js)). Notable rules:
  `import/no-relative-parent-imports` is **`error`** under `src/**`,
  `import/no-duplicates`, `import/order` (alphabetical),
  `svelte/require-each-key`. `svelte/no-navigation-without-resolve` is
  intentionally `off` (we have external `<a href>` URLs).
- **Vitest 3** with `jsdom` for unit tests. **Playwright** for E2E
  across desktop + mobile + tablet devices.
- **Path aliases** (declared in
  [`svelte.config.js`](../../../svelte.config.js) and mirrored in
  [`vite.config.ts`](../../../vite.config.ts)):

  | Alias           | Path               |
  | --------------- | ------------------ |
  | `$lib`          | `src/lib`          |
  | `$declarations` | `src/declarations` |
  | `$routes`       | `src/routes`       |
  | `$root`         | repo root          |

## Where things go (one-liner)

```
src/
├── app.{css,html,d.ts}     Tailwind theme, HTML shell, ambient types
├── custom-events.d.ts      Juno DOM events typing
├── routes/
│   ├── +layout.svelte      Brand + auth shell
│   ├── +page.svelte        Dashboard
│   └── claim/[deal_id]/    Public QR / share-link claim flow
├── declarations/           Generated Candid bindings (DO NOT hand-edit)
└── lib/
    ├── actors/             Shared agent / actor manager
    ├── api/                Identity-passing facades (`*.api.ts`)
    ├── canisters/          `Canister<S>` wrappers (`*.canister.ts`)
    ├── components/         UI components (flat — no feature folders today)
    ├── constants/          App-wide constants & lookup tables
    ├── derived/            Derived stores
    ├── enums/              const-object enums
    ├── env/                Vite env wrappers
    ├── i18n/               Translation dictionaries
    ├── services/           Side-effectful orchestration
    ├── stores/             Writable / readable Svelte stores
    ├── types/              TS interfaces / types
    └── utils/              Pure helpers
```

Full taxonomy and naming conventions: [`structure.md`](./structure.md).

## What "good" looks like in this repo

A 10x change is small, focused, and reuses what's there. Recent merged
PRs to learn from (from `git log` on `main`):

- `feat(canisters,services,stores): add escrow + ICP ledger client layer`
  — single layered addition, every file fits an existing bucket.
- `feat(ui,routes): replace notes scaffold with the escrow deals dashboard`
  — single concern (UI rewrite), drops the obsolete code in the same
  commit.
- `chore(declarations): add candid bindings pipeline + escrow .did`
  — single piece of infra, minimal blast radius.

If your PR doesn't look like one of those (single verb, single concern,
small diff), reconsider scope before continuing.
