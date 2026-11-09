# Frontend guide

Start here before touching `src/lib/`, `src/routes/` or `src/app.*`. Up the
chain: [`AGENTS.md`](../../../AGENTS.md) → [`docs/ai/`](../README.md).

## Pre-flight checklist

- [ ] I read [`AGENTS.md`](../../../AGENTS.md), including the
      [repo additions](../../../AGENTS.md#4-the-standard-and-what-this-repo-adds).
- [ ] I know which folder my code belongs in ([`structure.md`](./structure.md)).
- [ ] I searched [`reusability.md`](./reusability.md) and the code for
      something that already does it.
- [ ] My code follows [`stack-and-patterns.md`](./stack-and-patterns.md) and
      copies none of the anti-patterns listed there.
- [ ] Components go through services; no `$declarations` import in a
      component or route.
- [ ] Copy goes through `$i18n.*` ([`workflows/i18n.md`](./workflows/i18n.md));
      markup passes [`a11y.md`](./a11y.md); colours are theme tokens.
- [ ] New pure helpers, stores with logic and bug fixes have a Vitest spec
      ([`testing.md`](./testing.md)).
- [ ] Regenerated bindings are committed with the code that uses them.
- [ ] The [local gates](../pr-and-ci.md#4-local-quality-gates) pass.
- [ ] Docs updated if I added a pattern or a shared piece
      ([meta-update rule](../governance.md#meta-update-rule)).

## Stack at a glance

| Concern  | What and where                                                                                                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App      | SvelteKit 2 SPA (`adapter-static`, `ssr = false`), Svelte 5 runes, TypeScript                                                                                                                                                                         |
| Styling  | Tailwind v4 via `@tailwindcss/vite`; tokens, Poppins, type scale, `tall:` variant in [`src/app.css`](../../../src/app.css)                                                                                                                            |
| Auth     | Internet Identity through `@icp-sdk/auth` ([`auth.services.ts`](../../../src/lib/services/auth.services.ts))                                                                                                                                          |
| Escrow   | Upstream canister through generated bindings and `Canister<S>` wrappers                                                                                                                                                                               |
| Ledgers  | `@icp-sdk/canisters/ledger/icrc` ([`icrc-ledger.api.ts`](../../../src/lib/api/icrc-ledger.api.ts))                                                                                                                                                    |
| Profiles | The repo's own Rust canister ([`profiles.api.ts`](../../../src/lib/api/profiles.api.ts), [backend](../backend/README.md))                                                                                                                             |
| i18n     | `en.json` → generated `i18n.d.ts` → `$i18n` store                                                                                                                                                                                                     |
| Lint     | ESLint flat config ([`eslint.config.js`](../../../eslint.config.js)): no relative parent imports, `import/order` and `import/no-duplicates`, `svelte/require-each-key`, `no-console` except warn / error, `curly`, `prefer-template`, `require-await` |
| Tests    | Vitest (jsdom) for units, Playwright for E2E                                                                                                                                                                                                          |
| Hosting  | Asset canister `wqhtf-fqaaa-aaaal-amssq-cai`, deployed with `icp`                                                                                                                                                                                     |

## What good looks like

Recent changes worth imitating, from `git log`:

- `refactor(utils): extract copyToClipboard helper, share between badge + modal`:
  two callers did the same thing, one helper now, both moved in the same commit.
- `refactor: extract AuthGuard, UserPrincipalBadge, principal derived stores`:
  repeated page code became a behaviour-only component and derived stores.
- `chore(ui): tokenize all hardcoded colours + tighten the no-raw-colour rule`:
  one concern across many files, with the doc rule updated alongside.
- `feat(escrow): pre-approval calculator + creation_fee surface`: one domain
  rule in one function (`preApprovalAmount`), used by every caller.

Single verb, single concern, small diff. If your PR does not look like that,
rescope before continuing.
