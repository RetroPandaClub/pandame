# Reusability — Catalog & Rules

> **Before you create, search.** This page is the answer to "is there
> already something for that?". Keep it up to date as part of the
> [meta-update rule](../governance.md#meta-update-rule): every PR that adds
> a reusable building block adds a row here.

## The reuse rule

1. **Search first.** Use `Grep` / `Glob` / `SemanticSearch` for the
   nearest concept before inventing one.
2. **Reuse if it fits.** Even at 80% — extend it if needed, with props.
3. **Extract if it doesn't.** If two places now do similar things, extract
   to one of the catalog locations below and update both call sites in
   the same PR (still atomic — one logical change: "consolidate X").
4. **Add a row here.** Don't make the next agent re-discover it.

## Where reusable things live

| Layer                      | Path                                | What goes there                                         |
| -------------------------- | ----------------------------------- | ------------------------------------------------------- |
| **Components**             | `$lib/components/`                  | All UI components (flat — no feature folders today).    |
| **Cross-cutting services** | `$lib/services/<thing>.services.ts` | Side-effectful operations shared across components.     |
| **API wrappers**           | `$lib/api/<canister>.api.ts`        | Identity-passing facades over `*.canister.ts`.          |
| **Actor factories**        | `$lib/canisters/<x>.canister.ts`    | `Canister<S>` subclasses that call the generated IDL.   |
| **Cross-cutting utils**    | `$lib/utils/<concern>.utils.ts`     | Pure helpers usable across components.                  |
| **Stores / derived**       | `$lib/stores/`, `$lib/derived/`     | Reactive state shared across views.                     |
| **Types**                  | `$lib/types/<name>.ts`              | TypeScript interfaces / types.                          |
| **Enums**                  | `$lib/enums/<name>.ts`              | Plain TS const-object enums.                            |
| **Constants**              | `$lib/constants/<x>.constants.ts`   | App-wide constants & lookup tables.                     |
| **i18n strings**           | `$lib/i18n/<locale>.json`           | One JSON per locale, regenerated to a typed dictionary. |

## Catalog (current — keep this honest)

> Edit this section in any PR that adds, renames, or removes an entry
> matching one of these buckets.

### Components — `$lib/components/`

| Component         | Use it for                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Auth`            | Auth wrapper that gates children behind a successful sign-in. Wires `onAuthStateChange` once.                                          |
| `Backdrop`        | Full-screen dimmed overlay; pass `spinner={true}` for a centered spinner.                                                              |
| `Background`      | Decorative right-side illustration (hidden on `< sm`).                                                                                 |
| `BalanceBadge`    | Caller's ICP balance pill. Reads `balanceStore`.                                                                                       |
| `Button`          | The themed CTA. Accepts `onclick`, `disabled`, and a snippet child.                                                                    |
| `Card`            | Generic glass-card surface (`title` + children + `footer` snippet).                                                                    |
| `CreateDealModal` | Full create + fund form. Calls `createAndFundDeal` and emits the funded `Deal` via `oncreated`.                                        |
| `DealActions`     | Context-aware action bar: per-side, per-status buttons (Consent / Reject / Cancel / Accept / Reclaim) plus the stubbed Dispute button. |
| `DealRow`         | Single-deal card — badge + title + #id + fields + action bar.                                                                          |
| `DealStatusBadge` | Colored pill per `DealStatusName`.                                                                                                     |
| `DealsTable`      | List wrapper (loading / empty-state / `<ul>`).                                                                                         |
| `EmptyState`      | Dashed-border "nothing here yet" placeholder, with optional snippet child.                                                             |
| `Footer`          | App footer (brand mark + external links).                                                                                              |
| `Login`           | Internet Identity sign-in CTA.                                                                                                         |
| `Logout`          | Sign-out button.                                                                                                                       |
| `Modal`           | Generic dialog shell (`title` + children + `footer` snippet, Esc-to-close, Backdrop included).                                         |
| `ShareLinkModal`  | Post-create QR + copyable share link. Renders nothing useful when the deal already has a bound recipient.                              |

### Services — `$lib/services/`

| Service             | Purpose                                                                                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identity.services` | Principal source of truth (`getIdentity`, `getIdentityOrAnonymous`, `safeGetIdentityOnce`).                                                                                                                                              |
| `deal.services`     | Deal lifecycle orchestration: `createAndFundDeal` (create → `icrc2_approve` → `fund_deal`), plus `acceptDeal`, `consentDeal`, `rejectDeal`, `cancelDeal`, `reclaimDeal`, `listMyDeals`, `getDeal`, `getClaimableDeal`, `getReliability`. |
| `balance.services`  | `myBalance({ token? })` — caller's principal default subaccount on the chosen ledger (defaults to ICP).                                                                                                                                  |

### API wrappers + canisters — `$lib/api/`, `$lib/canisters/`

| Module            | Purpose                                                                                                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `escrow.api`      | Identity-passing facade over `EscrowCanister` — one function per Candid endpoint.                                                                                                                                             |
| `escrow.canister` | `Canister<EscrowService>` subclass with `createDeal`, `fundDeal`, `acceptDeal`, `consentDeal`, `rejectDeal`, `cancelDeal`, `reclaimDeal`, `getDeal`, `getClaimableDeal`, `getEscrowAccount`, `listMyDeals`, `getReliability`. |
| `icrc-ledger.api` | `transfer`, `approve`, `transactionFee`, `balance` over `IcrcLedgerCanister` from `@icp-sdk/canisters`.                                                                                                                       |

### Actor — `$lib/actors/`

| Module      | Purpose                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------ |
| `agents.ic` | Single shared `AgentManager` (one cached `HttpAgent` per identity). Re-exports `getAgent`. |

### Stores & derived

| Module          | Where           | Purpose                                                                      |
| --------------- | --------------- | ---------------------------------------------------------------------------- |
| `user.store`    | `$lib/stores/`  | Authenticated Juno user (`User \| null \| undefined`).                       |
| `i18n.store`    | `$lib/stores/`  | Active locale + typed dictionary (`$i18n.*`).                                |
| `deals.store`   | `$lib/stores/`  | Cached deal list with `set` / `upsert` / `remove` / `reset`.                 |
| `balance.store` | `$lib/stores/`  | Caller's ICP balance (e8s).                                                  |
| `user.derived`  | `$lib/derived/` | `userSignedIn` / `userNotSignedIn` predicates.                               |
| `deals.derived` | `$lib/derived/` | `dealsLoaded`, `dealsCount`, `activeDeals`, `settledDeals`, `refundedDeals`. |

### Constants — `$lib/constants/`

| File                  | Notes                                                                  |
| --------------------- | ---------------------------------------------------------------------- |
| `app.constants`       | `REPLICA_HOST`, `ZERO`, ms / ns time scales, `II_MAX_TIME_TO_LIVE_NS`. |
| `canisters.constants` | `ESCROW_CANISTER_ID`, `ICP_LEDGER_CANISTER_ID`.                        |
| `tokens.constants`    | `ICP_TOKEN`, `SUPPORTED_TOKENS` list.                                  |
| `routes.constants`    | `CLAIM_ROUTE`, `SHARE_URL` builders for the QR / share-link flow.      |

### Enums — `$lib/enums/`

| File          | Notes                                                                           |
| ------------- | ------------------------------------------------------------------------------- |
| `deal-status` | `DealStatuses` / `ConsentStates` const objects + `TERMINAL_DEAL_STATUSES` list. |

### Common utils — `$lib/utils/`

| Util            | Purpose                                                                                |
| --------------- | -------------------------------------------------------------------------------------- |
| `format.utils`  | `formatTokenAmount`, `parseTokenAmount`, `nsToDate`, `msToNs`, `shortPrincipal`.       |
| `deal.utils`    | `dealStatus`, `consentState`, `isTerminal`, `isExpired`, `sideOf`, `isFullyConsented`. |
| `storage.utils` | Typed `get` / `set` / `del` wrappers around `localStorage` (SSR-safe).                 |

### Types — `$lib/types/`

| Type        | Purpose                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `canister`  | `CanisterIdText` (zod via `@junobuild/schema`) + `CreateCanisterOptions<T>`.                                                 |
| `deal`      | Re-exports `Deal` / `ClaimableDeal` / `DealError` / `DealStatusKey` / `ConsentKey` from `$declarations`; defines `DealSide`. |
| `token`     | App-side `Token` shape.                                                                                                      |
| `user`      | Re-exports the `@junobuild/core` `User` type.                                                                                |
| `languages` | Supported locale codes.                                                                                                      |
| `i18n.d.ts` | **Generated** by `npm run i18n`. Do not hand-edit.                                                                           |

### i18n — `$lib/i18n/`

| Locale  | File      |
| ------- | --------- |
| English | `en.json` |

When a key changes shape, run `npm run i18n` to regenerate the typed
dictionary. See [`workflows/i18n.md`](./workflows/i18n.md).

## When to extract a new shared block

Extract when **all** are true:

- The same shape (markup or function signature) exists in ≥ 2 places.
- The variation is small enough to express as props.
- The new abstraction has a name a non-author would recognise.

Don't extract speculatively for a single caller. The added indirection
costs more than the duplication.

## When to introduce a new top-level concept

Almost never. The taxonomy is closed. If you genuinely think a new bucket
is needed (e.g. a `validation/` folder once schemas multiply, or a
`schema/` folder for zod), surface it in the PR description and ask the
human owner before doing it.
