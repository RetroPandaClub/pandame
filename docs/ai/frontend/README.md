# Frontend AI Guide

If you are about to touch anything under `src/lib/`, `src/routes/`, or the
top-level `src/*.{css,html,d.ts}` files, this is your starting point. Read
it once per session.

> Higher up the chain: [`AGENTS.md`](../../../AGENTS.md) → [`docs/ai/`](../README.md).

## Pre-flight checklist (every change)

- [ ] I read [`AGENTS.md`](../../../AGENTS.md) and the
      [11 commandments](../../../AGENTS.md#2-the-11-commandments-read-before-every-change).
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
- **Tailwind v4** wired via `@tailwindcss/vite`. The purple/green
  brand palette, Poppins (self-hosted), the modular type scale
  (`text-{xxs,body2,body1,h6..h1}`), the `tall:` custom variant and
  the `animate-fade` keyframe live in
  [`src/app.css`](../../../src/app.css) via `@theme` +
  `@custom-variant`. Brand-aware colours resolve through CSS
  variables on `[data-theme]` so dark mode is a one-file swap. No
  `tailwind.config.ts`.
- **`@junobuild/core`** for Internet Identity sign-in **and** for
  the editable `profiles` datastore collection (see
  [`juno.dev.config.ts`](../../../juno.dev.config.ts) +
  [`profile.services.ts`](../../../src/lib/services/profile.services.ts)).
- **`@dfinity/agent` + `@icp-sdk/canisters`** for talking to the escrow
  canister and the ICP ledger.
- **`@icp-sdk/bindgen`** generates the TS bindings from the upstream
  `escrow.did` (driven by `npm run did`).
- **`qrcode`** renders the share-link QR for the tip flow.
- **ESLint** flat config (see
  [`eslint.config.js`](../../../eslint.config.js)). Notable rules:
  `import/no-relative-parent-imports` is **`error`** under `src/**`,
  `import/no-duplicates`, `import/order` (alphabetical),
  `svelte/require-each-key`. `svelte/no-navigation-without-resolve` is
  intentionally `off` (we have external `<a href>` URLs).
- **Vitest 4** with `jsdom` for unit tests. **Playwright** for E2E
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
├── app.{css,html,d.ts}     Tailwind theme, HTML shell (data-theme="light"), ambient types
├── custom-events.d.ts      Juno DOM events typing
├── routes/
│   ├── +layout.svelte      Mobile-first phone-frame shell, mounts <Auth />
│   ├── +layout.ts          ssr=false, prerender=false (SPA fallback)
│   ├── +page.svelte        / — History dashboard / WelcomeScreen
│   ├── deals/{new,[id],[id]/dispute}/+page.svelte
│   ├── profile/{,,edit,arbitrator,admin}/+page.svelte
│   ├── send/+page.svelte
│   └── claim/[deal_id]/+page.svelte    Public QR / share-link claim flow
├── declarations/           Generated Candid bindings (DO NOT hand-edit)
└── lib/
    ├── actors/             Shared agent / actor manager
    ├── api/                Identity-passing facades (`*.api.ts`)
    ├── canisters/          `Canister<S>` wrappers (`*.canister.ts`)
    ├── components/         UI components (flat — no feature folders today)
    │   └── icons/          Inline-SVG icon components
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

- `feat(profile): persist user-editable profile via Juno datastore` —
  one cohesive addition (type + service + store + derived + UI),
  every file fits an existing bucket, datastore collection wired in
  `juno.dev.config.ts` in the same commit.
- `feat(ui,routes): turn create-deal into a full-screen /deals/new
flow` — single concern (UI rewrite), drops the previous modal in
  the same commit.
- `chore(theme): wire dark/light theming on data-theme attribute` —
  single piece of infra (CSS variable indirection + cleanup of
  per-component `dark:` overrides + doc updates), no behaviour
  change in light mode.

If your PR doesn't look like one of those (single verb, single concern,
small diff), reconsider scope before continuing.
