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

## Local network

1. Stop any other replicas on your machine.

2. Start the local network:

   ```bash
   npx icp network start -d
   ```

   The IC HTTP gateway is exposed on `http://127.0.0.1:5987` — the port
   `REPLICA_HOST` already expects — rather than the icp-cli default of 8000.
   `icp` and `ic-wasm` are devDependencies, so `npm ci` installs them.

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

4. **Deploy the canisters** into the local network:

   ```bash
   npm run deploy:local
   ```

   That deploys both canisters into the running local network.

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

7. User profiles live in the **profiles canister**
   ([`src/profiles/`](../../src/profiles/)), which replaced the satellite's
   `profiles` Datastore collection. It keeps the same access model —
   publicly readable, writable only by the owner — but derives the owner from
   the caller rather than a supplied key. Escrow / ledger state lives in the
   canisters inside the same local network (locally) or on mainnet (in
   production). `npm run deploy:local` prints the local profiles canister ID;
   put it in `.env.local` as `VITE_PROFILES_CANISTER_ID`.

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

## Production canisters

| Canister                  | ID                            | Notes                                                                                |
| ------------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| Frontend (asset canister) | `wqhtf-fqaaa-aaaal-amssq-cai` | Was Juno's satellite until 2026-11-02, when it was reinstalled as an asset canister. |
| Profiles (Rust)           | `uoa62-6aaaa-aaaai-aye4q-cai` | Created 2026-11-02, on subnet `brlsh-zidhj-…-oae`.                                   |

Both IDs are recorded in
[`.icp/data/mappings/ic.ids.json`](../../.icp/data/mappings/ic.ids.json), which
the frontend build reads to inject the profiles ID. Keep that file committed.

The profiles canister could not go on the frontend's subnet: that is a Juno
subnet where the Cycles Ledger is not authorised to create canisters. If a new
canister is ever needed, pass `--subnet` with one of the CMC's default subnets
(`get_default_subnets` on `rkp4c-7iaaa-aaaaa-aaaca-cai`).

A snapshot of the frontend taken just before the reinstall — while it was still
Juno's satellite — is kept on the canister (`…000c…`, 2026-11-02 12:57 UTC).
`icp canister snapshot list wqhtf-fqaaa-aaaal-amssq-cai -n ic` shows it.

## Production deploy — via GitHub Actions

The [`deploy.yml`](../../.github/workflows/deploy.yml) workflow runs on `v*`
tags and on manual dispatch:

1. `actions/checkout@v6.0.2` checks out the ref.
2. The `prepare` composite action installs Node from `.node-version`,
   runs `npm ci` and `npm run prepare`.
3. `npm run deploy:profiles` upgrades the profiles canister (`icp deploy`,
   with `--no-create` so a broken mapping fails instead of creating a second
   canister).
4. `npm run deploy:assets` builds the site and publishes it with `icp sync`.

The `DEPLOY_PEM` identity is a controller of the profiles canister, since
upgrading a wasm is controller-only, and holds only the `Commit` permission on
the frontend. It is deliberately not a controller of the frontend: `icp sync`
needs nothing more, and `icp deploy` against the frontend would also change
canister settings.

Trigger a deploy by:

- Tagging a release (`git tag v0.1.0 && git push origin v0.1.0`), or
- Re-running the workflow manually from the **Actions** tab
  (`workflow_dispatch`).

## Production deploy — manually

If CI is unavailable, with an identity that has the same rights:

```bash
npm run deploy:profiles
npm run deploy:assets
```

Building the profiles canister needs Rust with the `wasm32-unknown-unknown`
target. On macOS, if linking fails with `tapi error: malformed file`, a newer
SDK than the Command Line Tools' linker understands is installed — point the
build at a compatible one, e.g.
`SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk`.

## Troubleshooting

- **Profile reads or writes fail locally.** `VITE_PROFILES_CANISTER_ID` in
  `.env.local` is unset or stale — a fresh local network assigns new IDs every
  time. Re-run `npm run deploy:local` and copy the printed ID.
- **Sign-in silently fails locally.** Most often `npx icp network start -d` is
  not running.
- **`adapter-static` build warning about `index.html`.** Should be gone
  since `+layout.ts` sets `prerender = false`. If it reappears, somebody
  re-enabled prerender — revert.
- **CORS / 404 on the local network.** Make sure `dfx start` is not running
  on a separate replica. Stop everything, then `npx icp network start -d`
  only — pandame's `dfx.json` also targets port 5987.
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
