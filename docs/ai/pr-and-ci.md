# PR and CI

Everything needed to open a green PR.

## 1. Title

[Conventional Commits](https://www.conventionalcommits.org/), enforced by
[`pr-checks.yml`](../../.github/workflows/pr-checks.yml):

```
^(feat|fix|chore|build|ci|docs|style|refactor|perf|test)(\([-a-zA-Z0-9,]+\))?!?:
```

| Verb       | When                                                |
| ---------- | --------------------------------------------------- |
| `feat`     | New user-visible feature                            |
| `fix`      | Bug fix                                             |
| `refactor` | Internal change, no behaviour change                |
| `style`    | Visual or CSS only                                  |
| `perf`     | Performance                                         |
| `docs`     | Docs only (`docs/ai/**`, `README.md`)               |
| `test`     | Tests only                                          |
| `chore`    | Maintenance, dependency bumps, release housekeeping |
| `build`    | Build system, packaging                             |
| `ci`       | Workflows and actions                               |

Scopes in use (from `git log`): `ui`, `routes`, `layout`, `theme`, `home`,
`profile`, `deals`, `disputes`, `history`, `transactions`, `admin`, `escrow`,
`auth`, `i18n`, `services`, `stores`, `canisters`, `declarations`, `dev`,
`e2e`, `ai`, `npm-deps`, `npm-deps-dev`, `github-actions`. A new scope is
short, lowercase, no spaces.

A change that breaks stored data (the `Profile` record in `src/profiles/`,
`UserProfile`) or the escrow contract mirror takes `!`
(`feat(profile)!: rename name to display_name`) and a `BREAKING CHANGE:`
block in the body with the migration.

## 2. Body

Use [`.github/pull_request_template.md`](../../.github/pull_request_template.md)
with its exact headings:

```markdown
# Motivation

# Changes

# Tests
```

- All three sections, even for a tiny PR.
- No hard wrapping: one line per paragraph or list item.
- A PR that touches more than one thing says in one line why they belong
  together; if you cannot, split it.
- Mention `docs/ai/**` updates under `# Changes` when the
  [meta-update rule](./governance.md#meta-update-rule) fired.
- Link screenshots for visual changes; no pasted base64.
- No AI attribution lines.

## 3. Atomicity

| Instead of                                | Do                                                             |
| ----------------------------------------- | -------------------------------------------------------------- |
| "Add feature X and rename a component"    | `refactor:` the rename, then `feat:` X                         |
| "Fix bug Y and tidy unrelated typography" | Two PRs                                                        |
| "Move five components onto a new `Foo`"   | Introduce `Foo` with one caller, then migrate the rest         |
| "Bump bindings" alone                     | Regenerated `src/declarations/**` ships with the code using it |

## 4. Local quality gates

From the repo root, before every PR:

```bash
npm run format          # prettier --write + eslint --fix
npm run lint            # prettier --check + eslint
npm run check           # svelte-check
npm run test -- --run   # vitest, single pass
```

`npm run quality` runs `format` then `lint`. Also:

- `npm run i18n` if you touched `src/lib/i18n/*.json`.
- `npm run e2e` if you touched UI, `src/**`, `static/**` or configs.
- `cargo clippy --target wasm32-unknown-unknown --release --all-targets -- -D warnings`
  and `cargo fmt --check` if you touched `src/profiles/**`.

### The quality gate inside `lint`

[`eslint.config.js`](../../eslint.config.js) enforces, on `src/**/*.{ts,svelte}`:
`complexity` 10, `max-depth` 3, `max-params` 3, `max-lines` 300 (blank lines
and comments excluded, generated `i18n.d.ts` excluded), no explicit `any`, no
non-null assertion, and import boundaries (routes and components may not
import `$declarations`, `$lib/api`, `$lib/canisters`, `$lib/actors`; utils may
not import api, canisters, actors, services or stores).

Today's violations are baselined in
[`eslint-suppressions.json`](../../eslint-suppressions.json), which ESLint
reads on its own. The baseline only shrinks:

- New code that breaks a rule fails `lint`; fix the code.
- When you fix a baselined violation, run `npx eslint . --prune-suppressions`
  and commit the smaller file; a stale entry makes `lint` fail.
- Never add entries (`--suppress-all`, `--suppress-rule`) or raise a
  threshold without asking.

## 5. CI

| Workflow               | Job                | Runs                                                                                                    |
| ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- |
| `checks.yml`           | `format`           | `npm run format`; on PRs commits the fixes back                                                         |
| `checks.yml`           | `canister`         | Clippy, `cargo fmt --check`, re-extracts `profiles.did`, regenerates every binding; commits back on PRs |
| `checks.yml`           | `lint`             | `npm run lint`                                                                                          |
| `checks.yml`           | `check`            | `npm run check`                                                                                         |
| `checks.yml`           | `build`            | `npm run build`                                                                                         |
| `checks.yml`           | `test`             | `npm run test -- --run`                                                                                 |
| `checks.yml`           | `checks-pass`      | Aggregator, required to merge                                                                           |
| `e2e.yml`              | `e2e`              | Playwright; path-filtered, nightly, or forced with the `run-e2e` label                                  |
| `e2e.yml`              | `e2e-pass`         | Aggregator; a skipped `e2e` counts as a pass                                                            |
| `pr-checks.yml`        | `check-pr-title`   | The title regex above                                                                                   |
| `auto-update-i18n.yml` | `auto_update`      | `npm run i18n` on PRs touching `src/lib/i18n/**`                                                        |
| `deploy.yml`           | `deploy`           | On `v*` tags or manual dispatch: profiles canister, then assets                                         |
| `snapshots.yml`        | `update_snapshots` | Manual Playwright snapshot refresh                                                                      |

The two committing jobs push with the org `BOT_CREATE_PR_PAT`, which must
exist as an Actions secret and as a Dependabot secret (Dependabot runs only
see Dependabot secrets); without it they fail and print the diff.

When a job fails:

- **`format` pushed a commit:** pull it. Run `npm run format` locally next time.
- **`lint`:** run `npm run lint`. Typical causes: a relative parent import
  (use an alias), an `{#each}` without a key, a [quality gate](#the-quality-gate-inside-lint)
  threshold or boundary, a stale suppression to prune. Never silence a rule.
- **`check`:** fix the type error. No `@ts-ignore`, `as any`, `as unknown as`.
- **`test`:** reproduce with `npm run test -- --run`. Never `.skip`.
- **`canister`:** reproduce the clippy / fmt command from section 4.
- **`checks-pass` red with green children:** rerun the workflow.
- **`e2e`:** download the `playwright-report` artifact (and `test-results`
  for traces).

## 6. Updating an existing PR

- Add commits. Never `git push --force`, never `git commit --amend` after
  pushing, never rebase a PR branch onto `main` to tidy it. Squash-merge
  tidies history at merge time.
- Only the user naming the operation counts as permission: "force-push",
  "push --force", "push -f", "amend", "git commit --amend", "rebase",
  "rewrite history", or picking an option whose label says so. "Do what you
  think is best", "do it the idiomatic way", approval of a plan or of a
  refactor do not count.
- When offering choices, the default is always the no-force-push option.
- To drop a commit, push a revert commit.
- Legitimate reasons the user might ask (illustrative): an accidentally
  committed secret (rotate it too), recovering from a catastrophic mistake.

## 7. Reviewers

[`.github/CODEOWNERS`](../../.github/CODEOWNERS) routes reviews; agents do not
assign reviewers.
