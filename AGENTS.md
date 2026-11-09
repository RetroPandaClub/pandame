# AGENTS.md

Entry point for every AI coding agent in this repository (Claude Code, Cursor,
Codex, Copilot, Aider, opencode and the rest). Read it first, then only the
page the table in section 5 sends you to. Everything deeper lives in
[`docs/ai/`](./docs/ai/README.md).

## 1. What this repo is

PandaMe is the mobile-first SvelteKit frontend for the standalone **Escrow**
Rust canister ([`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow),
locally `../escrow/`, mainnet `umxj5-niaaa-aaaae-af2sq-cai`). Users create
deals (tips and two-party agreements), consent, settle, and open disputes that
a panel of arbitrators votes on. The escrow logic is upstream; this repo talks
to it through generated `@icp-sdk/bindgen` bindings.

This repo also owns one small Rust canister, **profiles** (`src/profiles/`),
that stores the editable user profile, and the asset canister that hosts the
built app (`wqhtf-fqaaa-aaaal-amssq-cai`). Both are deployed with `icp`
(see [`icp.yaml`](./icp.yaml)).

## 2. Commands

| Command                                                       | What it does                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`                                                 | Vite dev server on `:5173` (`/api` proxied to the local network on `:5987`)    |
| `npm run build`                                               | `tsc --noEmit` + `vite build` into `build/`                                    |
| `npm run format` / `npm run lint`                             | prettier + eslint, write / check                                               |
| `npm run quality`                                             | `format` then `lint`                                                           |
| `npm run check`                                               | `svelte-check`                                                                 |
| `npm run test -- --run`                                       | Vitest, single pass (what CI runs)                                             |
| `npm run e2e`                                                 | Playwright across desktop, mobile and tablet projects                          |
| `npm run i18n`                                                | Regenerate `src/lib/types/i18n.d.ts` from `src/lib/i18n/en.json`               |
| `npm run did`                                                 | Re-download the pinned `escrow.did` and regenerate `src/declarations/**`       |
| `npx icp network start -d` · `npm run dev:setup` · `deploy:*` | Local network and deploys, see [deployment](./.agents/workflows/deployment.md) |
| `cargo clippy --target wasm32-unknown-unknown` · `cargo fmt`  | Profiles canister gates (CI `canister` job)                                    |

Never run `dfx start`: [`dfx.json`](./dfx.json) points its `local` network at
the `icp` network's gateway on port 5987 (dfx is only used to deploy the
upstream escrow there), and a second replica breaks the `/api` proxy.

## 3. Layout

```
src/
├── routes/          SvelteKit pages (SPA: ssr=false, prerender=false)
├── lib/             App code, closed taxonomy: actors api canisters components
│                    constants derived enums env i18n providers services stores
│                    types utils
├── declarations/    GENERATED Candid bindings (escrow, profiles). Never hand-edit.
├── profiles/        Rust profiles canister (one crate, workspace member)
├── app.css          Tailwind v4 theme tokens (the only place colours live)
└── app.html         Shell, <html data-theme="light">
scripts/             Bindings pipeline, i18n generator, local-dev helpers
e2e/                 Playwright specs
docs/ai/             Agent docs (this file is the entry)
```

Full taxonomy: [`docs/ai/frontend/structure.md`](./docs/ai/frontend/structure.md).

## 4. The standard, and what this repo adds

The universal rules live in one place:
**[officina `standards/code.md`](https://github.com/AntonioVentilii/officina/blob/main/standards/code.md)**.
Read it; this repo does not repeat it. What PandaMe adds on top:

1. **Layering.** Component → `$lib/services/*.services.ts` → `$lib/api/*.api.ts`
   → `$lib/canisters/*.canister.ts` → `$lib/actors/agents.ic.ts`. Components
   and routes never call a canister, the agent or a ledger directly, and never
   import `$declarations`; types reach them through `$lib/types/`.
2. **Auth in one place.** `initAuth` / `watchAuth` run only in
   [`Auth.svelte`](./src/lib/components/Auth.svelte). Everything else reads
   `userStore` or `userSignedIn`. Services take identity from
   [`identity.services.ts`](./src/lib/services/identity.services.ts):
   `safeGetIdentityOnce` for actions, `getIdentityOrAnonymous` for public reads.
3. **Theme tokens only.** No raw colour anywhere: no `bg-[#hex]`, no `rgba()`
   in markup, no `text-white` / `bg-black`, no `dark:` variants, no inline
   colour styles. Missing colour or coloured shadow: add a token to `@theme`
   in [`src/app.css`](./src/app.css) and mirror it in `[data-theme='light']`.
4. **i18n.** Every user-visible string is a `$i18n.*` key from
   `src/lib/i18n/en.json`, then `npm run i18n`.
5. **a11y.** Real `<button>` / `<a>`, labelled inputs, `aria-hidden` on
   decorative icons. See [`a11y.md`](./docs/ai/frontend/a11y.md).
6. **Terminology.** `deal`, `payer`, `recipient`, `claim`, `consent`, `dispute`,
   `arbitrator`, `profile`. Time values end in `_ms` (app logic) or `_ns`
   (canister fields).
7. **Aliases only.** No relative parent imports under `src/**` (`$lib`,
   `$routes`, `$declarations`, `$root`); eslint enforces it.
8. **No transient references in `src/**`.** No design-tool node ids, release
   tags, RFC / PR / issue numbers or commit hashes in comments. Stable API
   names (`consent_deal`, `DealStatus::Funded`) are fine; operational pins
   such as `ESCROW_REF` in `scripts/import-candid.sh` are config, not prose.
9. **Terse comments.** One line above the binding by default; a `/** */`
   block only for a real foot-gun or trade-off. No narration, no JSDoc on
   self-evident exports.
10. **Generated is generated.** `src/declarations/**` and
    `src/lib/types/i18n.d.ts` change only through `npm run did` / the CI
    `canister` job / `npm run i18n`, committed with the code that uses them.
11. **Upstream first.** A change to the escrow API starts in
    `AntonioVentilii/escrow`, then `npm run did` here.
12. **Ask before** a new route, a new dependency, a new top-level folder, or
    touching a protected path ([governance](./docs/ai/governance.md#protected-and-generated-paths)).
13. **History is append-only.** No force-push, no amend of pushed commits, no
    rebase of a PR branch unless the user names that operation
    ([details](./docs/ai/pr-and-ci.md#6-updating-an-existing-pr)).

## 5. You are about to..., read first

| You are about to...                            | Read first                                                                                                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Touch anything under `src/lib` or `src/routes` | [`frontend/README.md`](./docs/ai/frontend/README.md)                                                                                                              |
| Add or move a file                             | [`frontend/structure.md`](./docs/ai/frontend/structure.md)                                                                                                        |
| Write a component, store, service or call      | [`frontend/stack-and-patterns.md`](./docs/ai/frontend/stack-and-patterns.md)                                                                                      |
| Create anything new (UI, util, constant)       | [`frontend/reusability.md`](./docs/ai/frontend/reusability.md)                                                                                                    |
| Add a component                                | [`workflows/new-component.md`](./docs/ai/frontend/workflows/new-component.md)                                                                                     |
| Wire a new escrow endpoint or a service        | [`workflows/new-service.md`](./docs/ai/frontend/workflows/new-service.md)                                                                                         |
| Add a store or derived store                   | [`workflows/new-store.md`](./docs/ai/frontend/workflows/new-store.md)                                                                                             |
| Add or rename copy                             | [`workflows/i18n.md`](./docs/ai/frontend/workflows/i18n.md)                                                                                                       |
| Bump the escrow contract                       | [`workflows/regenerate-bindings.md`](./docs/ai/frontend/workflows/regenerate-bindings.md)                                                                         |
| Write or change tests                          | [`frontend/testing.md`](./docs/ai/frontend/testing.md)                                                                                                            |
| Touch the profiles canister                    | [`backend/README.md`](./docs/ai/backend/README.md)                                                                                                                |
| Run locally or deploy                          | [`.agents/workflows/deployment.md`](./.agents/workflows/deployment.md)                                                                                            |
| Open a PR                                      | [`pr-and-ci.md`](./docs/ai/pr-and-ci.md)                                                                                                                          |
| Edit these docs or a protected path            | [`governance.md`](./docs/ai/governance.md)                                                                                                                        |
| Understand the deal or dispute lifecycle       | [escrow README](https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md), [TIPS.md](https://github.com/AntonioVentilii/escrow/blob/main/TIPS.md) |

## 6. Truth hierarchy

Highest wins: **code** (`src/**`, `scripts/**`), then **CI**
(`.github/workflows/**`), then **CODEOWNERS**, then **`docs/ai/**`**, then
**this file**, then tool layers (`CLAUDE.md`, `.cursor/rules/`,
`.github/copilot-instructions.md`). On a contradiction, stop and ask.

## 7. Meta-update rule

A PR that adds a pattern, a shared piece, a naming convention, a policy or a
workflow updates the matching `docs/ai/**` page in the same PR. The map of
which page owns what is in
[`governance.md`](./docs/ai/governance.md#meta-update-rule). A new tool gets a
pointer file of a few lines that links here; it never copies these rules.
