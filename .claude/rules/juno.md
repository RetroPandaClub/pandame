# Juno Integration (Claude quick-reference)

> **Authoritative sources:**
>
> - Frontend stack + Juno usage: [`docs/ai/frontend/stack-and-patterns.md#juno-usage`](../../docs/ai/frontend/stack-and-patterns.md#juno-usage)
> - Local deployment runbook: [`.agents/workflows/deployment.md`](../../.agents/workflows/deployment.md)
> - External docs: [Juno LLM Documentation](https://juno.build/llms-full.txt)
>
> This card is a Claude-only summary. If it disagrees with the docs
> above, the docs above win.

## Overview

Pandame uses `@junobuild/core` for the FE auth + datastore client and
ships **no satellite serverless code** — all data lives in the default
Juno satellite container. The FE talks to the satellite directly.

## Key SDK functions (`@junobuild/core`)

- **Initialization:** `initSatellite({ workers: { auth: true } })`
  (called exactly once in `src/routes/+layout.svelte`'s `$effect`).
- **Auth:** `signIn({ internet_identity: {} })`, `signOut()`,
  `onAuthStateChange()`. Subscribe to `onAuthStateChange` exactly once,
  inside [`Auth.svelte`](../../src/lib/components/Auth.svelte).
- **Datastore:** `setDoc()`, `getDoc()`, `listDocs()`, `deleteDoc()`.
- **Storage:** `uploadFile()`, `deleteAsset()`.

> [!IMPORTANT]
> `signIn` requires the provider object — `signIn()` with no arguments
> is a TypeScript error in `@junobuild/core` 5.x. `signOut` accepts
> `SignOutOptions`, so wrap it in an arrow function when binding to
> `onclick`: `onclick={() => signOut()}`.

## Satellite configuration

- **Production satellite:** `wqhtf-fqaaa-aaaal-amssq-cai`
- **Orbiter (analytics):** `gfpjj-5iaaa-aaaal-amr4a-cai`
- **Config:** [`juno.config.ts`](../../juno.config.ts) (production) +
  [`juno.dev.config.ts`](../../juno.dev.config.ts) (local emulator
  collections).

## Local development

- **Emulator:** `juno dev start` (requires Docker).
- **Vite plugin:** `@junobuild/vite-plugin` is wired in
  [`vite.config.ts`](../../vite.config.ts) for env-var injection.
- **Tailwind v4:** the Vite plugin runs alongside `@tailwindcss/vite` —
  don't reorder the `plugins` array.

> [!IMPORTANT]
> Do **NOT** run `dfx start`. The Juno emulator is the only local
> replica.

## Data collections

Two collections exist today (defined in
[`juno.dev.config.ts`](../../juno.dev.config.ts)):

| Collection | Type      | Purpose                                                |
| ---------- | --------- | ------------------------------------------------------ |
| `notes`    | datastore | One doc per note. Shape lives in `$lib/types/note.ts`. |
| `images`   | storage   | Image assets attached to notes.                        |

Both use `read: 'managed'` + `write: 'managed'` (= owner only). Use the
literal collection name (`'notes'`, `'images'`) in calls until a central
`Collection` enum is justified.

If you add a new collection, edit
[`juno.dev.config.ts`](../../juno.dev.config.ts) and document the
production deployment update in the PR.

## Best practices

- **Client-side only.** SSR is disabled (`+layout.ts: ssr = false`); FE
  logic lives in components / stores.
- **Auth guards.** Read auth state from
  [`userSignedIn`](../../src/lib/derived/user.derived.ts) before calling
  authenticated APIs (`setDoc`, `deleteDoc`, `uploadFile`,
  `deleteAsset`).
- **Post-install.** Auth workers are synced via `npm run postinstall`
  to `./static/workers`. Don't hand-edit those files.
- **Custom DOM events.** `junoSignOutAuthTimer` fires when the auth
  session expires; `junoExampleReload` is the project's manual refresh
  signal. Both are typed in
  [`src/custom-events.d.ts`](../../src/custom-events.d.ts).
