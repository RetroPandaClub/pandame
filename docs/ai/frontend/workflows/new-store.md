# Workflow: Add a new store / derived store

Use this when you need cross-component reactive state that isn't covered
by a simple component-local `$state` rune.

## When to add a store vs use runes

| Situation                                      | Tool                                 |
| ---------------------------------------------- | ------------------------------------ |
| Component-local mutable value                  | `$state`                             |
| Component-local computed value                 | `$derived` / `$derived.by`           |
| Side-effect bound to component lifecycle       | `$effect` / `onMount`                |
| Value passed to ≤ 2 children in the same view  | Plain props / snippets               |
| Value shared **across components / pages**     | `*.store.ts` under `$lib/stores/`    |
| Computed value derived from one or more stores | `*.derived.ts` under `$lib/derived/` |

## Steps — adding a new `*.store.ts`

1. **Search first.** `Grep` `$lib/stores/` for a near-fit. Pandame's
   stores today are `user.store.ts` and `i18n.store.ts` — extend one of
   them if it's a related concern (e.g. another auth-derived value goes
   on `user.store`).
2. **Pick the name.** `<concept>.store.ts` (kebab-case, lowercase). The
   exported store name follows `camelCase` and ends in `Store` —
   `userStore`, `i18nStore`. Keep both names in sync.
3. **Pick the shape.** Default to `writable<T | null | undefined>` for an
   async-loaded value, `writable<T>(seed)` for an always-present value.
   Use `readable` only if the store is genuinely never set from outside.
4. **Initial value semantics.**
   - `undefined` → not yet loaded.
   - `null` → loaded, no value (e.g. signed-out user).
   - `T` → loaded value.

   Encode this convention in your derived predicates and tests, so the
   rest of the app can rely on it.

5. **Add the file.** Example shape:

   ```ts
   import type { User } from '$lib/types/user';
   import { writable } from 'svelte/store';

   export const userStore = writable<User | null | undefined>(undefined);
   ```

6. **Add a derived store** if other components need a computed view —
   `$lib/derived/<concept>.derived.ts`:

   ```ts
   import { userStore } from '$lib/stores/user.store';
   import { isNullish, nonNullish } from '@dfinity/utils';
   import { derived } from 'svelte/store';

   export const userSignedIn = derived(userStore, (user) => nonNullish(user));
   export const userNotSignedIn = derived(userStore, (user) => isNullish(user));
   ```

7. **Tests.** Stores with non-trivial logic (computation, persistence,
   cross-store derivation) need a `*.spec.ts`. Pure passthroughs don't.
   See [`../testing.md`](../testing.md).
8. **Catalog update** — add a row to
   [`../reusability.md`](../reusability.md#stores--derived). This is the
   [meta-update rule](../../governance.md#meta-update-rule).
9. **Run quality gates** (`npm run quality && npm run check && npm run test -- --run`).

## Steps — adding a new `*.derived.ts`

1. **Source store(s) must exist already.** Don't create a derived store
   that wraps a value still held in component-local `$state` — promote
   the source to a real store first.
2. **Co-locate by domain.** A derived value that fans out from
   `user.store` lives in `user.derived.ts`. A new domain gets a new file.
3. **Name like a question or predicate.** `userSignedIn`,
   `activeLanguage`, `noteCount`. Avoid generic names like `data` or
   `value`.
4. **Keep it pure.** No I/O inside `derived(...)`. If you need to fetch
   when the source changes, do it in a service / `$effect` and write to
   another store — not in the derived callback.
5. **Catalog + tests** — same as above.

## Anti-patterns (do not do these)

- Mirroring a `Doc<T>` from Juno into a store just to "have it
  available". Components that need it can call `listDocs` / `getDoc`
  directly today; only promote to a store when ≥ 2 components share
  exactly the same shape.
- Sprinkling `derived(...)` calls inside components. If the same
  computation appears in two places, extract it.
- Using a store for transient form state — that's a `$state` rune.
- Subscribing manually with `$store_name.subscribe(...)` inside a
  component — use the `$store` shorthand.
- Storing functions in a store — pass them as props or import them.
