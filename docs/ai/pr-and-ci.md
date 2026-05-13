# PR & CI

Everything an agent needs to open a green PR.

## 1. PR title

The repo follows [Conventional Commits](https://www.conventionalcommits.org/).
The [`pr-checks.yml`](../../.github/workflows/pr-checks.yml) workflow
enforces the regex below on every PR title.

Pattern: `verb(scope)?: description` — scope optional but encouraged.

### Verbs

| verb       | when                                                         |
| ---------- | ------------------------------------------------------------ |
| `feat`     | new user-visible feature                                     |
| `fix`      | bug fix                                                      |
| `refactor` | internal change with no behaviour change                     |
| `style`    | visual / CSS only — no logic change                          |
| `perf`     | performance improvement                                      |
| `docs`     | docs only (incl. `docs/ai/**`, `README.md`, …)               |
| `test`     | tests only                                                   |
| `chore`    | misc maintenance (dependency bumps, release housekeeping, …) |
| `build`    | build system / packaging                                     |
| `ci`       | CI workflows / actions                                       |

### Scope

Single word or comma-separated list of affected areas. Use the existing
vocabulary so it shows up grouped in changelogs:

- `ui`, `routes`, `layout`, `theme`, `profile`, `auth`, `i18n`,
  `services`, `stores`, `canisters`, `declarations`, `e2e`,
  `npm-deps`, `npm-deps-dev`, `github-actions`, `ai` (for
  `docs/ai/**` updates).

If you introduce a new scope, keep it short and lowercase, no spaces.

### Breaking changes

If your change breaks the public datastore shape (`UserProfile`, the
`profiles` collection rules in `juno.config.ts`, or the on-chain
escrow `.did` mirror under `$declarations/escrow/**`), mark the title
with `!`:

```
feat(profile)!: rename `display_name` field to `username`
```

…and add a `BREAKING CHANGE:` block in the body explaining the migration.

## 2. PR body — template

Honor [`.github/pull_request_template.md`](../../.github/pull_request_template.md):

```markdown
# Motivation

<!-- Describe the motivation that lead to the PR -->

# Changes

<!-- List the changes that have been developed -->

# Tests

<!-- Please provide any information or screenshots about the tests that have been done -->
```

Rules:

- **All three sections are required.** Don't leave them empty. Even tiny PRs benefit from one bullet per section.
- **Use the exact section headings** (`# Motivation`, `# Changes`, `# Tests`) so downstream tooling (release notes, search, changelog grep) can find them.
- **Do not hard-wrap lines.** Write one line per paragraph or list item and let the GitHub renderer wrap. Hard-wrapping at ~80 columns (a default many models fall back to) breaks rendering inside lists, blockquotes, and tables, and makes later edits in the GitHub UI ugly. This applies to the PR body only — source files still follow `.prettierrc`.
- **Atomicity statement** if the PR touches more than one logical thing — add a one-liner explaining why they belong together. If you can't, split.
- **Mention `docs/ai/` updates** under `# Changes` whenever the [meta-update rule](./governance.md#meta-update-rule) fired.
- **Screenshots are welcome** for visual changes — link them; don't paste giant base64 in the body.
- **For datastore-breaking changes**, include a `BREAKING CHANGE:` block in `# Changes` listing what existing data has to be migrated.

## 3. Atomicity

One logical change per PR. If you catch yourself writing
"and also" / "while I was here" / "I noticed that" in the body, split.

| Anti-pattern                                | Do this instead                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| "Add feature X and rename old component"    | PR 1: `refactor: rename`. PR 2: `feat: X`.                             |
| "Fix bug Y and update unrelated typography" | Two PRs.                                                               |
| "Refactor 5 components into shared `Foo`"   | PR 1: introduce `Foo` + migrate 1 caller. PR 2..N: migrate the others. |

## 4. Local quality gates

From the repo root, before opening the PR:

```bash
# Always
npm run format          # prettier --write + eslint --fix
npm run lint            # prettier --check + eslint
npm run check           # svelte-check
npm run test -- --run   # vitest

# Or in one shot for the lint + format pair
npm run quality         # = format && lint

# Regenerate the typed i18n dictionary if you touched src/lib/i18n/*.json
npm run i18n

# E2E (only if you touched UI / src / static / configs)
npm run e2e
```

The CI workflow [`.github/workflows/checks.yml`](../../.github/workflows/checks.yml)
runs `format`, `lint`, `check`, `build`, and `test`. The `format` job
auto-commits prettier/eslint fixes back to your branch on PRs from
non-forks (when the bot app token is configured); you should still run
`npm run format` locally to keep diffs reviewable.

## 5. CI jobs you must keep green

| Workflow               | Job(s)           | What it runs                                                   |
| ---------------------- | ---------------- | -------------------------------------------------------------- |
| `checks.yml`           | `format`         | `npm run format`. Auto-commits prettier fixes on non-fork PRs. |
| `checks.yml`           | `lint`           | `npm run lint` (prettier `--check` + eslint).                  |
| `checks.yml`           | `check`          | `npm run check` (`svelte-check`).                              |
| `checks.yml`           | `build`          | `npm run build` (tsc --noEmit + vite build).                   |
| `checks.yml`           | `test`           | `npm run test -- --run` (vitest, single pass).                 |
| `checks.yml`           | `checks-pass`    | Aggregator — must be green to merge.                           |
| `e2e.yml`              | `e2e`            | Playwright — only runs on UI/src/config-touching PRs.          |
| `e2e.yml`              | `e2e-pass`       | Aggregator — passes when `e2e` passed _or_ was skipped.        |
| `pr-checks.yml`        | check-pr-title   | Conventional-commits regex on the PR title.                    |
| `auto-update-i18n.yml` | auto_update      | Re-runs `npm run i18n` on PRs that touch `src/lib/i18n/**`.    |
| `deploy.yml`           | deploy           | Deploys on push to `main` / tag. Don't bypass.                 |
| `snapshots.yml`        | update_snapshots | Manual-only Playwright snapshot refresh.                       |

If your change is doc-only, the `format` and `lint` jobs still run
because they cover the whole repo. The `check` and `build` jobs are
trivial for doc-only PRs.

## 6. After CI fails

- **`format` pushed a formatting commit** → pull, you're fine. Don't
  fight it. Run `npm run format` locally next time to avoid it.
- **`lint` failed** → run `npm run lint` locally. Don't silence with
  `// eslint-disable` unless you can justify it in code review. Common
  catches:
  - Relative imports across folders under `src/**` → use the path
    aliases (see
    [`frontend/structure.md`](./frontend/structure.md#imports--aliases-only)).
  - Each block missing a key → `{#each items as item (item.key)}`.
- **`check` failed** → fix `svelte-check` errors. No `// @ts-ignore`,
  no `as any`, no `as unknown as …`.
- **`test` failed** → run `npm run test -- --run` locally and fix.
  Don't `.skip` the test.
- **`checks-pass` red but children green** → the aggregator has a stale
  cache; push an empty no-op commit or rerun.
- **`e2e` failed** → download the `playwright-report` artifact from the
  job for the rendered HTML report, plus `test-results` for the trace
  files.

## 7. Updating an existing PR

- **Add commits.** Never `git push --force` to a PR branch. Don't
  `git commit --amend` after pushing. Don't rebase a PR onto `main` to
  "tidy history".
- **What counts as "the user explicitly asks":** the user names the
  operation directly — any unambiguous phrasing works. Examples that
  count: "force-push", "force push", "push --force", "push -f",
  "amend", "amend the commit", "git commit --amend", "rebase",
  "git rebase", "rewrite history", "rewrite the history". Selecting
  a multi-choice option whose label itself contains one of those
  phrases also counts. Anything else **DOES NOT** count, including:
  - "do what you think is best",
  - "do what's most correct" / "do it the idiomatic way",
  - "do it your way" / "use your judgement",
  - approval of a stacked-PR plan,
  - approval of a refactor that would "look cleaner" in the originating
    PR.

  If in doubt, **add a new commit** even if the result looks messier.
  Squash-merge tidies history at merge time; force-push destroys it.

- When the agent is offering choices, the **default** must always be the
  no-force-push option. Do not put a force-push option first, and do not
  pick a force-push option in response to delegated decisions.
- Typical legitimate reasons a user might ask for a force-push include
  removing an accidentally-committed secret (rotate the secret afterwards
  too) or recovering from a catastrophic mistake. These are illustrative,
  not an exhaustive whitelist.
- If you need to drop a commit, push a new revert commit instead.

## 8. CODEOWNERS auto-routing

[`.github/CODEOWNERS`](../../.github/CODEOWNERS) routes reviews. Agents do
not assign reviewers — the file does it.
