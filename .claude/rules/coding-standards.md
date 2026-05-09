# Coding Standards (Claude quick-reference)

> **Authoritative sources:**
>
> - Folder taxonomy + naming: [`docs/ai/frontend/structure.md`](../../docs/ai/frontend/structure.md)
> - Patterns: [`docs/ai/frontend/stack-and-patterns.md`](../../docs/ai/frontend/stack-and-patterns.md)
> - Reusability catalog: [`docs/ai/frontend/reusability.md`](../../docs/ai/frontend/reusability.md)
> - 10 commandments: [`AGENTS.md`](../../AGENTS.md#2-the-10-commandments-read-before-every-change)
>
> This card is a Claude-only summary. If it disagrees with the docs
> above, the docs above win.

## Code philosophy

- **Idiomatic.** Write code that is native to the framework / language used.
- **DRY.** Aim for zero code duplication. Extract shared logic into utility
  functions / shared components.
- **Modularity.** Components are small, focused, decoupled.
- **Component reuse:** prioritise reusing components from
  `$lib/components/` (`Button`, `Modal`, `Backdrop`, `Background`, …) —
  see the catalog in
  [`reusability.md`](../../docs/ai/frontend/reusability.md).
- **Theme variables:** use the lavender-blue palette + base colours from
  the `@theme` block in [`src/app.css`](../../src/app.css) via Tailwind
  utilities (`bg-lavender-blue-500`, `text-lavender-blue-400`, …) —
  never hard-coded hex.
- **State management:** for cross-view state, follow the patterns in
  `$lib/stores/` and `$lib/derived/`.
- **File size:** avoid gigantic files. If a component grows past ~300
  lines or starts mixing concerns, split it.
- **Coherence:** keep style, pattern, and logic consistent across the
  codebase.

## File naming & namespacing

### Svelte components

- Convention: `PascalCase.svelte` (e.g. `Modal.svelte`).
- Location: flat under `$lib/components/`. Don't introduce a feature
  folder for a single component.

### Logical files (TypeScript)

Use **kebab-case** (or single-word) with a functional dot-suffix:

- **Stores:** `name.store.ts`
- **Derived:** `name.derived.ts`
- **Utils:** `name.utils.ts` (+ colocated `name.utils.spec.ts`)
- **Types:** `name.ts` in `$lib/types/`

## Documentation & testing

- Every method / function should have a clear docstring when its name
  isn't enough.
- Documentation updates ride along with the code they describe — see the
  [meta-update rule](../../docs/ai/governance.md#meta-update-rule).
- Vitest is wired and runs in CI — see
  [`docs/ai/frontend/testing.md`](../../docs/ai/frontend/testing.md).
  Pure helpers and stores with logic need a `*.spec.ts`.

## Compliance

- Run `npm run format` and `npm run lint` before completing tasks.
- Keep the eslint disallowed list intact: no relative parent imports
  under `src/**`, missing `each` keys, untyped any.
- `console.log` is banned (only `console.warn` / `console.error`
  allowed by eslint).

## Naming conventions

- **Terminology:** keep names consistent with the existing inventory
  (`note`, `image`, `user`, `i18n`).
- **Booleans:** prefer affirmative names (`isOpen`, `hasFooter`,
  `userSignedIn`).

## Identity & auth

- The single subscription to `onAuthStateChange` lives in
  [`Auth.svelte`](../../src/lib/components/Auth.svelte). Other components
  read [`userStore`](../../src/lib/stores/user.store.ts) or the
  [`userSignedIn` / `userNotSignedIn`](../../src/lib/derived/user.derived.ts)
  derived stores — never re-subscribe.
- `signIn` requires the provider object: `signIn({ internet_identity: {} })`.
- `signOut` accepts `SignOutOptions` — wrap it in an arrow function when
  passing to `onclick`: `onclick={() => signOut()}`.

## Routing

- Pandame is a **single-route SPA** (`+page.svelte` mounts everything).
  Don't add new SvelteKit routes — mount new views as components inside
  the existing page.
- `+layout.ts` sets `ssr = false` and `prerender = false` so
  `adapter-static` emits a SPA fallback. Don't change those flags
  without a deliberate reason.
