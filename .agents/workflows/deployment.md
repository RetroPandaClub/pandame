---
description: local + production deployment workflow for the PandaMe SvelteKit app
---

PandaMe is a **frontend-only** repo. The on-chain Escrow Rust canister
lives at [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow)
(checked out locally as `../escrow/`; mainnet
`umxj5-niaaa-aaaae-af2sq-cai`); pandame's only deploy target is the Juno
satellite that hosts the static SvelteKit build.

This workflow covers the two flavours of deploy that pandame supports:

- **Local emulator** — for iterating against a fresh Juno satellite
  container on your machine. The escrow canister is still called on
  mainnet (the agent dials `window.location.origin`, which `juno dev`
  proxies).
- **Production** — push the built static site to the live satellite via
  GitHub Actions or the `juno` CLI.

> [!IMPORTANT]
> Do **NOT** run `dfx start`. The Juno emulator is the only local replica
> pandame supports — running `dfx start` alongside it causes port +
> CORS conflicts.

## Local emulator

1. Stop any other replicas / emulators on your machine.
2. Start the Juno emulator (requires Docker):

   ```bash
   juno dev start
   ```

3. In a new terminal, start the SvelteKit dev server:

   ```bash
   npm run dev
   ```

   The app boots at <http://localhost:5173>. The emulator-side admin
   console is at <http://localhost:5866>.

4. PandaMe provisions **one Juno datastore collection** locally —
   `profiles` — for editable user metadata (see
   [`juno.dev.config.ts`](../../juno.dev.config.ts):
   `memory: 'stable'`, `read: 'public'`, `write: 'private'`). All
   escrow / ledger state lives in the upstream canisters on mainnet
   (`umxj5-niaaa-aaaae-af2sq-cai` for escrow,
   `ryjl3-tyaaa-aaaaa-aaaba-cai` for ICP). When you ship a new
   collection, add the matching rule block here and update
   [`Collection`](../../src/lib/constants/collections.constants.ts).

5. (Optional) regenerate the candid bindings from upstream
   [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow)
   (locally `../escrow/`) before starting:

   ```bash
   npm run did
   ```

   See [`docs/ai/frontend/workflows/regenerate-bindings.md`](../../docs/ai/frontend/workflows/regenerate-bindings.md).

6. (Optional) Run the Vitest unit suite or Playwright E2E:

   ```bash
   npm run test -- --run
   npm run e2e
   ```

## Production deploy — via GitHub Actions

The [`deploy.yml`](../../.github/workflows/deploy.yml) workflow runs on
every push to `main` and on `v*` tags:

1. `actions/checkout@v6.0.2` checks out the ref.
2. The `prepare` composite action installs Node from `.node-version`,
   runs `npm ci` and `npm run prepare`.
3. `npm run build` produces the static site under `./build/`.
4. `junobuild/juno-action` deploys via `juno deploy` using the
   `JUNO_TOKEN` repository secret.

Trigger a deploy by:

- Pushing to `main` (`git push origin main`), or
- Tagging a release (`git tag v0.1.0 && git push origin v0.1.0`), or
- Re-running the workflow manually from the **Actions** tab
  (`workflow_dispatch`).

## Production deploy — manually

If CI is unavailable:

1. Ensure you have the Juno CLI installed and logged in:

   ```bash
   juno login
   ```

2. Build and deploy:

   ```bash
   npm run build
   juno deploy
   ```

   The satellite ID + hosting source are pinned in
   [`juno.config.ts`](../../juno.config.ts):
   - Satellite: `wqhtf-fqaaa-aaaal-amssq-cai`
   - Hosting source: `build/`

## Troubleshooting

- **Sign-in silently fails locally.** Run `npm run postinstall:copy-auth`
  to re-sync `static/workers/` from `node_modules/@junobuild/core/dist/workers/`.
- **`adapter-static` build warning about `index.html`.** Should be gone
  since `+layout.ts` sets `prerender = false`. If it reappears, somebody
  re-enabled prerender — revert.
- **CORS / 404 on the emulator.** Make sure `dfx start` is not running.
  Stop everything, then `juno dev start` only.

## See also

- [`docs/ai/pr-and-ci.md`](../../docs/ai/pr-and-ci.md) — full CI matrix.
- [`.claude/rules/juno.md`](../../.claude/rules/juno.md) — Juno + escrow
  SDK cheatsheet.
- [`docs/ai/frontend/workflows/regenerate-bindings.md`](../../docs/ai/frontend/workflows/regenerate-bindings.md)
  — re-pull the escrow `.did` after an upstream change.
- [`docs/ai/README.md`](../../docs/ai/README.md) — AI agent docs index.
- [`AntonioVentilii/escrow` upstream README](https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md)
  (locally `../escrow/src/escrow/README.md`) — upstream canister docs
  (deal lifecycle, ICRC-7 NFT views, scaling roadmap).
