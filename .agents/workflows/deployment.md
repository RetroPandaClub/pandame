---
description: local + production deployment workflow for the PandaMe SvelteKit app
---

PandaMe deploys two canisters of its own with `icp` (see
[`icp.yaml`](../../icp.yaml)): the **frontend** asset canister that hosts the
static SvelteKit build, and the **profiles** Rust canister
([`src/profiles/`](../../src/profiles/)). The Escrow canister lives upstream
at [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow)
(locally `../escrow/`, mainnet `umxj5-niaaa-aaaae-af2sq-cai`) and is only
deployed here into the local network, for development.

Two flavours:

- **Local network:** a self-contained local replica (it does not proxy to
  mainnet), so the upstream escrow canister has to be built and deployed into
  it with `dfx --network local`.
- **Production:** GitHub Actions, or the same `npm run deploy:*` scripts by
  hand.

> [!IMPORTANT]
> Do **NOT** run `dfx start`. [`dfx.json`](../../dfx.json) points its `local`
> network at `http://127.0.0.1:5987` (the gateway of `npx icp network start`)
> so dfx deploys into that replica. A separate dfx replica on port 4943
> collides with it and confuses the `/api` proxy target.

## Local network

1. Stop any other replica on your machine.

2. Start the local network:

   ```bash
   npx icp network start -d
   ```

   The IC HTTP gateway is on `http://127.0.0.1:5987`, the port `REPLICA_HOST`
   expects, instead of the icp-cli default 8000. `icp` and `ic-wasm` are
   devDependencies, so `npm ci` installs them.

3. **First run only: deploy the upstream escrow canister.** Needs
   [`../escrow/`](../../../escrow/) cloned as a sibling and Rust with
   `rustup target add wasm32-unknown-unknown`:

   ```bash
   npm run dev:setup
   ```

   The script first checks that the gateway on port 5987 answers. Its
   messages still say "Juno emulator" and suggest `juno emulator start`:
   ignore that and start the network with `npx icp network start -d` (step
   2), then rerun the script. It builds `escrow.wasm` from `../escrow/` with
   `cargo`, runs `dfx deploy escrow --network local` and prints the canister
   ID. Add it to
   `.env.local` (gitignored):

   ```bash
   echo "VITE_ESCROW_CANISTER_ID=<id>" >> .env.local
   ```

4. **Deploy this repo's canisters** into the local network:

   ```bash
   npm run deploy:local
   ```

   It builds with `--mode skylab` (a production build that still targets the
   local gateway) and deploys the frontend and profiles canisters. Put the
   printed profiles ID in `.env.local` as `VITE_PROFILES_CANISTER_ID`.

5. In a new terminal, start the dev server:

   ```bash
   npm run dev
   ```

   The app runs on <http://localhost:5173>. Vite proxies `/api/*` to port
   5987, so the agent reaches the local replica through the dev-server origin.

6. After signing in with Internet Identity the wallet is empty. Mint local ICP
   into it (and into other test principals):

   ```bash
   npm run dev:tokens -- <principal>           # 10 ICP (default)
   npm run dev:tokens -- <principal> 25        # 25 ICP
   npm run dev:tokens -- <p1> <p2> <p3> 5      # 5 ICP to each
   ```

   [`scripts/send-tokens.sh`](../../scripts/send-tokens.sh) calls
   `http://localhost:5999/ledger/transfer/`, which mints from the anonymous
   identity (the local ICP ledger's minter on PocketIC). Pass
   `--ledger-id <canister-id>` for another ICRC-1 ledger.

7. Profiles live in the profiles canister: publicly readable, writable only by
   their owner, with the owner taken from the caller. Escrow and ledger state
   live in the local network (locally) or on mainnet (in production).

8. (Optional) regenerate the escrow bindings first:
   [`regenerate-bindings.md`](../../docs/ai/frontend/workflows/regenerate-bindings.md).

9. (Optional) run the suites:

   ```bash
   npm run test -- --run
   npm run e2e
   ```

## Production canisters

| Canister                  | ID                            | Notes                                                                         |
| ------------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| Frontend (asset canister) | `wqhtf-fqaaa-aaaal-amssq-cai` | Was Juno's satellite until 2026-11-02, then reinstalled as an asset canister. |
| Profiles (Rust)           | `uoa62-6aaaa-aaaai-aye4q-cai` | Created 2026-11-02, on subnet `brlsh-zidhj-…-oae`.                            |

Both IDs are in
[`.icp/data/mappings/ic.ids.json`](../../.icp/data/mappings/ic.ids.json), which
the frontend build reads to inject the profiles ID. Keep that file committed.

The profiles canister could not go on the frontend's subnet: it is a Juno
subnet where the Cycles Ledger may not create canisters. A new canister needs
`--subnet` with one of the CMC's default subnets (`get_default_subnets` on
`rkp4c-7iaaa-aaaaa-aaaca-cai`).

A snapshot of the frontend taken just before the reinstall, while it was still
Juno's satellite, is kept on the canister (`…000c…`, 2026-11-02 12:57 UTC);
`icp canister snapshot list wqhtf-fqaaa-aaaal-amssq-cai -n ic` shows it.

## Production deploy via GitHub Actions

[`deploy.yml`](../../.github/workflows/deploy.yml) runs on `v*` tags and on
manual dispatch:

1. Checks out the ref.
2. The `prepare` composite action installs Node from `.node-version`, runs
   `npm ci` and `npm run prepare`.
3. `npm run deploy:profiles` upgrades the profiles canister (`icp deploy`
   with `--no-create`, so a broken mapping fails instead of creating a second
   canister).
4. `npm run deploy:assets` builds the site and publishes it with `icp sync`.

The `DEPLOY_PEM` identity is a controller of the profiles canister (a wasm
upgrade is controller-only) and holds only the `Commit` permission on the
frontend. It is deliberately not a frontend controller: `icp sync` needs
nothing more, and `icp deploy` against the frontend would also change
canister settings.

Trigger it by tagging a release (`git tag v0.1.0 && git push origin v0.1.0`)
or by re-running the workflow from the **Actions** tab.

## Production deploy by hand

If CI is unavailable, with an identity holding the same rights:

```bash
npm run deploy:profiles
npm run deploy:assets
```

Building the profiles canister needs Rust with the `wasm32-unknown-unknown`
target. On macOS, if linking fails with `tapi error: malformed file`, an SDK
newer than the Command Line Tools linker is installed; point the build at a
compatible one, for example
`SDKROOT=/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk`.

## Troubleshooting

- **Profile reads or writes fail locally.** `VITE_PROFILES_CANISTER_ID` in
  `.env.local` is unset or stale: a fresh local network assigns new IDs.
  Re-run `npm run deploy:local` and copy the printed ID.
- **Sign-in silently fails locally.** `npx icp network start -d` is usually
  not running.
- **`adapter-static` warns about `index.html`.** Someone re-enabled
  `prerender` in `+layout.ts`; revert it.
- **CORS or 404 on the local network.** A `dfx start` replica is running.
  Stop everything, then `npx icp network start -d` only.
- **`canister not found` (`IC0301`) calling escrow.** `npm run dev:setup` has
  not run, or `VITE_ESCROW_CANISTER_ID` is stale. Redeploy and copy the ID.
- **`InsufficientFunds` / "sender not allowed to spend the requested amount".**
  The local wallet is empty: `npm run dev:tokens -- <principal>` (step 6).

## See also

- [`docs/ai/pr-and-ci.md`](../../docs/ai/pr-and-ci.md): the CI matrix.
- [`docs/ai/backend/README.md`](../../docs/ai/backend/README.md): the profiles canister.
- [`docs/ai/README.md`](../../docs/ai/README.md): the agent docs index.
- [Escrow README](https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md)
  (locally `../escrow/src/escrow/README.md`): deal lifecycle and canister docs.
