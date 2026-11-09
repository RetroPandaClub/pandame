# Workflow: regenerate the Candid bindings

`src/declarations/**` is generated. Two sources feed it:

| Bindings                     | Source                                                                                                | How                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `src/declarations/escrow/`   | `escrow.did` at `ESCROW_REF` in [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow) | `npm run did`                                |
| `src/declarations/profiles/` | Extracted from the built `src/profiles` wasm                                                          | The CI `canister` job, auto-committed on PRs |

## Bump the escrow contract

Ask first: a new contract usually changes behaviour.

1. Set `ESCROW_REF` (tag, branch or commit) in
   [`scripts/import-candid.sh`](../../../../scripts/import-candid.sh).
2. `npm run did`. It runs
   [`did.sh`](../../../../scripts/did.sh): `import-candid.sh` downloads the
   `.did` with a `// Generated from <repo> commit <sha>` header, then
   [`compile-idl-js.sh`](../../../../scripts/compile-idl-js.sh) runs
   `@icp-sdk/bindgen` on every `.did` under `src/declarations/` (normal and
   certified IDL), then `format` and `lint`.
3. `npm run check` lists every call site the new contract breaks. Fix them;
   never silence them.
4. Update [`../reusability.md`](../reusability.md) and
   [`../stack-and-patterns.md`](../stack-and-patterns.md#escrow-domain) if the
   domain changed (a new status, a new role, a new fee).
5. Commit the regenerated files, the `ESCROW_REF` bump and the code that uses
   them in one PR, then run the
   [gates](../../pr-and-ci.md#4-local-quality-gates).

Generated files are excluded from prettier and eslint (`.prettierignore`,
`eslint.config.js`), and `escrow.d.ts` carries `// @ts-nocheck`.

## Change the profiles interface

Change [`src/profiles/src/lib.rs`](../../../../src/profiles/src/lib.rs) (see
[backend](../../backend/README.md)), mirror the shape in
[`types/profile.ts`](../../../../src/lib/types/profile.ts), push: the
`canister` job rewrites `profiles.did` and its bindings on the PR branch.

## Do not

- Hand-edit anything under `src/declarations/`.
- Split "regenerate" and "use" into two PRs (a bisect trap).
- Point `ESCROW_REF` at a fork or a feature branch on `main`.
