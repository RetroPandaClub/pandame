# Frontend testing

Two runners: Vitest for units (CI `checks.yml` → `test`) and Playwright for
end-to-end (`e2e.yml`). The profiles canister has none yet; see
[backend](../backend/README.md#testing).

## Vitest

- **Config:** [`vitest.config.ts`](../../../vitest.config.ts): the SvelteKit
  plugin, `jsdom`, `globals: true`, specs matched by
  `src/**/*.{test,spec}.{js,ts}`.
- **Setup:** [`vitest.setup.ts`](../../../vitest.setup.ts) imports
  `@testing-library/jest-dom`, but the config has no `setupFiles` entry, so
  those matchers are **not loaded** today. Wire it before relying on
  `toBeInTheDocument`.
- **Where:** a `*.spec.ts` next to the file under test. `*.test.ts` is
  reserved for Playwright.
- **Today:** `src/lib/utils/{avatar,clipboard,dispute,format,storage}.utils.spec.ts`.
  [`storage.utils.spec.ts`](../../../src/lib/utils/storage.utils.spec.ts) is
  the model: a hoisted `vi.mock('$app/environment', …)`, one `describe` per
  module, nested per function, one `it` per behaviour.

| Test                                                     | Skip                          |
| -------------------------------------------------------- | ----------------------------- |
| Every exported function of a `*.utils.ts`                | Re-exports, generated files   |
| Stores and derived stores with logic                     | Pure passthrough stores       |
| Services with branching (mock `$lib/api/*.api`)          | One-off presentational markup |
| Every bug fix: a test that fails on `main`, passes after |                               |

- Mock modules, not globals: `vi.mock('$lib/api/escrow.api')`,
  `vi.mock('$lib/api/profiles.api')`, `vi.mock('$lib/services/auth.services')`.
- Reset state in `beforeEach`; order must never matter.
- No real network, no `setTimeout` waits (`vi.useFakeTimers()`), no
  `console.log`, no `.skip` / `.todo` on `main`.
- `@testing-library/svelte` is not installed; the first component test needs
  it as an approved dev dependency, and this page updated.

```bash
npm run test            # watch
npm run test -- --run   # single pass, as CI
```

## Playwright

- **Config:** [`playwright.config.ts`](../../../playwright.config.ts) boots
  `npm run build && npm run preview` on `:4173`, `testDir: 'e2e'`,
  `testIdAttribute: 'data-tid'`.
- **Projects:** every spec runs on Desktop Chrome, Firefox, Edge, Safari;
  iPhone 15 Pro Max, iPhone 13 Mini, Galaxy S24; iPad (gen 7), iPad Pro 11.
- **Today:** [`e2e/homepage.test.ts`](../../../e2e/homepage.test.ts), the
  signed-out welcome screen. No screenshot baselines are committed.
- One `e2e/<flow>.test.ts` per user flow. Target elements by role first,
  `getByTestId` with a `data-tid="kebab-case"` when a role is not enough
  (`DealCard`, `PanelSizePicker` already expose one).
- No `waitForTimeout`, no identities stuffed into storage, no network outside
  the local stack, no `test.skip` on `main`.

```bash
npm run e2e            # full suite, installs browsers first
npm run e2e:ci         # HTML reporter
npm run e2e:report     # open the last report
npm run e2e:snapshots  # refresh screenshot baselines
```

CI runs E2E on pushes to `main`, on PRs that touch `e2e/**`, `src/**`,
`static/**`, configs or the lockfile, on the merge queue, nightly, on manual
dispatch, and on any PR labelled `run-e2e`. `e2e-pass` treats a skip as a
pass. The `playwright-report` artifact is always uploaded; `test-results` only
on failure. Baselines can also be refreshed with the manual
[`snapshots.yml`](../../../.github/workflows/snapshots.yml) workflow.
