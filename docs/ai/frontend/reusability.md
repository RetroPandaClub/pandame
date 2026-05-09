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

| Layer                      | Path                                | What goes there                                            |
| -------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| **Components**             | `$lib/components/`                  | All UI components (flat — no feature folders today).       |
| **Icons**                  | `$lib/components/icons/`            | Single-path inline-SVG components keyed by `currentColor`. |
| **Cross-cutting services** | `$lib/services/<thing>.services.ts` | Side-effectful operations shared across components.        |
| **API wrappers**           | `$lib/api/<canister>.api.ts`        | Identity-passing facades over `*.canister.ts`.             |
| **Actor factories**        | `$lib/canisters/<x>.canister.ts`    | `Canister<S>` subclasses that call the generated IDL.      |
| **Cross-cutting utils**    | `$lib/utils/<concern>.utils.ts`     | Pure helpers usable across components.                     |
| **Stores / derived**       | `$lib/stores/`, `$lib/derived/`     | Reactive state shared across views.                        |
| **Types**                  | `$lib/types/<name>.ts`              | TypeScript interfaces / types.                             |
| **Enums**                  | `$lib/enums/<name>.ts`              | Plain TS const-object enums.                               |
| **Constants**              | `$lib/constants/<x>.constants.ts`   | App-wide constants & lookup tables.                        |
| **i18n strings**           | `$lib/i18n/<locale>.json`           | One JSON per locale, regenerated to a typed dictionary.    |

## Catalog (current — keep this honest)

> Edit this section in any PR that adds, renames, or removes an entry
> matching one of these buckets.

### Primitives — `$lib/components/`

| Component          | Use it for                                                                                                                                                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Avatar`           | Round image with text-initials fallback. Sizes sm / md / lg / xl.                                                                                                                                                                                                            |
| `Backdrop`         | Full-screen dimmed overlay; pass `spinner={true}` for the centred spinner.                                                                                                                                                                                                   |
| `BottomNav`        | Sticky bottom-of-frame nav. Three snippet slots: `left`, `right`, `center` (centre is absolutely positioned `-top-7` for a raised IconButton).                                                                                                                               |
| `BrandHeader`      | Purple full-bleed header with `title` + optional `subtitle`. Snippet slots `leading` / `trailing` (avatar, badges) and `children` (filter chips / tabs). Honours iOS safe-area-top.                                                                                          |
| `Button`           | Pill button. Variants: `primary` (filled), `secondary` (outlined), `ghost` (transparent). Sizes sm / md / lg. `loading` prop renders a spinner + sets `aria-busy`. `leading` / `trailing` snippet slots for inline icons.                                                    |
| `Chip`             | Small inline chip / badge / filter pill. Variants solid / outline / soft / success / warning / danger. Renders as `<button>` when `onclick` is supplied, plain `<span>` otherwise.                                                                                           |
| `Countdown`        | Live `<time>` element ticking every `updateMs` (default 1 s). Renders `h{H}:{MM}:{SS}` for sub-day, `{D}d {HH}h {MM}m` past 24 h. Swaps to `expiredLabel` + `text-danger` when the deadline passes.                                                                          |
| `EmptyState`       | Dashed-border "nothing here yet" placeholder, with optional snippet child.                                                                                                                                                                                                   |
| `FormField`        | Wraps a label + input + optional hint or error. Hint / error get a stable id and the inner slot is `aria-describedby`-d automatically.                                                                                                                                       |
| `IconButton`       | Square / circular icon-only button. Variants `primary` / `secondary` / `ghost` / `floating` (white card with soft shadow). Sizes sm / md / lg with `[&>svg]:` selectors that size the slotted SVG.                                                                           |
| `Modal`            | Generic dialog shell (`title` + children + `footer` snippet, Esc-to-close, Backdrop included).                                                                                                                                                                               |
| `Money`            | Formatted token amount via `formatTokenAmount`. Props: `signed`, `colorize`, `size`, `token` (defaults to `ICP_TOKEN`).                                                                                                                                                      |
| `PandaMark`        | Brand mark: panda silhouette inside a soft lavender squircle, sourced from the real brand artwork (`static/brand/panda.png`). Sizes sm / md / lg / xl. The hero variant on the welcome screen is built inline (rings GIF + cropped panda) — don't extend `PandaMark` for it. |
| `Tabs`             | Generic `<T extends string>` segmented control. Bindable `value`, `onchange`, `tabs: { id, label, disabled? }[]`. Renders inside a `bg-primary/30` capsule.                                                                                                                  |
| `TextInput`        | Themed `<input>`. Bindable `value`, `oninput` callback. Standard `type` / `inputmode`. `mono`, `invalid`, `aria-describedby` props.                                                                                                                                          |
| `VoteQuorumPicker` | Three circular vote-quorum selectors (default Fast / Fair / Slow with 3 / 7 / 11 votes). `disabled` flips the whole group to a non-interactive state. **Stubbed** today — the canister doesn't yet expose dispute-jury params.                                               |

### Composed components — `$lib/components/`

| Component            | Use it for                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppBottomNav`       | Wires `BottomNav` to the project's three primary destinations (/ · /send · /profile) with route-aware variant swaps.                                                |
| `Auth`               | Behaviour-only: subscribes to `onAuthStateChange` and hydrates `userStore` + listens for `junoSignOutAuthTimer`. Mounted once at the layout level — no UI.          |
| `AuthGuard`          | Behaviour-only redirect guard. Drop `<AuthGuard />` once at the top of any logged-in route — it `goto`s `redirectTo` (default `/`) when `userSignedIn` is false.    |
| `BalanceBadge`       | Caller's ICP balance pill. Reads `balanceStore`.                                                                                                                    |
| `DealActions`        | Context-aware action bar: per-side, per-status (Consent / Reject / Cancel / Accept / Reclaim) plus a "Dispute (soon)" stub that navigates to `/deals/[id]/dispute`. |
| `DealCard`           | Single-deal preview card (header bar + amount + countdown). Optional `href` renders the card as an `<a>` for the detail route.                                      |
| `DealFilterChips`    | All / Active / Settled / Refunded / Cancelled chip strip — bindable `value: DealFilter`.                                                                            |
| `DealStatusDot`      | 24 px circular icon badge per status (check / cross / fund / refresh / open circle).                                                                                |
| `DealsTable`         | List wrapper with loading / empty-state / `<ul>` + `filter` prop.                                                                                                   |
| `Login`              | Internet Identity sign-in CTA. Forwards `fullWidth` / `size` to the underlying Button.                                                                              |
| `LogoutConfirmModal` | Sign-out confirmation modal (Cancel / Yes, sign out).                                                                                                               |
| `ReliabilityCard`    | 3-row reliability summary: score chip + concluded count + positive count.                                                                                           |
| `RoleStubScreen`     | Shared layout for the v2 Arbitrator / Admin profile screens.                                                                                                        |
| `RoleSwitcher`       | User / Arbitrator / Admin tablist that navigates between the three profile routes.                                                                                  |
| `ShareLinkModal`     | Post-create QR + copyable share link. No-ops gracefully when the deal already has a bound recipient.                                                                |
| `UserPrincipalBadge` | `BrandHeader` `trailing` slot for authenticated routes — caller's short principal + Avatar. Reads `userPrincipalShort`.                                             |
| `WelcomeScreen`      | Full-screen logged-out connect-wallet hero (greeting + PandaMark + Connect pill).                                                                                   |

### Icons — `$lib/components/icons/`

| Icon          | What                                |
| ------------- | ----------------------------------- |
| `FilterIcon`  | Funnel — used by `DealFilterChips`. |
| `HomeIcon`    | House — bottom-nav centre.          |
| `ProfileIcon` | Person — bottom-nav right.          |
| `SwapIcon`    | Arrows — bottom-nav left.           |

Each is a single `<svg viewBox="0 0 24 24">` stroked path keyed by
`currentColor`. Add new icons as their own files; consider
`lucide-svelte` once the count crosses ~10.

### Services — `$lib/services/`

| Service             | Purpose                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identity.services` | Principal source of truth (`getIdentity`, `getIdentityOrAnonymous`, `safeGetIdentityOnce`).                                                                                                 |
| `deal.services`     | Deal lifecycle orchestration (`createAndFundDeal`, `acceptDeal`, `consentDeal`, `rejectDeal`, `cancelDeal`, `reclaimDeal`, `listMyDeals`, `getDeal`, `getClaimableDeal`, `getReliability`). |
| `balance.services`  | `myBalance({ token? })` — caller's principal default subaccount on the chosen ledger (defaults to ICP).                                                                                     |
| `profile.services`  | Editable `UserProfile` persistence in the Juno `profiles` datastore (`getProfile`, `upsertProfile`, `ensureProfile`).                                                                       |

### API + canisters — `$lib/api/`, `$lib/canisters/`

| Module            | Purpose                                                                           |
| ----------------- | --------------------------------------------------------------------------------- |
| `escrow.api`      | Identity-passing facade over `EscrowCanister` — one function per Candid endpoint. |
| `escrow.canister` | `Canister<EscrowService>` subclass with all escrow methods.                       |
| `icrc-ledger.api` | `transfer`, `approve`, `transactionFee`, `balance` over `IcrcLedgerCanister`.     |

### Actor — `$lib/actors/`

| Module      | Purpose                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------ |
| `agents.ic` | Single shared `AgentManager` (one cached `HttpAgent` per identity). Re-exports `getAgent`. |

### Stores & derived

| Module            | Where           | Purpose                                                                                        |
| ----------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `user.store`      | `$lib/stores/`  | Authenticated Juno user (`User \| null \| undefined`).                                         |
| `i18n.store`      | `$lib/stores/`  | Active locale + typed dictionary (`$i18n.*`).                                                  |
| `deals.store`     | `$lib/stores/`  | Cached deal list with `set` / `upsert` / `remove` / `reset`.                                   |
| `balance.store`   | `$lib/stores/`  | Caller's ICP balance (e8s).                                                                    |
| `profile.store`   | `$lib/stores/`  | Caller's `Doc<UserProfile> \| undefined` (lazy-loaded by `ensureProfile`).                     |
| `user.derived`    | `$lib/derived/` | `userSignedIn` / `userNotSignedIn` predicates + `userPrincipalText` / `userPrincipalShort`.    |
| `deals.derived`   | `$lib/derived/` | `dealsLoaded`, `dealsCount`, `activeDeals`, `settledDeals`, `refundedDeals`, `cancelledDeals`. |
| `profile.derived` | `$lib/derived/` | `profileLoaded`, `profileDisplayName`.                                                         |

### Constants — `$lib/constants/`

| File                    | Notes                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| `app.constants`         | `REPLICA_HOST`, `ZERO`, ms / ns time scales, `II_MAX_TIME_TO_LIVE_NS`. |
| `canisters.constants`   | `ESCROW_CANISTER_ID`, `ICP_LEDGER_CANISTER_ID`.                        |
| `tokens.constants`      | `ICP_TOKEN`, `SUPPORTED_TOKENS` list.                                  |
| `routes.constants`      | `CLAIM_ROUTE`, `SHARE_URL` builders for the QR / share-link flow.      |
| `collections.constants` | `Collection.PROFILES` — Juno datastore collection key registry.        |

### Enums — `$lib/enums/`

| File          | Notes                                                                           |
| ------------- | ------------------------------------------------------------------------------- |
| `deal-status` | `DealStatuses` / `ConsentStates` const objects + `TERMINAL_DEAL_STATUSES` list. |

(The `Collection` const-object enum lives in
`$lib/constants/collections.constants.ts`, not in `$lib/enums/`, because
it pairs the key with the Juno collection name — keep it next to the
related constants so the enum file stays purely about lifecycle states.)

### Common utils — `$lib/utils/`

| Util            | Purpose                                                                                |
| --------------- | -------------------------------------------------------------------------------------- |
| `format.utils`  | `formatTokenAmount`, `parseTokenAmount`, `nsToDate`, `msToNs`, `shortPrincipal`.       |
| `deal.utils`    | `dealStatus`, `consentState`, `isTerminal`, `isExpired`, `sideOf`, `isFullyConsented`. |
| `storage.utils` | Typed `get` / `set` / `del` wrappers around `localStorage` (SSR-safe).                 |

### Types — `$lib/types/`

| Type        | Purpose                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `canister`  | `CanisterIdText` (zod via `@junobuild/schema`) + `CreateCanisterOptions<T>`.                            |
| `deal`      | Re-exports `Deal` / `ClaimableDeal` / `DealError` / `DealStatusKey` / `ConsentKey`; defines `DealSide`. |
| `profile`   | `UserProfile` interface + `emptyProfile` factory (shape stored in the `profiles` collection).           |
| `token`     | App-side `Token` shape.                                                                                 |
| `user`      | Re-exports the `@junobuild/core` `User` type.                                                           |
| `languages` | Supported locale codes.                                                                                 |
| `i18n.d.ts` | **Generated** by `npm run i18n`. Do not hand-edit.                                                      |

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
