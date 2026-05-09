# Juno + Escrow Integration (Claude quick-reference)

> **Authoritative sources:**
>
> - Frontend stack + escrow client layer: [`docs/ai/frontend/stack-and-patterns.md`](../../docs/ai/frontend/stack-and-patterns.md)
> - Reusability catalog (services / api / canisters): [`docs/ai/frontend/reusability.md`](../../docs/ai/frontend/reusability.md)
> - Local deployment runbook: [`.agents/workflows/deployment.md`](../../.agents/workflows/deployment.md)
> - Bindings regeneration: [`docs/ai/frontend/workflows/regenerate-bindings.md`](../../docs/ai/frontend/workflows/regenerate-bindings.md)
> - Upstream escrow canister: [`AntonioVentilii/escrow` README](https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md), [TIPS.md](https://github.com/AntonioVentilii/escrow/blob/main/TIPS.md) (locally `../escrow/src/escrow/README.md`, `../escrow/TIPS.md`)
> - External docs: [Juno LLM Documentation](https://juno.build/llms-full.txt)
>
> This card is a Claude-only summary. If it disagrees with the docs
> above, the docs above win.

## Overview

Pandame uses Juno for two things:

1. **Internet Identity sign-in** (no other auth provider).
2. **One datastore collection — `profiles`** — that stores
   editable user metadata (username / name / address / email) keyed
   by principal. See
   [`profile.services.ts`](../../src/lib/services/profile.services.ts),
   [`Collection.PROFILES`](../../src/lib/constants/collections.constants.ts),
   [`juno.dev.config.ts`](../../juno.dev.config.ts).

All **escrow** / ledger state lives in the standalone **Escrow** Rust
canister ([`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow);
locally `../escrow/`; mainnet `umxj5-niaaa-aaaae-af2sq-cai`). The
frontend talks to it directly via a generated `@dfinity/agent` actor
and to ICRC-1 / -2 ledgers via `@icp-sdk/canisters/ledger/icrc`. Don't
push deal state into Juno.

## Key SDK functions (`@junobuild/core`)

- **Initialization:** `initSatellite({ workers: { auth: true } })`
  (called exactly once in `src/routes/+layout.svelte`'s `$effect`,
  followed by `i18n.init()`).
- **Auth:** `signIn({ internet_identity: {} })`, `signOut()`,
  `onAuthStateChange()`. Subscribe to `onAuthStateChange` exactly once,
  inside [`Auth.svelte`](../../src/lib/components/Auth.svelte).
- Other components read auth state via
  [`userStore`](../../src/lib/stores/user.store.ts) and the
  [`userSignedIn` / `userNotSignedIn`](../../src/lib/derived/user.derived.ts)
  derived stores.

> [!IMPORTANT]
> `signIn` requires the provider object — `signIn()` with no arguments
> is a TypeScript error in `@junobuild/core` 5.x. `signOut` accepts
> `SignOutOptions`, so wrap it in an arrow function when binding to
> `onclick`: `onclick={() => signOut()}`.

## Talking to the escrow canister

- One canister wrapper:
  [`canisters/escrow.canister.ts`](../../src/lib/canisters/escrow.canister.ts).
- One api facade:
  [`api/escrow.api.ts`](../../src/lib/api/escrow.api.ts).
- Service layer:
  [`services/deal.services.ts`](../../src/lib/services/deal.services.ts) +
  [`services/identity.services.ts`](../../src/lib/services/identity.services.ts).
- The canonical create-fund flow is **always**
  `create_deal` → `icrc2_approve(amount + fee)` → `fund_deal`. See
  `createAndFundDeal`.
- Components never touch `@dfinity/agent` / `EscrowCanister.create` /
  `IcrcLedgerCanister.create` directly.

## Canister + ledger configuration

| Constant                 | Where                                   | Value                         |
| ------------------------ | --------------------------------------- | ----------------------------- |
| `ESCROW_CANISTER_ID`     | `$lib/constants/canisters.constants.ts` | `umxj5-niaaa-aaaae-af2sq-cai` |
| `ICP_LEDGER_CANISTER_ID` | `$lib/constants/canisters.constants.ts` | `ryjl3-tyaaa-aaaaa-aaaba-cai` |
| `ICP_TOKEN`              | `$lib/constants/tokens.constants.ts`    | 8 decimals, fee 10_000 e8s    |
| Juno satellite (hosting) | `juno.config.ts`                        | `wqhtf-fqaaa-aaaal-amssq-cai` |
| Juno orbiter (analytics) | `juno.config.ts`                        | `gfpjj-5iaaa-aaaal-amr4a-cai` |

## Local development

- **Emulator:** `juno emulator start` (requires Docker or Podman). It
  exposes the IC HTTP gateway on `http://127.0.0.1:5987` and the admin
  console on <http://localhost:5866>. The emulator is a fully
  self-contained local IC replica — it **does not** proxy to mainnet.
- **Vite proxy:** [`vite.config.ts`](../../vite.config.ts) forwards
  `/api/*` to `http://localhost:5987` so the agent's HTTP gateway calls
  reach the emulator via the dev-server origin.
- **Vite plugin:** `@junobuild/vite-plugin` is wired alongside the proxy
  for env-var injection (resolves `satellite.ids.development` from
  [`juno.config.ts`](../../juno.config.ts)).
- **Tailwind v4:** the Vite plugin runs alongside `@tailwindcss/vite` —
  don't reorder the `plugins` array.
- **Agent host:** in dev, `REPLICA_HOST` is `window.location.origin`
  (so the Vite `/api` proxy can route the agent at the local replica).
  In prod it's `https://icp-api.io`. See
  [`$lib/constants/app.constants.ts`](../../src/lib/constants/app.constants.ts).
- **Local escrow:** the upstream escrow canister at
  [`../escrow/`](../../../escrow/) is **not** pre-installed in the
  emulator. `npm run dev:setup` builds it via `cargo` and deploys it
  with `dfx --network local` into the same Juno replica. The deployed
  canister ID is read from `VITE_ESCROW_CANISTER_ID` (set in
  `.env.local`). See
  [`.agents/workflows/deployment.md`](../../.agents/workflows/deployment.md).

> [!IMPORTANT]
> Do **NOT** run `dfx start`. Pandame's [`dfx.json`](../../dfx.json)
> wires the `local` network at `http://127.0.0.1:5987` (the Juno
> emulator's gateway) so dfx commands deploy into the emulator's
> replica without standing up a second one.

## Bindings pipeline

- `npm run did` — downloads the upstream `escrow.did` and regenerates
  `src/declarations/escrow/**` via `@icp-sdk/bindgen`.
- The generated `escrow.d.ts` carries `// @ts-nocheck` and is excluded
  from prettier + eslint via `.prettierignore` and the eslint
  `ignores` block.
- See
  [`docs/ai/frontend/workflows/regenerate-bindings.md`](../../docs/ai/frontend/workflows/regenerate-bindings.md)
  for the full flow.

## Best practices

- **Client-side only.** SSR is disabled (`+layout.ts: ssr = false`).
- **Auth guards.** Read auth state from `userSignedIn` before calling
  authenticated APIs. Service helpers (`safeGetIdentityOnce`) throw if
  the user isn't signed in.
- **Post-install.** Auth workers are synced via `npm run postinstall`
  to `./static/workers`. Don't hand-edit those files.
- **Custom DOM events.** `junoSignOutAuthTimer` fires when the auth
  session expires; `junoExampleReload` is the project's manual refresh
  signal (the dashboard listens to it for re-fetching deals + balance).
  Both are typed in
  [`src/custom-events.d.ts`](../../src/custom-events.d.ts).

## Dispute UI is stubbed

The `Disputed` lifecycle state is **not yet implemented in the canister**
(see [`AntonioVentilii/escrow#future-expansion`](https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md#future-expansion)).
The `Dispute` button in
[`DealActions.svelte`](../../src/lib/components/DealActions.svelte)
navigates to
[`/deals/[deal_id]/dispute`](../../src/routes/deals/%5Bdeal_id%5D/dispute/+page.svelte),
a visual mockup with a "v2" warning banner, disabled inputs and a
disabled `VoteQuorumPicker`. When the canister grows the
`Disputed` state + dispute-jury params, replace the mockup with a real
flow and update
[`docs/ai/frontend/reusability.md`](../../docs/ai/frontend/reusability.md)
in the same PR.

## Profile collection is real

`profile.services.ts` reads / writes the `profiles` Juno collection
through `@junobuild/core`'s `getDoc` / `setDoc`. The collection key
is `Collection.PROFILES` (string `'profiles'`) and rules in
[`juno.dev.config.ts`](../../juno.dev.config.ts) are
`memory: 'stable'`, `read: 'public'`, `write: 'private'`. If you change
the schema, mirror it in [`src/lib/types/profile.ts`](../../src/lib/types/profile.ts)
and re-run the local emulator to pick up the new rules.
