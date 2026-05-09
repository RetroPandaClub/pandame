# Workflow: Add a new service

Use this when you need to wrap a new canister endpoint, or when a new
side-effectful operation (network, store mutation, identity-aware
business logic) appears in two or more components.

## When to add a service vs put logic in a component

| Situation                                           | Where it goes                                    |
| --------------------------------------------------- | ------------------------------------------------ |
| Pure helper (no I/O, no DOM)                        | `$lib/utils/<name>.utils.ts`                     |
| Side-effectful operation called from one component  | Inline in the component                          |
| Side-effectful operation called from ≥ 2 components | `$lib/services/<concern>.services.ts`            |
| Wrapping a canister endpoint (one-to-one)           | `$lib/api/<canister>.api.ts` (+ `*.canister.ts`) |
| Orchestration across multiple api calls + stores    | `$lib/services/<concern>.services.ts`            |

## Steps — adding a service

1. **Search first.** `Grep` `$lib/services/` for a near-fit. Pandame's
   services today are `identity.services`, `deal.services`,
   `balance.services` — extend one of them if it's a related concern
   before creating a new file.
2. **Pick the name.** `<concept>.services.ts` (kebab-case, lowercase).
   Exported functions are `camelCase` verbs (`createAndFundDeal`,
   `myBalance`, `safeGetIdentityOnce`).
3. **Identity wiring.** Call
   [`safeGetIdentityOnce`](../../../../src/lib/services/identity.services.ts)
   for authenticated actions, or `getIdentityOrAnonymous` for public
   reads. Never re-implement identity resolution in the service.
4. **Pass identity downward.** The api facade in `$lib/api/` accepts
   `{ identity, ... }`. Don't go around it; if you find yourself wanting
   to, the api facade is the right place to extend.
5. **Errors.** Throw `Error` (the canister wrapper's `unwrap()` already
   JSON-stringifies the typed `EscrowError`). Components catch via
   `try/catch` and surface the message in their local UI state. Don't
   build a global notification store yet — surface a question first.
6. **Return shapes.** Return the canister's typed view (`EscrowDid.DealView`
   etc.) — re-export through `$lib/types/deal.ts` if a component needs
   the type without importing from `$declarations`.
7. **Catalog update** — add a row to
   [`../reusability.md`](../reusability.md#services--libservices). This
   is the [meta-update rule](../../governance.md#meta-update-rule).
8. **Tests.** Pure helpers always need a `*.spec.ts`. Services with
   non-trivial branching get tests by mocking the api module
   (`vi.mock('$lib/api/escrow.api')`).
9. **Run quality gates** (`npm run quality && npm run check && npm run test -- --run`).

## Steps — adding a new canister endpoint to the existing wrapper

If the upstream `escrow.did` already has the endpoint:

1. Make sure the bindings are up to date:

   ```bash
   npm run did
   ```

   That re-downloads `../escrow/.../escrow.did` from upstream and
   regenerates `src/declarations/escrow/**`.

2. Add the method to
   [`escrow.canister.ts`](../../../../src/lib/canisters/escrow.canister.ts).
   Use the existing pattern: thin destructure of `caller(queryParams)`,
   call the generated method, run the result through the local
   `unwrap()` if it returns `{ Ok | Err }`.
3. Add the matching facade function to
   [`escrow.api.ts`](../../../../src/lib/api/escrow.api.ts). Same
   `{ identity, ...args, ...queryParams }` shape as siblings.
4. If the call is part of a higher-level orchestration, expose a
   service function in
   [`deal.services.ts`](../../../../src/lib/services/deal.services.ts)
   (or a new `*.services.ts` if it's a different concern).
5. Catalog + tests + quality gates as above.

## Steps — adding a new canister wrapper

If you need to talk to a different canister (e.g. ckUSDC ledger,
icp-index, a future companion canister):

1. **Surface the ask first.** Wrapping a new canister adds a
   constant + a wrapper + a facade + (often) a service. Confirm scope
   with the human owner before doing it.
2. Add the canister id to
   [`canisters.constants.ts`](../../../../src/lib/constants/canisters.constants.ts).
3. If it's an ICRC-1/-2 ledger you can probably reuse
   [`icrc-ledger.api.ts`](../../../../src/lib/api/icrc-ledger.api.ts)
   directly — the api takes `ledgerCanisterId` as a parameter. Add the
   token to
   [`tokens.constants.ts`](../../../../src/lib/constants/tokens.constants.ts)
   instead of writing a new wrapper.
4. Otherwise: vendor the `.did` (extend
   [`scripts/import-candid.sh`](../../../../scripts/import-candid.sh)
   with a new `download_did` call), run `npm run did`, then mirror the
   escrow setup: `<x>.canister.ts` + `<x>.api.ts` (+ a service if
   needed).
5. Re-export the new factory + service type from
   [`src/declarations/_factory.ts`](../../../../src/declarations/_factory.ts)
   and the `EscrowDid`-style namespace from
   [`_types.ts`](../../../../src/declarations/_types.ts).
6. Catalog + tests + quality gates as above.

## Anti-patterns (do not do these)

- Calling `EscrowCanister.create` / `IcrcLedgerCanister.create` /
  `getAgent` from a component or store. Always go through the api
  facade.
- Skipping the api facade and calling the canister wrapper directly
  from a service.
- Returning raw `{ Ok | Err }` shapes from a service. Throw on `Err`.
- Wrapping every service call in a debounced cache "to be safe". Caches
  belong in stores, and only when you measure that the canister call is
  the bottleneck.
- Adding identity as a service-level singleton — always call
  `safeGetIdentityOnce` / `getIdentityOrAnonymous` per call so II
  session expiry surfaces correctly.
