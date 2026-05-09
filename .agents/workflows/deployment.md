---
description: local + production deployment workflow for the Juno satellite
---

This workflow covers the two flavours of deploy that pandame supports:

- **Local emulator** — for iterating against a fresh Juno satellite
  container on your machine.
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

4. The collections (`notes`, `images`) are seeded automatically from
   [`juno.dev.config.ts`](../../juno.dev.config.ts) on first emulator
   start. If you change `juno.dev.config.ts`, restart `juno dev start`.

5. (Optional) Run the Vitest unit suite or Playwright E2E:

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
- [`.claude/rules/juno.md`](../../.claude/rules/juno.md) — Juno SDK
  cheatsheet.
- [`docs/ai/README.md`](../../docs/ai/README.md) — AI agent docs index.
