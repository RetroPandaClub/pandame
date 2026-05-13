---
description: local + production deployment workflow for the PandaMe SvelteKit app
---

PandaMe is a **frontend-only** repo. The on-chain Escrow Rust canister
lives at [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow)
(checked out locally as `../escrow/`; mainnet
`umxj5-niaaa-aaaae-af2sq-cai`); pandame's only deploy target is the Juno
satellite that hosts the static SvelteKit build.

This workflow covers the two flavours of deploy that pandame supports:

- **Local emulator** — for iterating against a fresh local IC replica
  on your machine. The Juno emulator is **self-contained** (it does
  not proxy to mainnet), so the upstream escrow canister at
  [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow)
  (checked out as `../escrow/`) needs to be built and deployed into
  the emulator's replica via `dfx --network local`.
- **Production** — push the built static site to the live satellite via
  GitHub Actions or the `juno` CLI.

> [!IMPORTANT]
> Do **NOT** run `dfx start`. Pandame's [`dfx.json`](../../dfx.json)
> wires the `local` network at `http://127.0.0.1:5987` (the Juno
> emulator's gateway) so dfx commands deploy into the emulator's
> replica without standing up a second one. A separate dfx replica on
> port 4943 collides with the emulator and confuses the agent's
> `/api` proxy target.

## Local emulator

1. Stop any other replicas / emulators on your machine.

2. Start the Juno emulator (requires Docker or Podman):

   ```bash
   juno emulator start
   ```

   The IC HTTP gateway is exposed on `http://127.0.0.1:5987`; the
   emulator-side admin console at <http://localhost:5866>.

3. **First run only — deploy the upstream escrow canister into the
   local replica.** Requires the
   [`../escrow/`](../../../escrow/) repo cloned as a sibling and a
   working Rust toolchain (`rustup target add wasm32-unknown-unknown`):

   ```bash
   npm run dev:setup
   ```

   The script runs `cargo build` against `../escrow/` to produce
   `escrow.wasm`, then `dfx deploy escrow --network local` to install
   it in the Juno emulator's replica. It prints the assigned local
   canister ID; add it to `.env.local` (gitignored):

   ```bash
   echo "VITE_ESCROW_CANISTER_ID=<id>" >> .env.local
   ```

4. **Apply the Juno satellite config** so the datastore collections
   declared in [`juno.config.ts`](../../juno.config.ts) (under
   `satellite.collections.datastore`) actually exist on the running
   satellite. `juno emulator start` boots an empty satellite — without
   this step every `getDoc` / `setDoc` will trap with
   `juno.collections.error.not_found (Datastore - profiles)`:

   ```bash
   juno config apply --mode development
   ```

   Re-run this command whenever you change the `collections` block in
   `juno.config.ts` (add a new collection, flip a permission, etc.).

5. In a new terminal, start the SvelteKit dev server:

   ```bash
   npm run dev
   ```

   The app boots at <http://localhost:5173>. Vite's `/api/*` proxy
   forwards agent calls to the Juno emulator on port 5987, so the
   browser's agent reaches the local replica via the dev-server
   origin.

6. Once you've signed in with Internet Identity, your wallet starts
   empty. Mint local ICP into it (and into any other test principals)
   via the Juno emulator's faucet endpoint:

   ```bash
   npm run dev:tokens -- <principal>           # 10 ICP (default)
   npm run dev:tokens -- <principal> 25        # 25 ICP
   npm run dev:tokens -- <p1> <p2> <p3> 5      # 5 ICP to each
   ```

   The script ([`scripts/send-tokens.sh`](../../scripts/send-tokens.sh))
   hits `http://localhost:5999/ledger/transfer/`, which mints from the
   anonymous identity (the local ICP ledger's minter on PocketIC).
   Pass `--ledger-id <canister-id>` to target a different ICRC-1
   ledger.

7. PandaMe provisions **one Juno datastore collection** locally —
   `profiles` — for editable user metadata (see the
   `satellite.collections.datastore` block in
   [`juno.config.ts`](../../juno.config.ts):
   `memory: 'stable'`, `read: 'public'`, `write: 'private'`). The
   local satellite ID is pinned in the same file under
   `satellite.ids.development` so the Juno SDK resolves it
   deterministically. The same `collections` block is what
   `juno deploy` pushes to the production satellite, so there is
   only one source of truth. Escrow / ledger state lives in the
   canisters inside the same emulator (locally) or on mainnet (in
   production). When you ship a new datastore collection, add the
   matching rule block to `satellite.collections.datastore` in
   `juno.config.ts`, update
   [`Collection`](../../src/lib/constants/collections.constants.ts),
   and re-run `juno config apply --mode development` against the
   running emulator.

8. (Optional) regenerate the candid bindings from upstream
   [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow)
   (locally `../escrow/`) before starting:

   ```bash
   npm run did
   ```

   See [`docs/ai/frontend/workflows/regenerate-bindings.md`](../../docs/ai/frontend/workflows/regenerate-bindings.md).

9. (Optional) Run the Vitest unit suite or Playwright E2E:

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

- **`juno.collections.error.not_found (Datastore - profiles)` /
  profile reads or writes trap.** The local satellite is empty — the
  collections declared in `juno.config.ts` (under
  `satellite.collections.datastore`) were never applied. Run
  `juno config apply --mode development` against the running
  emulator and refresh the browser.
- **Sign-in silently fails locally.** Most often:
  (a) `juno emulator start` is not running, or
  (b) `juno.config.ts` is missing `satellite.ids.development` and the
  SDK resolves the production satellite ID against the local
  replica, or
  (c) the auth worker is stale — run `npm run postinstall:copy-auth`
  to re-sync `static/workers/` from
  `node_modules/@junobuild/core/dist/workers/`.
- **`adapter-static` build warning about `index.html`.** Should be gone
  since `+layout.ts` sets `prerender = false`. If it reappears, somebody
  re-enabled prerender — revert.
- **CORS / 404 on the emulator.** Make sure `dfx start` is not running
  on a separate replica. Stop everything, then `juno emulator start`
  only — pandame's `dfx.json` already targets the emulator's gateway.
- **`canister not found` (`IC0301`) calling escrow.** You haven't run
  `npm run dev:setup` yet, or `VITE_ESCROW_CANISTER_ID` in `.env.local`
  is stale. Re-deploy and copy the printed ID.
- **`InsufficientFunds` / "sender not allowed to spend the requested
  amount" when funding a deal.** The local wallet is empty. Mint some
  local ICP into your principal with `npm run dev:tokens -- <principal>`
  (see step 6 above).

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
