# Workflow: Regenerate Candid bindings

The escrow canister's TS bindings under `src/declarations/escrow/**` are
**generated** from the upstream
[`escrow.did`](../../../../../escrow/src/escrow/escrow.did) via
`@icp-sdk/bindgen`. Re-run the pipeline whenever the upstream interface
changes.

## When to re-run

- The canister team merged a `.did` change in
  [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow).
- You're about to call a new endpoint that's already in upstream `main`
  but not yet vendored in `src/declarations/escrow/escrow.did`.
- A field in `DealView` / `EscrowError` / etc. was renamed and
  `npm run check` is failing because the generated types don't match
  the call sites yet.

## Steps

```bash
npm run did
```

Under the hood:

1. [`scripts/import-candid.sh`](../../../../scripts/import-candid.sh)
   fetches `https://raw.githubusercontent.com/AntonioVentilii/escrow/main/src/escrow/escrow.did`
   and prepends a `// Generated from <repo> commit <sha>` header so the
   vendored `.did` is traceable.
2. [`scripts/compile-idl-js.sh`](../../../../scripts/compile-idl-js.sh)
   runs `@icp-sdk/bindgen` over every `*.did` under `src/declarations/`,
   producing both:
   - `escrow.idl.js` / `escrow.idl.d.ts` (normal IDL).
   - `escrow.certified.idl.js` / `escrow.certified.idl.d.ts` (queries
     promoted to update calls — `@dfinity/utils` `Canister<S>` picks
     the right one based on the call type).
3. `npm run format` cleans any trailing commas + the placeholder factory
   `.d.ts` files.

The generated files are explicitly listed in
[`.prettierignore`](../../../../.prettierignore) and
[`eslint.config.js`](../../../../eslint.config.js) — neither prettier
nor eslint will touch them, and `// @ts-nocheck` at the top of
`escrow.d.ts` keeps `svelte-check` quiet too.

## After running

1. **Check the diff.** `git status src/declarations/escrow/` will show
   the new `.did`, `.d.ts`, and `.idl.{js,d.ts}` files.
2. **Update call sites.** If a field / variant was renamed upstream,
   `npm run check` will tell you exactly where. Don't try to silence
   the type errors — fix them.
3. **Update `_factory.ts` / `_types.ts`** only if the wrapper export
   surface changes (e.g. a new canister was vendored — see
   [`new-service.md`](./new-service.md#steps--adding-a-new-canister-wrapper)).
4. **Commit the regenerated files together with the calling code
   change.** Don't split "regen the bindings" from "use the new
   bindings" — the regen on its own is a bisect trap.
5. **Run the full quality gates:**

   ```bash
   npm run quality        # format + lint
   npm run check          # svelte-check
   npm run test -- --run  # vitest
   ```

## Pinning a different upstream commit

The pipeline always pulls from `main`. If you need to bind against a
specific upstream commit (e.g. a feature branch), edit
`scripts/import-candid.sh` temporarily — change `main` in the URL to the
ref you want — re-run `npm run did`, then **revert the script change**
before committing. Don't ship a pinned-to-feature-branch script to
`main`.

## Anti-patterns (do not do these)

- Hand-editing anything under `src/declarations/escrow/`. The bindgen
  header explicitly warns against it; your edits will be lost on the
  next `npm run did`.
- Vendoring a `.did` from a forked repo without updating
  [`AGENTS.md`](../../../AGENTS.md#1-what-this-repo-is) — the docs
  should always point at the canonical upstream.
- Splitting "regen bindings" + "use new bindings" across two PRs.
- Skipping `npm run check` after a regen because "the build still
  works" — `svelte-check` catches type drift the bundler doesn't.
