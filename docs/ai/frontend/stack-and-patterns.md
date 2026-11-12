# Stack and patterns

The patterns PandaMe really uses, each with an example to copy, and the
anti-patterns already in the code so nobody copies them. If this page and
`src/` disagree, the code wins: fix the page in the same PR.

Stack: SvelteKit 2 (SPA, `adapter-static`), Svelte 5 runes, TypeScript,
Tailwind v4 (no `tailwind.config.ts`), `@icp-sdk/auth` for Internet Identity,
`@icp-sdk/core/agent` + `@dfinity/utils` `Canister<S>` for canisters,
`@icp-sdk/canisters/ledger/icrc` for ledgers, `@icp-sdk/bindgen` for
bindings, `@dfinity/zod-schemas` for canister ID validation, `qrcode` for
share links.

## Components (Svelte 5)

| Write                                                   | Not                                            |
| ------------------------------------------------------- | ---------------------------------------------- |
| `interface Props { … }` + `let { … }: Props = $props()` | `export let`, a type literal inside `$props()` |
| `$state`, `$derived`, `$derived.by`                     | `$:` statements                                |
| `$effect` only for I/O (DOM, timers, network)           | `$effect` that computes state                  |
| `onclick={fn}`                                          | `on:click`                                     |
| `{#snippet}` + `{@render}`                              | `<slot>`                                       |
| A callback prop (`onpicked`, `onclose`)                 | `$bindable`, unless the API needs it           |
| `{#each items as item (item.id)}`                       | an `each` without a key (eslint error)         |

Example: [`Chip.svelte:6`](../../../src/lib/components/Chip.svelte): `Props`
declared in the file after the imports, required props first, optional
callbacks typed `() => void | Promise<void>`, variant classes in one
`Record<Variant, string>` instead of nested ternaries.

- A component or page past about 300 lines, or mixing concerns, gets split
  into components.
- Never read and write the same state in one `$effect`; restructure into
  `$derived`.
- When TypeScript cannot narrow across a `$derived` arrow, use
  `$derived.by(() => …)` and branch on a local `const`.
- Cross-route state stays in Svelte stores (`$lib/stores`, `$lib/derived`);
  do not build a parallel runes-only store.

## TypeScript

- `unknown` and narrowing instead of `any`; a narrowing function instead of
  `as unknown as`.
- `isNullish` / `nonNullish` from `@dfinity/utils` instead of `!` on values
  that can be absent.
- Candid optionals (`[] | [T]`): `fromNullable` / `toNullable`, never `[0]`.
- Candid variants (`{ Funded: null }`): the helpers in
  [`deal.utils.ts:20`](../../../src/lib/utils/deal.utils.ts),
  `dispute.utils.ts`, `arbitrator.utils.ts`, all built on
  [`variantKey`](../../../src/lib/utils/variant.utils.ts). No hand-written
  `Object.keys`.
- Generated types are re-exported from `$lib/types/` (for example
  [`types/deal.ts`](../../../src/lib/types/deal.ts)); components import them
  from there.
- `import type` for type-only imports.

## Data flow

```
route / component
  → $lib/services/*.services.ts    identity, orchestration, store writes, events
    → $lib/api/*.api.ts            one function per endpoint, takes { identity, ...args }
      → $lib/canisters/*.canister.ts   Canister<S>, unwraps { Ok | Err }
        → $lib/actors/agents.ic.ts     one cached agent per identity
```

- **Canister wrapper:** [`escrow.canister.ts:34`](../../../src/lib/canisters/escrow.canister.ts)
  `static create` builds the actor from the normal and certified IDL;
  [`:25`](../../../src/lib/canisters/escrow.canister.ts) `unwrap` turns
  `Err` into an `EscrowCanisterError` (`:13`) carrying the variant.
- **API facade:** [`escrow.api.ts:9`](../../../src/lib/api/escrow.api.ts)
  shape `({ identity, ...args, ...queryParams })`, and the private
  `escrowCanister` factory at the bottom of the file.
  [`icrc-ledger.api.ts`](../../../src/lib/api/icrc-ledger.api.ts) takes the
  ledger ID as an argument, so a new ICRC token needs a constant, not a
  wrapper.
- **Service:** [`deal.services.ts:47`](../../../src/lib/services/deal.services.ts)
  `createAndFundDeal`: takes identity from `safeGetIdentityOnce`, computes the
  ICRC-2 allowance, calls the facade, then `reflectDeal` (`:17`) upserts the
  result into `dealsStore` and emits `pandameReloadDeals`. Every action
  service ends the same way; `dispute.services.ts` mirrors it for disputes.
- **Public reads** use `getIdentityOrAnonymous`
  ([`identity.services.ts:9`](../../../src/lib/services/identity.services.ts)),
  as `getProfile` in
  [`profile.services.ts:29`](../../../src/lib/services/profile.services.ts)
  does to resolve any principal's profile. The `/claim` preview is not one
  today: the page loads it only once signed in, and `getClaimableDeal` uses
  `safeGetIdentityOnce`.
- Identity is resolved per call, never cached in a service, so an expired
  session surfaces.

## Errors

- Canister `Err` → `EscrowCanisterError` (thrown by the wrapper). Services let
  it propagate.
- UI → [`friendlyEscrowError`](../../../src/lib/utils/escrow-error.utils.ts)
  maps the variant to `$i18n.errors.*`, falling back to `err.message`. Use it
  wherever an escrow call can fail.
- Pages keep a local `error` / `loadError` `$state` and render it; nothing is
  swallowed silently (`console.error` plus UI state at minimum). There is no
  global toast store; ask before adding one.
- Domain-specific failures get their own class:
  [`AvatarPipelineError`](../../../src/lib/utils/image.utils.ts) with a
  `reason` the UI maps to copy.

## State

- **Store factory:** [`deals.store.ts:11`](../../../src/lib/stores/deals.store.ts)
  wraps a `writable` and exposes intent methods (`set`, `upsert`, `remove`,
  `reset`). `undefined` means not loaded; a loaded empty collection is `[]`.
  `null` appears only where absence is itself a state: `userStore` (signed
  out) and `arbitratorStore` (not an arbitrator).
- **Derived:** [`deals.derived.ts:69`](../../../src/lib/derived/deals.derived.ts)
  `dealsAttentionCount` combines `dealsStore` and `userStore`; pure, no I/O.
- **Loader component:** [`DealsLoader.svelte`](../../../src/lib/components/DealsLoader.svelte)
  is behaviour-only, mounted once in `+layout.svelte`: a 30 s `setInterval`
  emits `pandameReloadDeals` (`:43`) and the one `<svelte:window>` listener
  (`:48`) refreshes deals and disputes. A new "refresh on a cadence and after
  actions" concern gets its own loader component, not more code in
  `Auth.svelte`.
- **Events:** [`emit`](../../../src/lib/utils/events.utils.ts) plus the type
  in [`custom-events.d.ts`](../../../src/custom-events.d.ts). Project events
  are named `pandame*`.
- **Profile:** [`ensureProfile`](../../../src/lib/services/profile.services.ts)
  loads or seeds the profile (with a DiceBear avatar from `avatar.utils`).
  Writes echo `version` back; the canister rejects a stale version, so a
  page that edits the profile re-reads it first.

## Auth

- [`Auth.svelte:24`](../../../src/lib/components/Auth.svelte) calls `initAuth`
  once and subscribes with `watchAuth`; it also bootstraps `profileStore` via
  `ensureProfile` after sign-in so header widgets have an avatar.
- The `AuthClient` lives only in
  [`AuthClientProvider`](../../../src/lib/providers/auth-client.providers.ts)
  (`getInstance()`); never construct another.
- `signIn()` takes no argument for plain Internet Identity, or
  `{ openIdProvider: 'google' | 'apple' | 'microsoft' }` for one-click sign-in.
  Bind `signOut` as `onclick={() => signOut()}`.
- Auth routes put `<AuthGuard />` at the top.
- [`DevAuth.svelte`](../../../src/lib/components/DevAuth.svelte): `?dev=1` in
  `npm run dev` fakes a signed-in user for screenshots; it is gated on
  `$app/environment`'s `dev`, so production builds drop it.

## Escrow domain

- **Settlement token:** import `SETTLEMENT_TOKEN` from
  [`tokens.constants.ts`](../../../src/lib/constants/tokens.constants.ts).
  It is ICP under `vite dev` / `vitest` and TESTICP in built artifacts.
  Tests may pin `ICP_TOKEN`. New tokens are added there, nowhere else.
- **Funding:** tips fund atomically inside `create_deal`; two-party deals
  fund in `create_deal` and `consent_deal`. The ICRC-2 allowance per role is
  computed by [`preApprovalAmount`](../../../src/lib/services/deal.services.ts)
  (`tip-create`, `payer-create`, `recipient-create`, `recipient-consent`,
  `payer-consent`); its doc comment holds the formulas. The spender is always
  the escrow canister's default subaccount. `DEFAULT_CREATION_FEE` mirrors the
  canister default because `config()` is controller-only.
- **Disputes:** `DealActions` offers Open dispute on `Funded` deals with a
  bound recipient and View dispute once `deal.dispute` is set.
  `/deals/[deal_id]/dispute` covers `open_dispute`, `submit_evidence`,
  `withdraw_dispute` (parties, Evidence phase), `cast_vote` (panel, Voting
  phase), `finalize_dispute` (anyone, after `voting_deadline_ns`) and the
  resolved outcome. The `disputed` tab and filter read `list_my_disputes` and
  the `Disputed` / `ArbitratedSettled` / `ArbitratedRefunded` statuses.
- **Panel size:** `PanelSizePicker` on `/deals/new` sets
  `CreateDealArgs.panel_size` from
  [`dispute.constants.ts`](../../../src/lib/constants/dispute.constants.ts);
  the detail page and the Pending card show it. `PanelSizeOutOfRange` maps to
  copy through `friendlyEscrowError`.
- **Arbitrators and admin:** `arbitratorStore` / `arbitrator.derived.ts` hold
  the signed-in user's `ArbitratorProfile` (loaded by `ensureArbitrator` on
  `/profile`). `/profile/admin` calls `admin_register_arbitrator`,
  `admin_set_arbitrator_status` and the treasury endpoints; the link is shown
  to everyone and the canister rejects non-controllers.
- Deal state never goes into the profiles canister.

## Styling and theming

- Tokens live in the `@theme` block of [`src/app.css`](../../../src/app.css),
  which opens with `--color-*: initial`: only declared colours exist. Each
  brand-aware token is declared in `@theme` (so Tailwind emits the utility)
  and again in `:root, [data-theme='light']` (the runtime value). Dark mode is
  filling the scaffolded `[data-theme='dark']` block; no component changes.
- Use the semantic utilities: `bg-bg` (canvas), `bg-bg-elevated` (cards,
  inputs, modals), `bg-bg-soft`, `bg-bg-inverse`, `text-default`,
  `text-default-inverse` (on brand fills), `text-muted`, `text-subtle`,
  `border-border`, `border-border-soft`, `bg-primary`, `primary-stroke`,
  `primary-light`, `shape-primary`, `success`, `warning`, `danger`, the
  `shadow-*` tokens, the `rounded-*` tokens, the type scale
  `text-{xxs,body2,body1,h6..h1}`. Read the values in `app.css`; do not copy
  them into docs or components.
- Prefer the `/n` opacity modifier on an existing token
  (`border-shape-primary/67`) before adding a token. Arbitrary sizes are fine
  when no token exists; arbitrary colours never are.
- Class order is sorted by `prettier-plugin-tailwindcss`.
- Mobile-first: design at 375 × 812, add `md:` / `tall:` variants for larger
  screens.

## Page composition

[`+layout.svelte`](../../../src/routes/+layout.svelte) renders a flex-column
phone frame (`max-w-[420px]`, `bg-bg` on a `bg-bg-soft` wash). An
authenticated page is
`<AuthGuard />` + `BrandHeader` (with `BrandHeaderBackButton` in `leading`
and `UserPrincipalBadge` in `trailing`) + a `Sheet` or content section +
`AppBottomNav`; see [`/transactions`](../../../src/routes/transactions/+page.svelte).
Public pages (welcome, claim) drop `AppBottomNav`. Every route sets its own
localized title in `<svelte:head>` as `<title>{title} · {$i18n.layout.title}</title>`
(for example [`deals/new/+page.svelte:135`](../../../src/routes/deals/new/+page.svelte));
`<title>PandaMe</title>` in `app.html` is only the fallback. A new route keeps
that pattern.

## i18n

`$i18n.section.key` from [`i18n.store.ts`](../../../src/lib/stores/i18n.store.ts).
Placeholders are `{name}` and are filled at the call site with
`String#replace`, as in
[`deals/[deal_id]/+page.svelte:68`](../../../src/routes/deals/[deal_id]/+page.svelte).
`*_html` keys are the only `{@html}` allowed, each with an inline
`svelte/no-at-html-tags` disable. Recipe: [`workflows/i18n.md`](./workflows/i18n.md).

## Anti-patterns

General, never do:

- Import `$declarations` in a component or route; call a canister, agent or
  ledger from a component.
- Keep a manual copy of canister data in a store "to have it"; refresh
  through the service so the canister stays the source of truth.
- `export let`, `$:`, inline `$props()` types, `$bindable` by default,
  `document.querySelector` on Svelte-managed DOM.
- Swallow an error; hard-code copy, colours or magic numbers in a component.
- `target="_blank"` without `rel="noopener noreferrer"`; `{@html}` on
  anything but a `*_html` key; `console.log` (only `warn` / `error` pass lint).
- A wrapper component that only re-exports another.

Found in the code today; do not copy, and fix only in a PR of their own. The
god pages, the canister-layer imports and the one over-complex function are
also baselined in `eslint-suppressions.json`
([quality gate](../pr-and-ci.md#the-quality-gate-inside-lint)):

| Smell                                                                       | Where                                                                                                                                                                                                                                                                                                | Do instead                                                                                 |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `err instanceof Error ? err.message : String(err)` repeated about ten times | `routes/profile/admin/+page.svelte:60`, `:95`, `:126`, `:160`, `:178`; `routes/deals/[deal_id]/dispute/+page.svelte:130`, `:155`; `routes/deals/[deal_id]/+page.svelte:47`; `routes/profile/arbitrator/+page.svelte:100`; `routes/deals/new/+page.svelte:107`                                        | `friendlyEscrowError`, or one shared helper in `utils`                                     |
| Route paths as string literals                                              | `goto('/profile')` in `routes/profile/admin/+page.svelte:185`, `routes/profile/arbitrator/+page.svelte:107`, `routes/profile/wallet/+page.svelte:21`, `routes/profile/edit/+page.svelte:132`; `/history`, `/deals/…`, `/transactions?tab=` across `routes/+page.svelte` and `DealActions.svelte:110` | Route builders in `routes.constants.ts`, which today only has `CLAIM_ROUTE` / `SHARE_URL`  |
| Avatar upload handlers copied                                               | `routes/profile/+page.svelte:61-110` and `routes/profile/edit/+page.svelte:86`                                                                                                                                                                                                                       | One service or helper used by both pages                                                   |
| Error class living in the canister layer                                    | `EscrowCanisterError` imported from `$lib/canisters/escrow.canister` by `DealActions.svelte:5`, `routes/deals/new/+page.svelte:5`, `escrow-error.utils.ts:1`                                                                                                                                         | Callers go through `friendlyEscrowError`; the class belongs where components may import it |
| Raw `rgba()` in markup                                                      | `BrandHeader.svelte:58`                                                                                                                                                                                                                                                                              | A token in `app.css`                                                                       |
| `as unknown as`                                                             | `storage.utils.ts:24`                                                                                                                                                                                                                                                                                | A narrowed fallback                                                                        |
| God pages                                                                   | `routes/deals/[deal_id]/dispute/+page.svelte` (564 lines), `routes/profile/admin/+page.svelte` (392)                                                                                                                                                                                                 | Extract sections into components                                                           |
| History narration in comments                                               | "replaces `@junobuild/core`" style comments in `auth.services.ts`, `auth-client.providers.ts`, `types/user.ts`, `profile.store.ts`, `canisters.constants.ts`, `tokens.constants.ts`, `image.utils.ts`, `types/profile.ts`                                                                            | Say why the code is as it is today                                                         |
| Legacy return shape                                                         | `createAndFundDeal` returns `{ created, funded }` "for call-site compatibility" (`deal.services.ts:40`)                                                                                                                                                                                              | Return one `DealView`                                                                      |
