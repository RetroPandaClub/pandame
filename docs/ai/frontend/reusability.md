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

| Layer                   | Path                            | What goes there                                         |
| ----------------------- | ------------------------------- | ------------------------------------------------------- |
| **Components**          | `$lib/components/`              | All UI components (flat — no feature folders today).    |
| **Cross-cutting utils** | `$lib/utils/<name>.utils.ts`    | Pure helpers usable across components.                  |
| **Stores / derived**    | `$lib/stores/`, `$lib/derived/` | Reactive state shared across views.                     |
| **Types**               | `$lib/types/<name>.ts`          | TypeScript interfaces / types.                          |
| **i18n strings**        | `$lib/i18n/<locale>.json`       | One JSON per locale, regenerated to a typed dictionary. |

## Catalog (current — keep this honest)

> Edit this section in any PR that adds, renames, or removes an entry
> matching one of these buckets.

### Components — `$lib/components/`

| Component    | Use it for                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Auth`       | Auth wrapper that gates children behind a successful sign-in. Wires `onAuthStateChange` once and pushes the user into `userStore`. |
| `Backdrop`   | Full-screen dimmed overlay; pass `spinner={true}` for a centered spinner.                                                          |
| `Background` | Decorative right-side illustration (hidden on `< sm`).                                                                             |
| `Button`     | The themed CTA. Accepts `onclick`, `disabled`, and a snippet child.                                                                |
| `Delete`     | Inline delete control for a `Doc<Note>` — also deletes any attached image asset, then calls `ondeleted`.                           |
| `Footer`     | App footer with brand mark and external links.                                                                                     |
| `Login`      | Internet Identity sign-in CTA (wraps `signIn`).                                                                                    |
| `Logout`     | Sign-out button (wraps `signOut`).                                                                                                 |
| `Modal`      | Modal shell hosting the new-note form (textarea + optional image upload).                                                          |
| `Table`      | Notes list. Subscribes to the `junoExampleReload` custom event for refreshes.                                                      |

If the same shape of component appears twice with only props differing,
extract a primitive instead of duplicating.

### Stores & derived

| Module         | Where           | Purpose                                           |
| -------------- | --------------- | ------------------------------------------------- |
| `user.store`   | `$lib/stores/`  | Authenticated user (`User \| null \| undefined`). |
| `i18n.store`   | `$lib/stores/`  | Active locale + typed dictionary (`$i18n.*`).     |
| `user.derived` | `$lib/derived/` | `userSignedIn` / `userNotSignedIn` predicates.    |

### Utils — `$lib/utils/`

| Util            | Purpose                                                                |
| --------------- | ---------------------------------------------------------------------- |
| `storage.utils` | Typed `get` / `set` / `del` wrappers around `localStorage` (SSR-safe). |

### Types — `$lib/types/`

| Type        | Purpose                                             |
| ----------- | --------------------------------------------------- |
| `note`      | `Note` shape stored in the `notes` Juno collection. |
| `user`      | Re-exports the `@junobuild/core` `User` type.       |
| `languages` | Supported locale codes.                             |
| `i18n.d.ts` | **Generated** by `npm run i18n`. Do not hand-edit.  |

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
is needed (e.g. a `services/` folder once datastore calls outgrow the
components), surface it in the PR description and ask the human owner
before doing it.
