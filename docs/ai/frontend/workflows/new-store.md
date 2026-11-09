# Workflow: add a store or a derived store

| Situation                                | Use                                                   |
| ---------------------------------------- | ----------------------------------------------------- |
| State inside one component               | `$state` / `$derived`                                 |
| Passed to a child or two                 | Props or snippets                                     |
| I/O bound to a component's life          | `$effect`                                             |
| Shared across components or routes       | `$lib/stores/<concept>.store.ts`                      |
| Computed from one or more stores         | `$lib/derived/<concept>.derived.ts`                   |
| Refreshed on a cadence and after actions | A behaviour-only loader component, like `DealsLoader` |

## A store

1. **Search** the [catalog](../reusability.md): deals, disputes, profile,
   arbitrator, user, i18n already exist. A related value extends one of them.
2. **Name:** `<concept>.store.ts` exporting `<concept>Store`.
3. **Shape:** for loaded data, a factory over `writable<T | undefined>` that
   exposes intent methods, as
   [`deals.store.ts`](../../../../src/lib/stores/deals.store.ts) does
   (`set`, `upsert`, `remove`, `reset`). `undefined` means not loaded, `null`
   loaded and empty.
4. **Writers:** services write the store after a canister call; components
   read it. Reset it on sign-out where `DealsLoader` / `Auth` already do.
5. **Tests** if it has logic; **catalog** row; **gates**.

## A derived store

1. Its sources are stores already; promote component state first if not.
2. It lives in the file of its domain (`deals.derived.ts` for deals).
3. Name it as a predicate or a noun: `userSignedIn`, `openDisputes`,
   `dealsAttentionCount`.
4. Pure: no I/O in the callback. Model:
   [`deals.derived.ts`](../../../../src/lib/derived/deals.derived.ts).
5. Tests, catalog row, gates.

## Do not

- Mirror canister data into a store just to have it around.
- Repeat the same `derived(...)` in two components.
- Keep form state in a store, or functions in a store.
- `.subscribe()` by hand in a component; use `$store`.
