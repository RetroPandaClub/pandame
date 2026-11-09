# Reusability catalog

**Before you create, search this page and the code.** Every shared piece in
`src/lib/` is listed here with its path and one line. Reuse it if it fits even
at 80% (extend it with a prop); if two places do the same thing, extract it
here and move both callers in the same PR. A PR that adds, renames or removes
an entry updates this page ([meta-update rule](../governance.md#meta-update-rule)).
Extract only when the same shape exists twice, the variation fits in props,
and the name would make sense to someone else; never for a single caller.

Entries marked **(unused)** have no caller today: reuse them or delete them,
do not write a second one.

## Components: primitives (`$lib/components/`)

| Component                 | Use it for                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `Avatar`                  | Round image with initials fallback; sizes `sm` / `md` / `lg` / `xl`                               |
| `Backdrop`                | Full-screen dim, optional `spinner`                                                               |
| `BottomNav`               | Rounded bottom card with `left` / `center` / `right` snippets and the raised centre button        |
| `BrandHeader`             | Full-bleed header, `tone="primary" \| "success"`, `leading` / `trailing` snippets, children strip |
| `BrandHeaderBackButton`   | The back button for `BrandHeader.leading` (not `IconButton`, whose colour is wrong on tint)       |
| `Button`                  | CTA: `primary` / `secondary` / `ghost`, `xs` to `lg`, `loading`, `fullWidth`, icon snippets       |
| `ChatBubble`              | `side="bot" \| "user"` speech bubble for the home wizard                                          |
| `ChatChoiceRow`           | Row of reply pills from `choices: { id, label, variant?, onclick }[]`                             |
| `Chip` **(unused)**       | Small badge or filter pill; `<button>` when `onclick` is set                                      |
| `Countdown`               | Live `<time>` to a deadline, `expiredLabel` when it passes                                        |
| `EmptyState`              | Dashed "nothing here yet" placeholder                                                             |
| `FilterChip`              | Dropdown-style filter pill (used by `/history`)                                                   |
| `FormField`               | Label above a control; `labelFamily="sans" \| "serif-ui"`                                         |
| `IconButton` **(unused)** | Icon-only button with a required `ariaLabel`                                                      |
| `InfoLink`                | Info icon plus link text ("Do you need help?"), `<a>` when `href` is set                          |
| `Modal`                   | Dialog shell: title, children, footer, Esc to close                                               |
| `Money`                   | Token amount through `formatTokenAmount`: `signed`, `colorize`, `size`, `token`                   |
| `PandaBotAvatar`          | Panda disc for chat bubbles                                                                       |
| `PandaMark`               | Brand mark in a squircle (`static/brand/panda.png`)                                               |
| `PanelSizePicker`         | Arbitrator count picker (3 / 7 / 11) bound to `CreateDealArgs.panel_size`                         |
| `ProfileFieldRow`         | Label left, inline-editable value right; Enter / blur commit, Esc cancels                         |
| `Sheet`                   | Rounded card sliding over `BrandHeader`; `overlap`, `paddingClass`                                |
| `Tabs`                    | Generic `<T extends string>` segmented control                                                    |
| `TextInput`               | Themed `<input>`, `variant="default" \| "active"`                                                 |
| `UploadCTA`               | "Choose files" button plus size caption                                                           |
| `VotePicker`              | CC / IC / Abstain radio cards; `excludeAbstain` for withdraw votes                                |

## Components: composed and behaviour-only

| Component            | Use it for                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `AppBottomNav`       | `BottomNav` wired to `/transactions`, `/`, `/profile` with the attention badge                                                  |
| `Auth`               | Behaviour-only, mounted once in the layout: `initAuth`, `watchAuth`, profile bootstrap                                          |
| `AuthGuard`          | Behaviour-only: redirects to `redirectTo` (default `/`) when signed out                                                         |
| `AvatarUploadSheet`  | Take photo / choose from library / use generated avatar; hands the `File` to `onpicked`                                         |
| `DealActions`        | Every deal action for the current user and status: consent, reject, cancel, sign yes / no, accept, reclaim, open / view dispute |
| `DealCard`           | One deal preview: title bar, `DealStatusIcon`, signed amount, countdown, optional `actions` snippet, `href`                     |
| `DealStatusIcon`     | Status badge for a deal                                                                                                         |
| `DealsLoader`        | Behaviour-only, mounted once: polls and listens to `pandameReloadDeals`, refreshes deals and disputes                           |
| `DealsTable`         | Loading / empty / list of `DealCard` with a `filter` prop                                                                       |
| `DevAuth`            | Behaviour-only: `?dev=1` mock user in `npm run dev`                                                                             |
| `DisputeCard`        | One dispute preview: phase badge, fee, countdown                                                                                |
| `DisputePhaseBadge`  | Evidence / Voting / Resolved pill                                                                                               |
| `EvidenceForm`       | Note / URL / hash form for `submit_evidence`                                                                                    |
| `EvidenceList`       | `Evidence[]` with submitter, time, note, link, SHA-256                                                                          |
| `Login`              | Internet Identity sign-in button (`fullWidth`, `size`, `label`)                                                                 |
| `LogoutConfirmModal` | Sign-out confirmation                                                                                                           |
| `ShareLinkModal`     | QR plus copyable share link after creating a tip                                                                                |
| `UserPrincipalBadge` | Short principal plus avatar for `BrandHeader.trailing`; click copies the principal                                              |
| `WalletTokenList`    | One balance row per token (default `SUPPORTED_TOKENS`), per-row loading and error                                               |
| `WelcomeScreen`      | Signed-out hero with the Connect button                                                                                         |

## Icons (`$lib/components/icons/`)

Single `viewBox="0 0 24 24"` stroked paths keyed by `currentColor`:
`BackIcon`, `CheckIcon`, `ChevronDownIcon` **(unused)**, `CloseIcon`,
`FilterIcon`, `HomeIcon`, `InfoIcon`, `PencilIcon`, `PlusIcon`, `ProfileIcon`,
`SwapIcon`. An SVG used in two places becomes a file here; ask before adding
an icon library.

## Services (`$lib/services/`)

| Module                | Exports                                                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `identity.services`   | `getIdentity`, `getIdentityOrAnonymous` (public reads), `safeGetIdentityOnce` (actions; throws when signed out)                                                                                                                                  |
| `auth.services`       | `signIn`, `signOut`, `initAuth`, `watchAuth`, `syncAuth`, `OpenIdProvider`                                                                                                                                                                       |
| `deal.services`       | `createAndFundDeal`, `acceptDeal`, `consentDeal`, `signYes`, `signNo`, `rejectDeal`, `cancelDeal`, `reclaimDeal`, `listMyDeals`, `getDeal`, `getClaimableDeal`, `getReliability`, `preApprovalAmount`, `PreApprovalCall`, `DEFAULT_CREATION_FEE` |
| `dispute.services`    | `openDispute`, `submitEvidence`, `castVote`, `withdrawDispute`, `finalizeDispute`, `getDispute`, `getPublicDispute`, `listMyDisputes`                                                                                                            |
| `arbitrator.services` | `getArbitrator`, `ensureArbitrator`, `listArbitrators`, `deregisterArbitrator`, `adminRegisterArbitrator`, `adminSetArbitratorStatus`                                                                                                            |
| `treasury.services`   | `treasuryBalance`, `treasuryWithdraw` (controller-only)                                                                                                                                                                                          |
| `balance.services`    | `myBalance({ token? })`: the caller's balance on a ledger                                                                                                                                                                                        |
| `profile.services`    | `getProfile`, `upsertProfile`, `ensureProfile` (loads or seeds with a DiceBear avatar), `profileIsEmpty` **(unused)**                                                                                                                            |

## API facades, canisters, actors, providers

| Module                                 | Purpose                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `$lib/api/escrow.api`                  | One function per escrow endpoint, `({ identity, ...args })`               |
| `$lib/api/icrc-ledger.api`             | `transfer`, `approve`, `transactionFee`, `balance` for any ICRC ledger ID |
| `$lib/api/profiles.api`                | `getProfile`, `setProfile` on the profiles canister                       |
| `$lib/canisters/escrow.canister`       | `EscrowCanister` (`Canister<S>`) and `EscrowCanisterError`                |
| `$lib/canisters/profiles.canister`     | `ProfilesCanister`                                                        |
| `$lib/actors/agents.ic`                | `getAgent`: one cached agent per identity                                 |
| `$lib/providers/auth-client.providers` | `AuthClientProvider.getInstance()`: the only `AuthClient`                 |

## Stores (`$lib/stores/`) and derived (`$lib/derived/`)

| Module               | Exports                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `user.store`         | `userStore`: `User \| null \| undefined`                                                                                         |
| `i18n.store`         | `i18n` (`$i18n.*`, `init`, `switchLang`), `I18nStore`                                                                            |
| `deals.store`        | `dealsStore`: `set`, `upsert`, `remove`, `reset`                                                                                 |
| `disputes.store`     | `disputesStore`: `set`, `upsert`, `remove`, `reset`                                                                              |
| `profile.store`      | `profileStore`: `set`, `reset`                                                                                                   |
| `arbitrator.store`   | `arbitratorStore`: `set`, `reset` (`null` means not an arbitrator)                                                               |
| `balance.store`      | `balanceStore` **(unused)**                                                                                                      |
| `user.derived`       | `userSignedIn`, `userNotSignedIn`, `userPrincipalText`, `userPrincipalShort`                                                     |
| `deals.derived`      | `dealsLoaded`, `dealsCount`, `activeDeals`, `settledDeals`, `refundedDeals`, `cancelledDeals`, `dealsAttentionCount` (nav badge) |
| `disputes.derived`   | `disputesLoaded`, `disputesCount`, `openDisputes`, `resolvedDisputes`                                                            |
| `profile.derived`    | `profileLoaded`, `profileDisplayName`                                                                                            |
| `arbitrator.derived` | `arbitratorLoaded`, `isArbitrator`, `isActiveArbitrator`                                                                         |

## Constants (`$lib/constants/`)

| Module                | Exports                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app.constants`       | `REPLICA_HOST`, `ZERO`, `*_IN_MS` and `*_IN_NANOSECONDS` scales, `II_MAX_TIME_TO_LIVE_NS`, `II_WINDOW_FEATURES`                                                                                 |
| `canisters.constants` | `ESCROW_CANISTER_ID` (env override `VITE_ESCROW_CANISTER_ID`), `profilesCanisterId()` (from the mapping or `VITE_PROFILES_CANISTER_ID`), `ICP_LEDGER_CANISTER_ID`, `TESTICP_LEDGER_CANISTER_ID` |
| `tokens.constants`    | `ICP_TOKEN`, `TESTICP_TOKEN`, `SETTLEMENT_TOKEN`, `SUPPORTED_TOKENS`                                                                                                                            |
| `routes.constants`    | `CLAIM_ROUTE`, `SHARE_URL`                                                                                                                                                                      |
| `dispute.constants`   | `PANEL_SIZE_FAST`, `PANEL_SIZE_FAIR`, `PANEL_SIZE_SLOW`, `PANEL_SIZE_DEFAULT`                                                                                                                   |

Canister IDs for deployed canisters are in
[`.icp/data/mappings/ic.ids.json`](../../../.icp/data/mappings/ic.ids.json);
`WEEK_IN_MS` is **(unused)**.

## Enums (`$lib/enums/`)

| Module        | Exports                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deal-status` | `DealStatuses`, `DealStatusName`, `TERMINAL_DEAL_STATUSES`, `SETTLED_DEAL_STATUSES`, `REFUNDED_DEAL_STATUSES`, `ConsentStates`, `SignatureStates` |
| `dispute`     | `DisputePhases`, `Votes`, `WITHDRAW_VOTES` **(unused)**, `DisputeOutcomes` and their `*Name` types                                                |
| `arbitrator`  | `ArbitratorStatuses`, `ArbitratorStatusName`, `ELIGIBLE_ARBITRATOR_STATUSES`                                                                      |

## Utils (`$lib/utils/`)

| Module               | Exports                                                                                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format.utils`       | `formatTokenAmount`, `parseTokenAmount`, `nsToDate`, `msToNs`, `shortPrincipal`                                                                                                        |
| `variant.utils`      | `variantKey`: the discriminator of a Candid variant                                                                                                                                    |
| `deal.utils`         | `dealStatus`, `consentState`, `signatureState`, `isTerminal`, `isExpired`, `sideOf`, `isFullyConsented` **(unused)**                                                                   |
| `dispute.utils`      | `disputePhase`, `phaseName`, `voteName`, `outcomeName`, `tallyOf`, `withdrawnVote`, `isOnPanel`, `myVote`, `VOTE_CC` / `VOTE_IC` / `VOTE_ABSTAIN`, `voteFromName`, `isSettlingOutcome` |
| `arbitrator.utils`   | `arbitratorStatus`, `statusName`, `statusFromName`, `arbitratorScore`                                                                                                                  |
| `escrow-error.utils` | `friendlyEscrowError(err, $i18n, token?)`: canister error to translated copy                                                                                                           |
| `events.utils`       | `emit({ message, detail? })` for typed project events                                                                                                                                  |
| `storage.utils`      | `get`, `set`, `del` over `localStorage`, browser-safe                                                                                                                                  |
| `clipboard.utils`    | `copyToClipboard(text)`: returns `true` / `false`; the caller owns the feedback                                                                                                        |
| `image.utils`        | `fileToAvatarDataUrl`, `AvatarPipelineError`, `MAX_AVATAR_DATA_URL_BYTES`, `AvatarPipelineOptions`                                                                                     |
| `avatar.utils`       | `defaultAvatarUrlForPrincipal`, `dicebearAvatarUrl` (hash of the principal, never the principal itself)                                                                                |

## Types (`$lib/types/`)

| Module       | Exports                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deal`       | `Deal`, `ClaimableDeal`, `DealError`, `DealStatusKey`, `ConsentKey`, `SignatureKey`, `DealSide`, `DealFilter`                                     |
| `dispute`    | `Dispute`, `PublicDispute`, `DisputeConfig`, `DisputeTally`, `DisputeOutcome`, `DisputePhase`, `Vote`, `Evidence`, `PanelMember`, `DisputeFilter` |
| `arbitrator` | `Arbitrator`, `ArbitratorStatus`                                                                                                                  |
| `profile`    | `UserProfile`, `emptyProfile`                                                                                                                     |
| `token`      | `Token`                                                                                                                                           |
| `user`       | `User`, `UserOption`                                                                                                                              |
| `canister`   | `CanisterIdTextSchema`, `CanisterIdText`, `CreateCanisterOptions<T>`                                                                              |
| `languages`  | `Languages`                                                                                                                                       |
| `i18n.d.ts`  | **Generated** by `npm run i18n`                                                                                                                   |

## Env and i18n

- `$lib/env/app.env`: `isDev`, `isProd`, `isSkylab` (a production build
  deployed to the local network via `--mode skylab`).
- `$lib/i18n/en.json`: the only locale; recipe in
  [`workflows/i18n.md`](./workflows/i18n.md).
