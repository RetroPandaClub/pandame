# Workflow: Satellite serverless functions

Pandame's Juno satellite carries an optional **serverless extension**
authored in TypeScript under [`src/satellite/`](../../../../src/satellite/).
This is the right home for app-side hooks / assertions
(`defineHook<OnSetDoc>`, `defineAssert<AssertSetDoc>`, …) and for any
RPC the frontend wants to call directly on the satellite
(`defineQuery`, `defineUpdate`).

> **Not** for escrow logic. The on-chain Rust canister is upstream — see
> [`AGENTS.md`](../../../../AGENTS.md#4-where-to-look-backend--escrow-canister).
> Use the satellite extension only for things that belong _next to_ the
> Juno datastore (e.g. cross-doc validation, server-derived listings,
> webhook fan-out).

## Anatomy

```
src/satellite/
├── index.ts        Entry point — every named export becomes a hook / RPC
└── tsconfig.json   Isolated TS config — paths to $lib, $satellite,
                    $declarations, $root (compiled by `juno functions build`)
```

Generated on demand (NOT committed until the extension exposes
something):

```
src/satellite/satellite.did              Base Juno satellite Candid (boilerplate)
src/satellite/satellite_extension.did    Our `defineQuery` / `defineUpdate` surface
src/declarations/satellite/              Typed client bindings consumed by $lib
```

## When to add a function

| Symptom in the app                                               | Where it goes                                                                                                                    |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| "Validate the doc before it lands"                               | `defineAssert<AssertSetDoc>` in `src/satellite/index.ts`                                                                         |
| "React to a doc change (send a notification, compute a counter)" | `defineHook<OnSetDoc>` / `OnDeleteDoc`                                                                                           |
| "Expose a server-computed list / aggregate (no per-doc query)"   | `defineQuery`                                                                                                                    |
| "Atomic multi-doc mutation that can't run client-side"           | `defineUpdate`                                                                                                                   |
| "Cross-canister call to the escrow Rust canister"                | usually still client-side via `$lib/canisters/` — only move it server-side if the call needs server identity / can't be replayed |

## Editing `src/satellite/index.ts`

Each `defineHook` / `defineAssert` registers against a `collections:`
allow-list. Use the typed `Collection` enum from
[`$lib/constants/collections.constants.ts`](../../../../src/lib/constants/collections.constants.ts);
do **not** inline collection strings.

```ts
import { Collection } from '$lib/constants/collections.constants';
import { defineHook, type OnSetDoc } from '@junobuild/functions';

export const onSetDoc = defineHook<OnSetDoc>({
	collections: [Collection.PROFILES],
	run: async (context) => {
		if (context.data.collection === Collection.PROFILES) {
			// ... handle the profile set
		}
	}
});
```

Anything imported via `$lib/*` must compile under the satellite's
own `tsconfig.json`, which has `lib: ['ES2020', 'dom']` and bundler
module resolution. Browser-only APIs (`window`, `document`,
`localStorage`) blow up at WASM build time — keep imports pure.

## Local build pipeline

```bash
npm run juno:functions:build       # build sputnik.index.mjs + satellite.wasm.gz
npm run juno:functions:upgrade:dev # upgrade the local satellite (emulator)
```

Under the hood:

1. `juno functions build --lang ts` esbuild-bundles `src/satellite/index.ts`
   into `target/deploy/sputnik.index.mjs`.
2. The bundle is wrapped into the Sputnik Rust crate, compiled to WASM,
   and emitted as `target/deploy/satellite.wasm.gz`.
3. If the bundle exports at least one `defineQuery` / `defineUpdate`,
   the CLI emits Candid + a typed TS client:
   - `src/satellite/satellite.did`
   - `src/satellite/satellite_extension.did`
   - `src/declarations/satellite/{satellite.api.ts,satellite.did.d.ts,satellite.factory.did.js}`

`target/` is gitignored. Both prettier and eslint inherit `.gitignore`
patterns automatically — prettier respects `.gitignore` natively, and
[`eslint.config.js`](../../../../eslint.config.js) wires the same via
`includeIgnoreFile` from `@eslint/compat`. Don't list `target/` (or any
other already-gitignored path) explicitly in `.prettierignore` /
`eslint.config.js`'s `ignores` array — that would just create two
sources of truth that can drift.

## Versioning

[`package.json`](../../../../package.json) carries:

```jsonc
"juno": {
	"functions": {
		"version": "0.0.X"
	}
}
```

This is the version stamped into the satellite WASM and recorded on
the satellite when `juno functions publish` runs. **Bump it before
publishing a new function behaviour**, otherwise the canister will
reject the upgrade with `version_unchanged`.

## CI gate — `satellite-schema`

[`.github/workflows/checks.yml`](../../../../.github/workflows/checks.yml)
has a dedicated job that:

1. Installs the Juno CLI directly via `npm i -g @junobuild/cli@<pin>`.
   Pinned on purpose — the `junobuild/juno-action@full` Docker image
   ships its own (older) `@icp-sdk/bindgen`, which can rewrite our
   `satellite_extension.did` as `service : {}` and make the drift
   check a permanent false positive.
2. Runs `npm run juno:functions:build`.
3. Runs `npm run quality`.
4. Fails if any of the following paths changed vs the committed tree:
   - `src/satellite/satellite.did`
   - `src/satellite/satellite_extension.did`
   - `src/declarations/satellite/`

The drift check is a no-op while the satellite has no
`defineQuery` / `defineUpdate` (none of those paths exist). It
becomes active the first time we expose a server endpoint.

## After running locally

1. `git status src/satellite/ src/declarations/satellite/` — review
   any newly generated files.
2. Update call sites if you added a new RPC. Import the typed client
   from `$declarations/satellite/satellite.api`, never the raw
   `actor.satellite_extension_*` methods.
3. Commit the regenerated files together with the calling code
   change. Splitting "regenerate" from "use" is a bisect trap (same
   rule as `npm run did`).
4. Bump `package.json` → `juno.functions.version` before pushing a
   tag that triggers
   [`publish.yml`](../../../../.github/workflows/publish.yml).
5. Run the standard quality gates:

   ```bash
   npm run format
   npm run lint
   npm run check
   npm run test -- --run
   ```

## Anti-patterns (do not do these)

- Hand-editing anything under `src/declarations/satellite/`. The Juno
  CLI's bindgen header explicitly warns against it; edits are lost on
  the next `npm run juno:functions:build`.
- Putting on-chain escrow logic into the satellite. The escrow
  canister lives upstream — see
  [`AGENTS.md`](../../../../AGENTS.md#4-where-to-look-backend--escrow-canister).
- Using `window` / `document` / `localStorage` / `IndexedDB` inside
  `src/satellite/**`. The bundle runs inside a server-side WASM, not
  a browser.
- Inlining collection name strings. Use the
  [`Collection`](../../../../src/lib/constants/collections.constants.ts)
  enum so a typo doesn't silently route hooks to nowhere.
- Forgetting to bump `juno.functions.version`. `publish.yml` will
  fail with `version_unchanged`.
