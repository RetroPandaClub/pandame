# Stack & Patterns

Idiomatic patterns for the **SvelteKit 2 + Svelte 5 + TypeScript +
Tailwind v4 + Juno** stack as it lives in this repo. If a pattern here
disagrees with code in `src/`, the code wins (truth hierarchy in
[governance.md](../governance.md)). Update this page in the same PR —
that's the [meta-update rule](../governance.md#meta-update-rule).

## Svelte 5 — runes everywhere

This project is **Svelte 5** and uses runes for new code:

| Use (new code)                                                                                     | Don't use (Svelte 4 style)                    |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Separate `interface Props { … }` + `let { … }: Props = $props()` (see [Props shape](#props-shape)) | `export let foo`                              |
| `let count = $state(0)`                                                                            | plain `let` for component-local reactive vars |
| `let total = $derived(price * qty)`                                                                | `$: total = price * qty`                      |
| `$effect(() => { /* I/O */ })`                                                                     | side-effect via `$:`                          |
| `<button onclick={fn}>`                                                                            | `on:click`                                    |
| `{#snippet}` + `{@render}`                                                                         | named `<slot>` for new code                   |

### Props shape

Always declare props as a **named `interface Props`** above the
destructuring, declared **inside** the component file. This keeps the
shape easy to read and easy to extend in tests / sibling components:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		highlight?: boolean;
		onSelect?: () => void;
	}

	let { children, highlight = false, onSelect = () => {} }: Props = $props();
</script>
```

Rules:

- One `interface Props` per component, declared at the top of the
  `<script>` after imports.
- Required props first, optional / defaulted ones after.
- Callbacks default to a no-op (`() => {}`) so callers can omit them.
- **Avoid `$bindable`** unless explicitly required. Prefer callback props
  (`onChange`) over two-way bindings.
- Do **not** inline the type literal into `$props()` for new code — use a
  named `interface Props`.

See [`Auth.svelte`](../../../src/lib/components/Auth.svelte) for a real
example.

### Effect hygiene

- Never read state inside an `$effect` and write it back without a guard —
  it loops. Restructure to `$derived` whenever possible.
- Prefer `$derived` over `$effect`. An `$effect` is for I/O (DOM, network,
  storage). Computation belongs in `$derived` / `$derived.by`.

### Stores still exist

Svelte stores (`writable` / `readable` / `derived` from `svelte/store`)
remain the primary cross-route reactive primitive in this repo. The
graph under `$lib/stores/` and `$lib/derived/` is the source of truth
for cross-component state — extend it instead of inventing a parallel
runes-only world.

| Need                                           | Use                                          | Where it lives       |
| ---------------------------------------------- | -------------------------------------------- | -------------------- |
| Component-local mutable value                  | `$state`                                     | Inside the component |
| Component-local computed value                 | `$derived` / `$derived.by`                   | Inside the component |
| Side effect (DOM, network, subscription)       | `$effect` (or `onMount` for true mount work) | Inside the component |
| Value shared by 2+ components in the same page | Pass via props / snippets                    | —                    |
| Value shared across views                      | A Svelte `writable` / `readable` store       | `$lib/stores/`       |
| Computed value across stores                   | `derived(...)` Svelte store                  | `$lib/derived/`      |

## TypeScript

- **No `any`.** Use `unknown` and narrow.
- **No `as unknown as X`** to launder types. Either fix the type, or write
  a narrowing function.
- **No non-null assertion (`!`)** on values that can actually be null —
  use `isNullish` / `nonNullish` from `@dfinity/utils`, optional chaining,
  or an explicit guard with an early return.
- **`@junobuild/core` types** are the source of truth at the datastore
  boundary. Always import `Doc<T>`, `User`, etc. from `@junobuild/core`
  rather than re-declaring them.
- **Discriminated unions** for `Result<T>` flows. Look at the closest
  neighbour and follow the same shape.
- **Type imports**: prefer `import type { … }` for types-only;
  `prettier-plugin-organize-imports` will sort them.

## Juno usage

- **Init.** `initSatellite({ workers: { auth: true } })` runs once in
  `src/routes/+layout.svelte`'s `$effect`. Do not init the satellite from
  any other component.
- **Auth.** Subscribe to `onAuthStateChange` exactly once
  (`Auth.svelte`); push the user into `$lib/stores/user.store.ts`. Other
  components read from the store / derived store, never from
  `onAuthStateChange` directly.
- **Sign-in.** Pandame uses Internet Identity. `signIn` requires the
  provider object: `signIn({ internet_identity: {} })`.
- **Sign-out.** `signOut` accepts a `SignOutOptions` arg, so wrap it in
  an arrow function when binding to `onclick`:
  `onclick={() => signOut()}`.
- **Datastore reads / writes.** Components call `listDocs` / `setDoc` /
  `deleteDoc` / `uploadFile` / `deleteAsset` from `@junobuild/core`
  directly today. If/when the app grows enough that this becomes
  noisy, introduce a `$lib/services/<thing>.services.ts` layer and
  document it here.
- **Collections.** Two collections, defined in
  [`juno.dev.config.ts`](../../../juno.dev.config.ts):
  - `notes` (datastore, managed permissions).
  - `images` (storage, managed permissions).

  Use the literal collection name (`'notes'`, `'images'`) in calls until a
  central enum is justified.

- **Worker assets.** `npm run postinstall` copies
  `@junobuild/core/dist/workers/` into `static/workers/`. Don't hand-edit
  those files.

## Tailwind v4 + design tokens

Pandame migrated to Tailwind v4. There is **no `tailwind.config.ts`**.

- **Theme tokens** live in [`src/app.css`](../../../src/app.css) inside an
  `@theme` block. The lavender-blue palette (`bg-lavender-blue-500`,
  `text-lavender-blue-400`, …), the `JetBrains Mono` `--font-sans`, the
  `--animate-fade` keyframe and the `tall:` custom variant are all defined
  there.
- The block opens with `--color-*: initial;` to clear all default Tailwind
  colour utilities — only the palette enumerated in `@theme` is available
  (plus `inherit` / `transparent` / `current` / `black` / `white`). If you
  need a colour outside the palette, **add it to `@theme`** (and call it
  out in the PR), don't reach for arbitrary `bg-[#hex]`.
- **No raw hex** (`bg-[#0f0]`), no inline `style="color:…"`. Arbitrary
  values are tolerated for non-colour props (`shadow-[5px_5px_0px_rgba(0,0,0,1)]`)
  but prefer a named token when you can.
- **Class order** is auto-sorted by `prettier-plugin-tailwindcss`. Don't
  bikeshed it.
- **Variants & responsive:** prefer Tailwind variants (`md:`, `dark:`,
  `tall:`) over JS branches.

## Routing

- Single-route SvelteKit shell: `src/routes/+page.svelte` mounts `Table`
  and `Modal`. Don't add new `+page.svelte` files unless you have an
  explicit reason; new top-level views are components mounted inside the
  existing page.
- `src/routes/+layout.ts` sets `ssr = false` and `prerender = false`
  (SPA fallback via `adapter-static`).

## i18n

Pandame ships a tiny typed-i18n layer. The runtime store is
[`$lib/stores/i18n.store.ts`](../../../src/lib/stores/i18n.store.ts); the
typed shape is generated into
[`$lib/types/i18n.d.ts`](../../../src/lib/types/i18n.d.ts) by
`npm run i18n` from `src/lib/i18n/<locale>.json`.

- **Add a key:** edit every locale JSON (today `en.json`) → run
  `npm run i18n` → use `$i18n.section.key` in your component.
- **No raw English in components** for new copy — go through `$i18n`.
- See [`workflows/i18n.md`](./workflows/i18n.md) for the full flow.

## Custom DOM events

Juno emits `junoSignOutAuthTimer` and `junoExampleReload` on `window`.
Their typings live in [`src/custom-events.d.ts`](../../../src/custom-events.d.ts)
(augmenting `svelte/elements`). Listen to them with
`<svelte:window onjunoXxx={handler} />` — see
[`Auth.svelte`](../../../src/lib/components/Auth.svelte) and
[`Table.svelte`](../../../src/lib/components/Table.svelte).

If you add a new custom event, declare it in `src/custom-events.d.ts`.

## Performance

- Wrap expensive work in `$derived.by` (cached) or in a `derived(...)`
  Svelte store, not in the render path.
- `{#each items as item, index (item.key)}` with a stable key (eslint
  enforces `svelte/require-each-key`).
- Lazy-load heavy modules with dynamic `import()` inside an `$effect` /
  event handler when they aren't needed on first paint.

## Anti-patterns (do not do these)

- `export let foo` in new code.
- Inline type literal in `$props()` (`let { … }: { … } = $props()`).
- Reactive `$:` statements in new code.
- `$bindable` unless explicitly required by the API.
- Reaching into `document.querySelector` to mutate Svelte-managed DOM.
- Catching an error and silently swallowing it; either propagate, log
  with `console.error`, or surface to the user via UI state.
- Hard-coding strings, hex colours, magic numbers in components.
- Hard-coded English copy for new user-visible text — use `$i18n`.
- "Just one more `any`" — there is no "just one more".
- Adding a wrapper component that only re-exports another component.
- `target="_blank"` without `rel="noopener noreferrer"`.
- `{@html …}` without sanitisation.
- `console.log` left in committed code (eslint allows only `console.warn`
  / `console.error`).
