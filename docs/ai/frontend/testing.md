# Frontend Testing

Pandame ships **two** test runners: Vitest for unit / module tests and
Playwright for end-to-end. Both are wired into CI via
[`.github/workflows/checks.yml`](../../../.github/workflows/checks.yml)
(Vitest) and [`.github/workflows/e2e.yml`](../../../.github/workflows/e2e.yml)
(Playwright).

## Unit tests — Vitest

### Stack

- **Runner:** [Vitest 4](https://vitest.dev/).
- **Environment:** `jsdom` (configured in
  [`vitest.config.ts`](../../../vitest.config.ts)).
- **Setup file:** [`vitest.setup.ts`](../../../vitest.setup.ts) —
  loads `@testing-library/jest-dom` matchers.

### Layout

- **Colocated `*.spec.ts`** next to the file under test. Example:
  [`src/lib/utils/storage.utils.ts`](../../../src/lib/utils/storage.utils.ts)
  has [`storage.utils.spec.ts`](../../../src/lib/utils/storage.utils.spec.ts)
  in the same directory.
- **Naming:** `*.spec.ts` for Vitest specs.
- **Don't use `*.test.ts` for unit tests** — that suffix is reserved for
  Playwright (see below).

### What to test

| Add tests for                                                  | Don't bother                                          |
| -------------------------------------------------------------- | ----------------------------------------------------- |
| Pure utils (`*.utils.ts`) — every public function              | Re-exports, barrels                                   |
| Stores / derived stores with non-trivial logic                 | Generated files (`src/lib/types/i18n.d.ts`)           |
| Components with logic (any non-trivial branch / event handler) | Throwaway prototypes                                  |
| Bug fixes (write the regression test that fails on `main`)     | One-off presentational components used in 1 page only |

If you fix a bug, **the PR contains a test that fails on `main` and
passes on your branch**. Otherwise it's an "I think this is fine" PR.

### File shape

```ts
import { describe, expect, it } from 'vitest';
import { get, set } from '$lib/utils/storage.utils';

describe('storage.utils', () => {
	describe('set / get', () => {
		it('round-trips a primitive', () => {
			set({ key: 'k', value: 42 });
			expect(get<number>({ key: 'k' })).toEqual(42);
		});
	});
});
```

Notes:

- One `describe` per module under test, nested `describe` per public
  function.
- One `it` per behaviour — name it from the user/caller perspective.
- Reset side effects in `beforeEach`. Never let test order matter.
- For Juno calls (`setDoc` / `listDocs` / `signIn` / …): mock the
  `@junobuild/core` module rather than stubbing globals.

### Component testing

When testing a Svelte component:

```ts
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Button from '$lib/components/Button.svelte';

describe('Button', () => {
	it('renders the children', () => {
		render(Button, { props: { children: () => 'Confirm' } });
		expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
	});
});
```

Prefer `getByRole`, `getByLabelText`, `getByText` — they exercise the
same semantics as a screen reader.

> [!NOTE]
> `@testing-library/svelte` is **not** in `package.json` today. If your
> first component test needs it, add it under `devDependencies` (with
> explicit user approval — see
> [`governance.md`](../governance.md#forbidden-without-explicit-prompt))
> and update this page in the same PR.

### Forbidden in unit tests

- `it.skip` / `describe.skip` / `it.todo` left on `main`.
- Real network calls.
- `setTimeout`-based waits. Use `vi.useFakeTimers()` or `await waitFor(...)`.
- `console.log` debug output. Remove before commit.

### Local commands

```bash
npm run test            # watch mode
npm run test -- --run   # single pass (matches CI)
```

## E2E — Playwright

### Stack

- **Runner:** `@playwright/test` 1.59+.
- **Devices:** desktop (Chrome / Firefox / Edge / Safari) + mobile
  (iPhone SE / iPhone 14 Pro Max / Galaxy S8 / Pixel 7) + tablets (iPad
  gen 7 / iPad Pro 11). Every spec runs against every project.
- **Web server:** Playwright auto-boots `npm run build && npm run preview`
  on `:4173` (see [`playwright.config.ts`](../../../playwright.config.ts)).

### Layout

```text
e2e/
├── homepage.test.ts             # logged-out smoke test
└── homepage.test.ts-snapshots/  # generated screenshots, one per device
```

- **One `*.test.ts` per high-level user-facing flow.** Don't co-locate
  specs with components.
- **`*.test.ts` is reserved for Playwright** in this repo (Vitest uses
  `*.spec.ts`).
- **Selectors** go through `page.getByTestId(...)`. Playwright is
  configured with `testIdAttribute: 'data-tid'`, so a component opts in
  by exposing `data-tid="…"`.

### Snapshots

Pandame snapshots the rendered home page per device. To refresh after
intentional UI changes:

```bash
npm run e2e:snapshots
```

Or trigger the manual
[`Update E2E Snapshots`](../../../.github/workflows/snapshots.yml)
workflow on a PR branch and the bot will commit the regenerated PNGs.

### Local commands

```bash
npm run e2e            # run the full suite (installs browsers on first run)
npm run e2e:ci         # CI-style run (HTML reporter)
npm run e2e:report     # open the last HTML report
npm run e2e:snapshots  # update snapshots
```

### CI

[`e2e.yml`](../../../.github/workflows/e2e.yml) auto-runs on every push
to `main`, every relevant pull request (path-filtered to `e2e/**`,
`src/**`, `static/**`, configs, lockfile, and the workflow itself), every
`merge_group`, on a nightly schedule, and on `workflow_dispatch`. PRs
that don't touch UI code skip E2E entirely; the `e2e-pass` aggregator
treats that skip as a pass. Add the `run-e2e` label to a PR to force
the run anyway.

The HTML report is uploaded as the `playwright-report` artifact (always);
raw `test-results/` ship only on failure.

### Forbidden in E2E

- `test.skip` left on `main`. Either remove the test or make it pass.
- Hard-coded waits (`page.waitForTimeout(...)`). Use
  `expect(locator).toBeVisible()` / `toHaveText()` instead.
- Logging in by stuffing identities into `localStorage` / `IndexedDB`.
- Real network calls outside the local Juno emulator. The whole point of
  the emulator is reproducibility.

### Adding a new E2E test

1. Add a `data-tid="…"` on the smallest meaningful element you need to
   target.
2. Write the spec under `e2e/<flow>.test.ts`.
3. Run `npm run e2e` locally before pushing. If the spec uses
   screenshots, run `npm run e2e:snapshots` to seed them.
