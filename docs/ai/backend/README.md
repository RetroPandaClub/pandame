# Backend: the profiles canister

The only Rust in this repo. The escrow canister is upstream in
[`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow) and
follows that repo's docs.

## What it is

[`src/profiles/src/lib.rs`](../../../src/profiles/src/lib.rs), one crate in
the Cargo workspace ([`Cargo.toml`](../../../Cargo.toml), size-optimised
release profile), deployed by the `profiles` entry of
[`icp.yaml`](../../../icp.yaml) (`@dfinity/rust` recipe). Mainnet ID and
deploys: [`deployment.md`](../../../.agents/workflows/deployment.md).

| Endpoint      | Kind   | Access                                        | Contract                                                                   |
| ------------- | ------ | --------------------------------------------- | -------------------------------------------------------------------------- |
| `get_profile` | query  | anyone                                        | `(principal) -> (opt Profile)`                                             |
| `set_profile` | update | authenticated (`require_authenticated` guard) | `(SetProfile) -> (Result)`; the owner is `msg_caller()`, never an argument |

## Patterns

- **State:** one `StableBTreeMap<PrincipalKey, Profile>` on `MemoryId 0`
  (`lib.rs:117`). Stable memory, so upgrades need no `pre_upgrade` step.
  A new map takes the next `MemoryId`; never reuse one.
- **Input type separate from the stored type:** `SetProfile` carries only what
  a caller may set; `owner`, timestamps and `version` are derived
  (`lib.rs:57`).
- **Optimistic concurrency:** callers echo the `version` they read; a
  mismatch, a create over an existing profile or an update of a missing one
  is rejected (`lib.rs:169`). The frontend keeps this contract in
  [`profile.services.ts`](../../../src/lib/services/profile.services.ts).
- **Validation in the canister:** `validate` (`lib.rs:129`) caps text fields
  and the avatar size even though the frontend checks too, because any caller
  can reach the canister.
- **Guards:** access control is an `ic_cdk` `guard`, not an `if` inside the
  method.
- **Candid:** `ic_cdk::export_candid!()`; the CI `canister` job extracts
  `src/declarations/profiles/profiles.did` with `candid-extractor` and
  regenerates the TS bindings, so never edit the `.did` by hand.

Known smells, fix in their own PR:

- Errors are `Result<_, String>`; a typed error enum would let the frontend
  map them like `EscrowCanisterError`.
- `MAX_AVATAR_URL_LEN` (`lib.rs:35`) and `MAX_AVATAR_DATA_URL_BYTES` in
  [`image.utils.ts`](../../../src/lib/utils/image.utils.ts) are the same value
  written twice across languages.
- `expect()` in the `Storable` impls is the accepted exception (the trait
  cannot return an error).

## Changing it

1. Ask first: `src/profiles/**` is protected and stored data must survive the
   upgrade. Adding an optional field is safe; renaming or removing one is a
   breaking change (`feat(profile)!:` plus a migration note).
2. Edit `lib.rs`, mirror the shape in
   [`types/profile.ts`](../../../src/lib/types/profile.ts) and the callers in
   `profiles.api.ts` / `profile.services.ts`.
3. Run the gates locally:
   ```bash
   rustup target add wasm32-unknown-unknown
   cargo clippy --target wasm32-unknown-unknown --release --all-targets -- -D warnings
   cargo fmt --check
   ```
4. Push; the `canister` job commits the regenerated `profiles.did` and
   bindings to the PR branch.

## Testing

No Rust tests exist yet. New logic that can be pure (validation, version
checks) goes in plain functions with `#[cfg(test)]` unit tests run by
`cargo test`; a PR that adds the first one also adds `cargo test` to the
`canister` job (ask, it is a workflow change) and updates this section.
