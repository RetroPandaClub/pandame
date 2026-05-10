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

| Component          | Use it for                                                                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Avatar`           | Round image with text-initials fallback. Sizes sm 32 / md 48 / lg 76 / xl 134 px (matching Figma usage).                                                                                                                   |
| `Backdrop`         | Full-screen dimmed overlay; pass `spinner={true}` for the centred spinner.                                                                                                                                                 |
| `BottomNav`        | White card with `rounded-t-bottom-nav` (14 px), `shadow-bottom-nav`, three snippet slots (`left`, `right`, `center`). Centre snippet is wrapped in a 75 px floating circle with `shadow-raised-button`.                    |
| `BrandHeader`      | Coloured full-bleed header. `tone="primary"` (purple, default) or `tone="success"` (green for Profile). Snippet slots `leading` / `trailing` and `children` (Tabs / FilterChip strip). Honours iOS safe-area-top.          |
| `Button`           | CTA. Variants: `primary` (filled), `secondary` (outlined), `ghost`. Sizes `xs` 31 / `sm` 36 / `md` 40 / `lg` 54 px. `loading` renders a spinner + sets `aria-busy`. `leading` / `trailing` snippet slots for inline icons. |
| `ChatBubble`       | `side="bot"` (panda avatar + soft-bg bubble) or `side="user"` (right-aligned brand-bg bubble). Used by the home chat wizard.                                                                                               |
| `ChatChoiceRow`    | Array-driven row of outlined / filled reply pills indented under the bot avatar. `choices: { id, label, variant?, onclick }[]`.                                                                                            |
| `Chip`             | Small inline chip / badge / filter pill. Variants solid / outline / soft / success / warning / danger. Renders as `<button>` when `onclick` is supplied, plain `<span>` otherwise.                                         |
| `Countdown`        | Live `<time>` element ticking every `updateMs` (default 1 s). Renders `h{H}:{MM}:{SS}` for sub-day, `{D}d {HH}h {MM}m` past 24 h. Swaps to `expiredLabel` + `text-danger` when the deadline passes.                        |
| `EmptyState`       | Dashed-border "nothing here yet" placeholder, with optional snippet child.                                                                                                                                                 |
| `FilterChip`       | Single dropdown-style filter chip (label + funnel + chevron). Used by `/history`.                                                                                                                                          |
| `FormField`        | Label-above input wrapper. `labelFamily="sans" \| "serif-ui"` to switch between Poppins Medium and Inter Medium 16 px tracking `-0.32 px` per Figma.                                                                       |
| `IconButton`       | Square / circular icon-only button. Variants `primary` / `secondary` / `ghost` / `floating` (white card with soft shadow). Sizes sm / md / lg.                                                                             |
| `InfoLink`         | "Do you need help?" — info icon + Poppins Light 15 px purple. Renders as `<a>` if `href` given.                                                                                                                            |
| `Modal`            | Generic dialog shell (title + children + footer + Esc to close). Prefer `LogoutConfirmModal` for the Figma-spec sign-out dialog.                                                                                           |
| `Money`            | Formatted token amount via `formatTokenAmount`. Props: `signed`, `colorize`, `size`, `token` (defaults to `ICP_TOKEN`).                                                                                                    |
| `PandaBotAvatar`   | Lavender disc with the panda silhouette (chat-bubble face). Sizes sm 40 / md 60 / lg 76 px. Different chrome from `PandaMark` (full circle vs squircle).                                                                   |
| `PandaMark`        | Brand mark: panda silhouette inside a soft lavender squircle, sourced from `static/brand/panda.png`. Sizes sm / md / lg / xl. The hero variant on the welcome screen is built inline — don't extend `PandaMark`.           |
| `ProfileFieldRow`  | Label-left / green-value-right inline-editable row. Click to edit, Enter commits, Esc cancels, blur commits. Used by `/profile`.                                                                                           |
| `Sheet`            | The white off-white card with `rounded-t-sheet` (40 px) sliding over the BrandHeader. Configurable `overlap` (default 40 px) + `paddingClass`.                                                                             |
| `Tabs`             | Generic `<T extends string>` segmented control matching the Figma "Toggle Pay Receive": Inter Medium 11.85 px, `rounded-tab` (23 px) active pill on a translucent-white outlined `rounded-xl` (20 px) container.           |
| `TermsCheckbox`    | 14 × 14 checkbox + multi-color label (prefix + brand + linked term). Used by `/deals/new`.                                                                                                                                 |
| `TextInput`        | Themed `<input>` (h-[41px], `rounded-input` 8 px, 1.5 px light-purple border). `variant="default" \| "active"` (active = 1 px primary-stroke border).                                                                      |
| `UploadCTA`        | Purple "Choose files to upload" button + "Zip, Jpg or Pdf — Maximum files 10 MB" caption pair. Used by `/deals/new` and `/transactions` (Created tab).                                                                     |
| `VoteQuorumPicker` | Concentric SVG rings with Roboto numbers + labels (3 sizes 83 / 102 / 83 px, default Fast / Fair / Slow with 3 / 7 / 11 votes). `disabled` flips the whole group. Stubbed today — canister doesn't expose jury params.     |

### Composed components — `$lib/components/`

| Component            | Use it for                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppBottomNav`       | Wires `BottomNav` to the project's three destinations (/transactions · / · /profile) with active-route colour swaps. Side icons are bare SVGs (no IconButton chrome). |
| `Auth`               | Behaviour-only: subscribes to `onAuthStateChange` and hydrates `userStore` + listens for `junoSignOutAuthTimer`. Mounted once at the layout level — no UI.            |
| `AuthGuard`          | Behaviour-only redirect guard. Drop `<AuthGuard />` once at the top of any logged-in route — it `goto`s `redirectTo` (default `/`) when `userSignedIn` is false.      |
| `DealActions`        | Context-aware action bar: per-side, per-status (Consent / Reject / Cancel / Accept / Reclaim) plus a "Dispute (soon)" stub that navigates to `/deals/[id]/dispute`.   |
| `DealCard`           | Single-deal preview card (purple title bar + status icon + currency + signed amount + countdown). Optional `actions` snippet for inline buttons; optional `href`.     |
| `DealStatusIcon`     | 24 px circular status badge (check / cross / dot / swap / refresh) for the right of the DealCard title bar.                                                           |
| `DealsTable`         | List wrapper with loading / empty-state / `<ul>` of `DealCard` links + `filter` prop. Used by `/history`.                                                             |
| `Login`              | Internet Identity sign-in CTA. Forwards `fullWidth` / `size` / `label` to the underlying Button.                                                                      |
| `LogoutConfirmModal` | Sign-out confirmation. Solid `#3B2370` backdrop, both buttons filled purple per Figma.                                                                                |
| `ShareLinkModal`     | Post-create QR + copyable share link. No-ops gracefully when the deal already has a bound recipient.                                                                  |
| `UserPrincipalBadge` | `BrandHeader` `trailing` slot for authenticated routes — caller's short principal + Avatar. Reads `userPrincipalShort`.                                               |
| `WelcomeScreen`      | Full-screen logged-out connect-wallet hero (greeting + PandaMark + Connect pill).                                                                                     |

### Icons — `$lib/components/icons/`

| Icon              | What                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `BackIcon`        | Chevron-left for `BrandHeader.leading` "back" buttons.              |
| `ChevronDownIcon` | Dropdown indicator for FilterChip + future menus.                   |
| `FilterIcon`      | Funnel — used by FilterChip.                                        |
| `HomeIcon`        | House — bottom-nav centre.                                          |
| `InfoIcon`        | Circle-i — used by InfoLink.                                        |
| `PencilIcon`      | Inline-edit affordance — used by ProfileFieldRow + Profile heading. |
| `PlusIcon`        | "+" badge floating on the big Profile avatar.                       |
| `ProfileIcon`     | Person — bottom-nav right.                                          |
| `SwapIcon`        | Arrows — bottom-nav left (Transitions).                             |

Each is a single `<svg viewBox="0 0 24 24">` stroked path keyed by
`currentColor`. Add new icons as their own files; consider
`lucide-svelte` once the count crosses ~12.

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
