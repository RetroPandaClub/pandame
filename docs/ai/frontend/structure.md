# Frontend structure and naming

The taxonomy is **closed**: no new top-level folder under `src/` or
`src/lib/` without asking. New code goes in the folder that already owns the
concern. What lives in each folder today is catalogued in
[`reusability.md`](./reusability.md); this page says where things go.

## `src/`

```
src/
├── app.css              Tailwind v4 entry: @theme tokens, @font-face, light / dark blocks
├── app.html             Shell: viewport, theme-color, <html data-theme="light">, one global <title>
├── app.d.ts             Ambient SvelteKit types
├── custom-events.d.ts   Typed project DOM events (pandameReloadDeals)
├── routes/              Pages (see Routes below)
├── declarations/        GENERATED bindings: escrow/, profiles/, plus _factory.ts, _types.ts, index.ts
├── profiles/            Rust profiles canister, see ../backend/README.md
└── lib/
    ├── actors/          agents.ic.ts: the one shared AgentManager
    ├── api/             *.api.ts: identity-passing facades, one function per endpoint
    ├── canisters/       *.canister.ts: Canister<S> wrappers over the generated IDL
    ├── components/      *.svelte, flat; icons/ holds the icon components
    ├── constants/       *.constants.ts: IDs, tokens, routes, time scales
    ├── derived/         *.derived.ts: derived stores
    ├── enums/           const-object enums and the lists built from them
    ├── env/             app.env.ts: isDev / isProd / isSkylab
    ├── i18n/            en.json, the only locale
    ├── providers/       auth-client.providers.ts: the AuthClient singleton
    ├── services/        *.services.ts: orchestration, identity, store writes, events
    ├── stores/          *.store.ts: writable / readable stores
    ├── types/           app types, re-exports of generated types, generated i18n.d.ts
    └── utils/           *.utils.ts: pure helpers plus colocated *.spec.ts
```

Dependencies point one way:
`routes` → `components` → `services` → `api` → `canisters` → `actors`.
`stores`, `derived`, `utils`, `constants`, `enums`, `types` are leaves any
layer may import. `$declarations` is imported only by `api`, `canisters`,
`services`, `types` and `enums`, never by `components` or `routes`. ESLint
enforces the UI and utils boundaries
([quality gate](../pr-and-ci.md#the-quality-gate-inside-lint)).

## Routes

`+layout.ts` sets `ssr = false` and `prerender = false`; `adapter-static`
emits an `index.html` fallback so deep links work.
[`+layout.svelte`](../../../src/routes/+layout.svelte) is the 420 px phone
frame and mounts `Auth`, `DevAuth` and `DealsLoader` once.

| Route                      | Access | Page                                                                                                |
| -------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| `/`                        | both   | `WelcomeScreen` when signed out, the chat wizard when signed in                                     |
| `/claim/[deal_id]?code=…`  | public | Claim a tip from the QR or share link                                                               |
| `/deals/new`               | auth   | Create a deal (Pay / Receive, panel size, fee summary)                                              |
| `/deals/[deal_id]`         | auth   | Deal detail with `DealActions`                                                                      |
| `/deals/[deal_id]/dispute` | auth   | Open, evidence, vote, withdraw, finalize, outcome                                                   |
| `/history`                 | auth   | All deals with a `FilterChip` (`?filter=`)                                                          |
| `/transactions`            | auth   | Pending / Created / Disputed tabs (`?tab=`)                                                         |
| `/profile`                 | auth   | Profile, avatar, links to the pages below                                                           |
| `/profile/edit`            | auth   | Edit username, name, surname, avatar                                                                |
| `/profile/wallet`          | auth   | Balances per supported token                                                                        |
| `/profile/arbitrator`      | auth   | Arbitrator profile, assigned disputes, self-deregister (link shown when `$isArbitrator`)            |
| `/profile/admin`           | auth   | Controller-only arbitrator curation and treasury (the canister rejects others with `NotAuthorised`) |

Auth routes start with `<AuthGuard />`. A new route needs a reason and a
question first.

## Naming

| Thing             | Convention                                               | Example                               |
| ----------------- | -------------------------------------------------------- | ------------------------------------- |
| Component file    | `PascalCase.svelte`                                      | `DealCard.svelte`                     |
| Icon              | `icons/<Name>Icon.svelte`                                | `icons/BackIcon.svelte`               |
| TS file           | kebab-case plus a suffix                                 | `escrow-error.utils.ts`               |
| Canister wrapper  | `*.canister.ts`, class `XCanister`                       | `EscrowCanister`                      |
| API facade        | `*.api.ts`                                               | `escrow.api.ts`                       |
| Service           | `*.services.ts`, camelCase verbs                         | `createAndFundDeal`                   |
| Store             | `*.store.ts`, `xStore`                                   | `dealsStore`                          |
| Derived           | `*.derived.ts`, a predicate or noun                      | `userSignedIn`, `openDisputes`        |
| Constants         | `*.constants.ts`, `SCREAMING_SNAKE`                      | `ESCROW_CANISTER_ID`                  |
| Enum              | `enums/<name>.ts`, plural const object plus `XName` type | `DealStatuses`, `DealStatusName`      |
| Type              | `types/<name>.ts`, PascalCase                            | `Deal`, `DealSide`                    |
| Vitest spec       | `*.spec.ts` next to the file                             | `format.utils.spec.ts`                |
| Playwright spec   | `e2e/<flow>.test.ts`                                     | `homepage.test.ts`                    |
| Test id           | `data-tid="kebab-case"`                                  | `data-tid="deal-card"`                |
| Project DOM event | `pandame*`                                               | `pandameReloadDeals`                  |
| Time value        | `_ms` in app logic, `_ns` at the canister boundary       | `expires_at_ns`                       |
| Boolean           | Affirmative                                              | `isOpen`, `hasFooter`, `userSignedIn` |

Cross units with `nsToDate` / `msToNs` from
[`format.utils.ts`](../../../src/lib/utils/format.utils.ts) and the scales in
[`app.constants.ts`](../../../src/lib/constants/app.constants.ts).

## Imports

`import/no-relative-parent-imports` is an error under `src/**`. Aliases
(from [`svelte.config.js`](../../../svelte.config.js)):

| Alias           | Path               |
| --------------- | ------------------ |
| `$lib`          | `src/lib`          |
| `$declarations` | `src/declarations` |
| `$routes`       | `src/routes`       |
| `$root`         | repo root          |

`$satellite` is still declared but points at a folder that no longer exists;
do not use it. The only tolerated relative import is `import '../app.css'` in
`+layout.svelte`, with its inline disable. Imports in `.svelte` files are
alphabetised (`import/order`); `prettier-plugin-organize-imports` sorts TS.

## Where new code goes

1. **A page?** `src/routes/<segment>/+page.svelte` (ask first). Compose
   `BrandHeader` + `Sheet` or a content section + `AppBottomNav`.
2. **UI?** `$lib/components/<Name>.svelte`, after checking the catalog.
3. **An icon?** `$lib/components/icons/<Name>Icon.svelte`.
4. **A new escrow endpoint?** `escrow.canister.ts` method, `escrow.api.ts`
   facade, then a service function; see
   [`workflows/new-service.md`](./workflows/new-service.md).
5. **Logic with I/O, identity or store writes?** `$lib/services/<concern>.services.ts`.
6. **Pure logic?** `$lib/utils/<concern>.utils.ts` with a `*.spec.ts`.
7. **Shared state?** `$lib/stores/` and `$lib/derived/`; see
   [`workflows/new-store.md`](./workflows/new-store.md).
8. **A value, ID, threshold or path used in more than one place?**
   `$lib/constants/<x>.constants.ts`; a closed set of names goes in `$lib/enums/`.
9. **A type?** `$lib/types/<name>.ts`; re-export generated types from there.
10. **Copy?** `src/lib/i18n/en.json`, then `npm run i18n`.
11. **Generated?** Run the generator, never write it by hand.
12. **None of these?** Ask.
