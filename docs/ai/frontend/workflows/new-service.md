# Workflow: wire an escrow endpoint or add a service

The most frequent change in `git log` (`feat(escrow): …`, `feat(disputes): …`):
the upstream canister gains an endpoint and the app uses it.

## Where it goes

| Situation                                     | Where                                                                              |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| Pure computation                              | `$lib/utils/<concern>.utils.ts` plus a spec                                        |
| One canister endpoint                         | method in `*.canister.ts` + function in `*.api.ts`                                 |
| Identity, orchestration, store writes, events | `$lib/services/<concern>.services.ts`                                              |
| Another ICRC ledger                           | a token in `tokens.constants.ts`; `icrc-ledger.api.ts` already takes the ledger ID |

Existing services: deal, dispute, arbitrator, treasury, balance, profile,
auth, identity ([catalog](../reusability.md)). Extend the one that owns the
concern before adding a file.

## A new escrow endpoint

1. **Bindings.** If `src/declarations/escrow/escrow.did` lacks it, the
   contract pin must move: [`regenerate-bindings.md`](./regenerate-bindings.md)
   (ask first).
2. **Wrapper.** Add the method to
   [`escrow.canister.ts`](../../../../src/lib/canisters/escrow.canister.ts) like
   its siblings: destructure the generated method from
   `this.caller(queryParams)`, call it, and pass `{ Ok | Err }` results
   through `unwrap(result, 'create deal')`-style with a readable op name.
3. **Facade.** Add the function to
   [`escrow.api.ts`](../../../../src/lib/api/escrow.api.ts) with the
   `({ identity, ...args, ...queryParams })` shape and the private
   `escrowCanister` factory.
4. **Service.** In the owning `*.services.ts`: take identity from
   `safeGetIdentityOnce` (actions) or `getIdentityOrAnonymous` (public
   reads), call the facade, and for actions upsert the result into the store
   and `emit({ message: 'pandameReloadDeals' })`, as `reflectDeal` does in
   [`deal.services.ts`](../../../../src/lib/services/deal.services.ts).
5. **Types.** Re-export any new generated type from `$lib/types/`.
6. **Errors.** Let `EscrowCanisterError` propagate; a new error variant the
   user can hit gets copy in `i18n.errors.*` and a branch in
   [`escrow-error.utils.ts`](../../../../src/lib/utils/escrow-error.utils.ts).
7. **UI.** The component calls the service and shows failures through
   `friendlyEscrowError`.
8. **Tests.** Pure helpers always; services with branching via
   `vi.mock('$lib/api/escrow.api')`.
9. **Catalog and gates.** Update [`../reusability.md`](../reusability.md),
   then [`../../pr-and-ci.md`](../../pr-and-ci.md#4-local-quality-gates).
   Bindings, wrapper, facade, service and UI ship in one PR.

## A new canister

Ask first. Then: its ID in
[`canisters.constants.ts`](../../../../src/lib/constants/canisters.constants.ts),
its `.did` vendored through
[`import-candid.sh`](../../../../scripts/import-candid.sh), `npm run did`, the
factory and type namespace re-exported from
[`_factory.ts`](../../../../src/declarations/_factory.ts) /
[`_types.ts`](../../../../src/declarations/_types.ts), then
`<x>.canister.ts` + `<x>.api.ts` + a service, mirroring escrow.

## Do not

- Call a wrapper, `getAgent` or a ledger from a component or store.
- Skip the facade from a service.
- Return `{ Ok | Err }` from a service.
- Cache identity in a module, or add a "just in case" cache around calls.
