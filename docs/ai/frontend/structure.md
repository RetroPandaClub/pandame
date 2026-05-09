# Frontend Structure & Naming

The folder taxonomy is **closed**: do not add new top-level folders under
`src/lib/` (or `src/`) without explicit user approval. Place new code in
the folder that already owns the concern.

## Top level (`src/`)

```
src/
├── app.css                 Tailwind v4 entry + @theme tokens + JetBrains Mono @font-face
├── app.d.ts                Ambient SvelteKit types
├── app.html                HTML shell
├── custom-events.d.ts      Ambient custom-event types for Juno DOM events
│
├── routes/                 SvelteKit file-based routing
│   ├── +layout.svelte      Auth shell + brand chrome
│   ├── +layout.ts          ssr=false, prerender=false (SPA fallback)
│   ├── +page.svelte        Dashboard (Create CTA, balance, deals table)
│   └── claim/[deal_id]/+page.svelte
│                           Public claim flow for QR / share-link
│
├── declarations/           Generated Candid bindings (DO NOT hand-edit)
│   ├── _factory.ts         Re-exports `idlFactoryEscrow` etc.
│   ├── _types.ts           Re-exports the `EscrowDid` namespace.
│   ├── index.ts            Single import surface (`$declarations`).
│   └── escrow/             Vendored .did + generated .idl.{js,d.ts} + .d.ts
│
└── lib/                    Application code (cross-route)
    ├── actors/             Shared agent / actor manager (`agents.ic.ts`)
    ├── api/                Identity-passing facades (`*.api.ts`)
    ├── canisters/          Typed canister wrappers extending `Canister<S>` (`*.canister.ts`)
    ├── components/         UI components (flat — no feature folders today)
    ├── constants/          App-wide constants & lookup tables (`*.constants.ts`)
    ├── derived/            Derived stores (`*.derived.ts`)
    ├── enums/              Plain TS enums / const objects (`*.ts`)
    ├── env/                Vite env wrappers (`app.env.ts`)
    ├── i18n/               Translation dictionaries (one JSON per locale)
    ├── services/           Side-effectful orchestration (`*.services.ts`)
    ├── stores/             Writable / readable Svelte stores (`*.store.ts`)
    ├── types/              TS interfaces / types (incl. generated `i18n.d.ts`)
    └── utils/              Pure helpers — no I/O, no DOM (`*.utils.ts`)
```

### Components — current inventory

`src/lib/components/` is flat today (no feature folders). Look here before
creating a new component:

- `Auth.svelte` — auth wrapper that subscribes to `onAuthStateChange`
  exactly once and renders `Login` / `Logout` + the children.
- `Backdrop.svelte` — dimmed overlay with optional spinner.
- `Background.svelte` — decorative right-side illustration.
- `BalanceBadge.svelte` — caller's ICP balance pill (reads
  `balanceStore`).
- `Button.svelte` — themed CTA button used across the app.
- `Card.svelte` — generic glass-card surface (title + children + footer
  snippets).
- `CreateDealModal.svelte` — full create + fund form (title, note,
  recipient, amount, expiry); calls `createAndFundDeal`.
- `DealActions.svelte` — context-aware action bar (Consent / Reject /
  Cancel / Accept / Reclaim + the stubbed Dispute button).
- `DealRow.svelte` — single-deal card (badge, fields, action bar).
- `DealStatusBadge.svelte` — colored pill per deal lifecycle status.
- `DealsTable.svelte` — list wrapper with loading / empty / `<ul>` states.
- `EmptyState.svelte` — dashed-border "nothing here yet" placeholder.
- `Footer.svelte` — page footer with brand + social links.
- `Login.svelte` — Internet Identity sign-in CTA (wraps `signIn`).
- `Logout.svelte` — sign-out button (wraps `signOut`).
- `Modal.svelte` — generic dialog shell (title / children / footer
  snippets, Esc-to-close, Backdrop included).
- `ShareLinkModal.svelte` — post-create QR + copyable share link.

If you add a new feature, prefer extending one of the above. Only create
a new component when no neighbour fits.

## Naming conventions

These are **strict**. ESLint / `svelte-check` do not enforce all of them,
so agents must.

### File suffixes

| Suffix               | Meaning                                                | Example                                    |
| -------------------- | ------------------------------------------------------ | ------------------------------------------ |
| `*.svelte`           | Component (PascalCase filename)                        | `DealRow.svelte`, `CreateDealModal.svelte` |
| `*.svelte.ts`        | Module that uses Svelte 5 runes outside a component    | _(rare today; introduce as needed)_        |
| `*.canister.ts`      | IC actor wrapper extending `Canister<S>`               | `escrow.canister.ts`                       |
| `*.api.ts`           | Identity-passing facade over a `*.canister.ts`         | `escrow.api.ts`, `icrc-ledger.api.ts`      |
| `*.services.ts`      | Side-effectful module (orchestrates api + stores + UI) | `deal.services.ts`, `identity.services.ts` |
| `*.store.ts`         | Writable / readable Svelte store factory               | `deals.store.ts`, `balance.store.ts`       |
| `*.derived.ts`       | Derived Svelte store                                   | `deals.derived.ts`                         |
| `*.constants.ts`     | App-wide constants & lookup tables                     | `app.constants.ts`, `tokens.constants.ts`  |
| `*.utils.ts`         | Pure helpers — no I/O, no side effects, no DOM access  | `format.utils.ts`, `deal.utils.ts`         |
| `*.spec.ts`          | Vitest spec, colocated next to the file under test     | `format.utils.spec.ts`                     |
| `*.test.ts`          | Playwright E2E spec under `e2e/`                       | `homepage.test.ts`                         |
| `*.ts` (in `types/`) | Interfaces / types                                     | `deal.ts`, `token.ts`, `canister.ts`       |
| `*.ts` (in `enums/`) | Plain TS enums / const objects                         | `deal-status.ts`                           |

### Casing

| Thing                    | Style                         | Example                               |
| ------------------------ | ----------------------------- | ------------------------------------- |
| `.svelte` filename       | `PascalCase`                  | `DealRow.svelte`                      |
| `.ts` filename           | `kebab-case` (or single word) | `deal.services.ts`, `format.utils.ts` |
| Folder                   | `kebab-case` (or single word) | `components/`, `canisters/`           |
| Component name           | `PascalCase`                  | `DealRow`, `CreateDealModal`          |
| TS type / interface      | `PascalCase`                  | `Deal`, `DealSide`                    |
| Function / variable      | `camelCase`                   | `createAndFundDeal`, `dealsStore`     |
| Constant export          | `SCREAMING_SNAKE`             | `ESCROW_CANISTER_ID`, `ICP_TOKEN`     |
| Test ID / data attribute | `kebab-case`                  | `data-tid="deal-row"`                 |

### Time variables — `_ms` / `_ns`

Time values must carry their unit in the variable name:

- **`_ms`** — milliseconds. Default for business logic
  (`expiresAt_ms`, `nowMs`).
- **`_ns`** — nanoseconds. Use when the value crosses an IC protocol
  boundary (`expires_at_ns`, `created_at_ns` — these match the
  generated Candid field names).

When converting between the two, use `nsToDate` / `msToNs` from
[`format.utils.ts`](../../../src/lib/utils/format.utils.ts).

### Imports — aliases only

Pandame's eslint config sets `import/no-relative-parent-imports` to
**`error`** under `src/**`. Use the path aliases declared in
[`svelte.config.js`](../../../svelte.config.js):

| Alias           | Path               |
| --------------- | ------------------ |
| `$lib`          | `src/lib`          |
| `$declarations` | `src/declarations` |
| `$routes`       | `src/routes`       |
| `$root`         | repo root          |

```ts
import { idlFactoryEscrow, type EscrowDid } from '$declarations';
import { i18n } from '$lib/stores/i18n.store';
import type { Deal } from '$lib/types/deal';
import { dealsStore } from '$lib/stores/deals.store';
import { formatTokenAmount } from '$lib/utils/format.utils';
```

The single tolerated exception is the side-effect CSS import in
[`src/routes/+layout.svelte`](../../../src/routes/+layout.svelte):

```svelte
<script lang="ts">
	// eslint-disable-next-line import/no-relative-parent-imports
	import '../app.css';
</script>
```

Don't introduce new exceptions — surface a question instead.

### Forbidden imports / patterns

- Relative imports across folders (`../../...`) under `src/**` (eslint
  `import/no-relative-parent-imports`).
- Hand-edits to `src/lib/types/i18n.d.ts` — generated by `npm run i18n`.
- Hand-edits to anything under `src/declarations/escrow/` — generated by
  `npm run did` from upstream
  [`../escrow/src/escrow/escrow.did`](../../../../escrow/src/escrow/escrow.did).
- Hand-edits to `static/workers/**` — synced from `@junobuild/core` by
  `npm run postinstall`.
- Importing from `$declarations/**` outside of
  `$lib/{api,canisters}/` — go through the api facade so components stay
  free of generated-type churn.

## Where to put new files (decision tree)

1. **Is it a route?** Pandame today is a single dashboard + the
   `/claim/[deal_id]` flow. A new SvelteKit route is rare — surface a
   question first if you think you need one.
2. **Is it a UI component?** → `$lib/components/<Name>.svelte`. Look at
   the existing inventory first.
3. **Is it side-effectful business logic (calls api, mutates a store)?**
   → `*.services.ts` under `$lib/services/`.
4. **Is it a thin wrapper over a Candid endpoint?** → `*.api.ts` under
   `$lib/api/`. The matching `Canister<S>` lives in
   `$lib/canisters/*.canister.ts`.
5. **Is it a Svelte store?** → `*.store.ts` under `$lib/stores/`.
6. **Is it a derived store?** → `*.derived.ts` under `$lib/derived/`.
7. **Is it a pure helper?** → `*.utils.ts` under `$lib/utils/` plus a
   colocated `*.spec.ts`.
8. **Is it a TypeScript type / interface?** → `$lib/types/<name>.ts`.
9. **Is it a constant / lookup table?** → `*.constants.ts` in
   `$lib/constants/`, or a const-object enum in `$lib/enums/` if it's
   a closed set of named values used as a discriminator.
10. **Is it a translation key?** → add to every
    `src/lib/i18n/<locale>.json` (today: `en.json`) and run
    `npm run i18n`. See [`workflows/i18n.md`](./workflows/i18n.md).
11. **Is it generated?** → don't create it by hand. Run the generator
    (`npm run did` for Candid, `npm run i18n` for `i18n.d.ts`).
12. **None of the above?** → ask. Don't invent a folder.
