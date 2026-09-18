# CLAUDE.md

Claude-specific runtime layer. Anything not contradicted here defers to
[`AGENTS.md`](./AGENTS.md), which is the canonical entry for **all** agents.

> **Mandatory first step:** read [`AGENTS.md`](./AGENTS.md). Then read the
> matching area README before touching code:
>
> - Frontend → [`docs/ai/frontend/README.md`](./docs/ai/frontend/README.md)
> - On-chain backend (escrow) → [`AntonioVentilii/escrow` upstream](https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md) (locally `../escrow/src/escrow/README.md`)

---

## Project memory (quick reference)

- **What this is:** SvelteKit frontend for the standalone Escrow
  Rust canister (`umxj5-niaaa-aaaae-af2sq-cai`, mainnet). Svelte 5 runes,
  Tailwind v4, `@icp-sdk/auth` for II auth, `@dfinity/agent` +
  `@icp-sdk/canisters` for talking to the escrow + ICP ledger.
- **Default settlement token:** ICP (`ryjl3-tyaaa-aaaaa-aaaba-cai`,
  8 decimals, fee 10_000 e8s). Defined in
  [`$lib/constants/tokens.constants.ts`](./src/lib/constants/tokens.constants.ts).
- **Essential commands:** `npm run dev` · `npm run build` · `npm run check`
  · `npm run quality` · `npm run test` · `npm run e2e` ·
  `npm run did` (regenerate Candid bindings from upstream
  [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow);
  locally `../escrow/`) · `npm run i18n` (regenerate the typed
  dictionary).
- **Identity:** principal source of truth is
  [`src/lib/services/identity.services.ts`](./src/lib/services/identity.services.ts).
  Use `getIdentityOrAnonymous` for public reads (the `/claim` preview)
  and `safeGetIdentityOnce` for authenticated actions.
- **Auth:** subscribe to `onAuthStateChange` only inside
  [`Auth.svelte`](./src/lib/components/Auth.svelte) — every other
  component reads from
  [`userStore`](./src/lib/stores/user.store.ts) /
  [`userSignedIn`](./src/lib/derived/user.derived.ts).
- **Routing:** single SvelteKit page (`src/routes/+page.svelte`) plus
  `/claim/[deal_id]` for the share-link flow. No nav-store; if/when one
  is needed, surface a question first.
- **Local replica:** the satellite emulator only (`juno emulator start`, the
  one remaining Juno dependency — dev-only). **Never** run
  `dfx start`.
- **Dispute UI:** the Dispute button in
  [`DealActions.svelte`](./src/lib/components/DealActions.svelte) is a
  **stub** — the canister has no `Disputed` state yet (see
  [`AntonioVentilii/escrow#future-expansion`](https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md#future-expansion);
  locally `../escrow/src/escrow/README.md#future-expansion`).
- **Theming:** the only theme today is `light` (set via
  `<html data-theme="light">`). A future dark theme is a single-file
  change — fill the `[data-theme='dark']` block in
  [`src/app.css`](./src/app.css). Components must use the semantic
  tokens (`bg-bg`, `text-default`, `text-default-inverse`, …) —
  **no raw colours, anywhere.** That means no `bg-[#hex]`, no
  `border-[rgba(...)]`, no `shadow-[0_4px_2px_#abc]`, no inline
  `style="color:…"`, no `text-white`/`bg-black`/`border-black`
  literals, and no `dark:` utility variants. When the design needs
  a colour you don't yet have, add a token to `@theme` (and mirror
  it in `[data-theme='light']`) — even for one-off needs — then
  use it as a normal Tailwind utility. Same rule for coloured
  shadows: define a `--shadow-*` token, then `shadow-{name}`. Use
  the `/n` opacity modifier on existing tokens before inventing a
  new one (`border-shape-primary/67`, `bg-primary-stroke/32`). See
  [`docs/ai/frontend/stack-and-patterns.md#theming--dark-mode-readiness`](./docs/ai/frontend/stack-and-patterns.md#theming--dark-mode-readiness).

---

## Reasoning preferences

- **Plan briefly, then act.** For non-trivial work (>1 file or >50 lines),
  lay out a 3–6 step plan in plain text before editing files. Keep it
  tight.
- **Targeted edits.** Use `StrReplace`-style precise edits. Never rewrite
  an entire file when 5 lines change.
- **Explore in parallel.** Batch independent reads / greps / globs in a
  single tool turn. Don't serialize what can be parallel.
- **Stop and ask** if a request is ambiguous about scope, atomicity, or
  policy — better one extra question than a sprawling PR. Especially
  before:
  - Adding a new dependency (npm).
  - Adding a new top-level folder under `src/` or `src/lib/`.
  - Touching the `escrow.did` source under
    [`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow/tree/main/src/escrow)
    (locally `../escrow/src/escrow/`) — go work on the escrow repo
    first, then come back here for `npm run did`.
- Modifying `src/lib/constants/satellite.constants.ts` or
  `scripts/setup-collections.mjs` (satellite IDs + collection rules +
  emulator runner — schema drift breaks data + auth).
- Touching anything under `.github/workflows/**` or
  `.github/actions/**`.

---

## Coding rules (Claude-specific addenda)

These are on top of the [11 commandments](./AGENTS.md#2-the-11-commandments-read-before-every-change):

- **Read before edit.** Always read a file (or its relevant range) at
  least once before modifying it. The `Read` / `Grep` tools are cheap.
- **Run quality gates.** Before declaring done, run from the repo root:

  ```bash
  npm run format
  npm run lint           # prettier --check + eslint
  npm run check          # svelte-check
  npm run test -- --run  # vitest
  ```

  In one shot: `npm run quality` (format + lint).

  If you regenerated bindings (`npm run did`), commit the regenerated
  `src/declarations/escrow/**` together with the calling code change.

- **Reuse over rebuild.** Before creating a new `.svelte` / `.utils.ts`
  / `.services.ts` / `.store.ts`, search for an existing one. See
  [`docs/ai/frontend/reusability.md`](./docs/ai/frontend/reusability.md).
- **No new dependencies** without explicit user approval (`package.json`).
- **No new top-level folders** under `src/` or `src/lib/`. The taxonomy
  in [`docs/ai/frontend/structure.md`](./docs/ai/frontend/structure.md)
  is closed; surface a question instead of inventing a bucket.
- **Comments are for _why_, not _what_ — and they're terse.** Prefer
  one or two lines; reach for a multi-paragraph block only when the
  trade-off genuinely needs it. Forbidden:
- **Narrating comments** ("// fetch the user", "// loop over deals").
- **Restating the code** — type signatures, function names, bullet
  lists of every variant the code already enumerates.
- **Step-by-step walkthroughs of every branch** of a flow — name
  the invariant or the foot-gun, not the lifecycle.
- **JSDoc on self-evident exports.** Add a JSDoc block only when
  it captures intent the signature can't (e.g. "returns `undefined`
  instead of throwing so callers can render placeholders"). A
  function called `parseTokenAmount` doesn't need "Parses a token
  amount.".
  Default to one line above the binding; promote to a `/** … */`
  block only when the comment carries a real why (foot-gun,
  trade-off, invariant). If a comment grew past ~3 lines, ask
  whether it's still pointing at a why or has slid into narration.
- **No transient external references in source code.** Code (inline
  comments, JSDoc, top-of-file headers, snippet labels) must stand on
  its own. Forbidden inside `src/**`:
- **Figma:** node ids (`311:7640`), frame numbers (`219:306`),
  phrases like "per Figma" / "matches the Figma frame" /
  "Visual spec: Figma…".
- **Version pins in prose:** `v0.0.7`, `escrow v0.0.7`,
  `Escrow vN`, "as of …", "since version …".
- **RFC / PR / issue / commit refs:** `RFC-001`, `RFC 001`,
  `PR #123`, `issue #45`, raw commit hashes.
  Stable names of canister functions / variants / types
  (`consent_deal`, `sign_yes`, `DealStatus::Funded`) are fine —
  they're part of the API surface. Anything that ages (a design
  frame, a release tag, a doc revision) does not belong in source.
  Operational version pins — e.g. the `ESCROW_REF` variable in
  [`scripts/import-candid.sh`](./scripts/import-candid.sh) or the
  codegen header in `src/declarations/escrow/**` — are exceptions
  because they're config values, not narrative comments.
- **No relative parent imports under `src/**`** — use `$lib`, `$routes`,
`$root` or `$declarations`aliases (eslint enforces`import/no-relative-parent-imports`). The single tolerated exception
is the side-effect CSS import in `+layout.svelte`.
- **i18n discipline.** New user-visible copy goes through `$i18n.*` keys —
  see [`docs/ai/frontend/workflows/i18n.md`](./docs/ai/frontend/workflows/i18n.md).
- **Never push force / amend pushed commits / rewrite shared history.**
  Add a new commit instead. Approval of a broader task (e.g. "do what you
  think is best", "make the most correct one") is **NOT** approval to
  force-push — the user must name the operation directly using any
  unambiguous phrasing (e.g. "force-push", "force push", "push --force",
  "push -f", "amend", "git commit --amend", "rebase", "git rebase",
  "rewrite history"), or pick a multi-choice option whose label contains
  one of those phrases. When in doubt, add a new commit. See
  [`docs/ai/pr-and-ci.md#7-updating-an-existing-pr`](./docs/ai/pr-and-ci.md#7-updating-an-existing-pr).

---

## Tool-use cheatsheet

| Goal                          | Use                                         |
| ----------------------------- | ------------------------------------------- |
| Find files by name            | `Glob`                                      |
| Find code by exact text/regex | `Grep` (prefer over shell `rg`)             |
| Find code by meaning          | `SemanticSearch`                            |
| Read a file                   | `Read` (NOT `cat` / `head` / `tail`)        |
| Edit a file                   | `StrReplace` (NOT `sed` / `awk` / heredocs) |
| Run a one-shot command        | `Shell`                                     |
| Multi-step exploration        | `Task` with `subagent_type: "explore"`      |

---

## Personalize & evolve

> [!IMPORTANT]
> If you (the AI agent) recognize a change in project behavior, patterns,
> or requirements that differs from these instructions, you **MUST**
> proactively update the relevant doc — usually a page under
> [`docs/ai/`](./docs/ai/) — in the same PR. See the
> [meta-update rule](./docs/ai/governance.md#meta-update-rule).
> Use the legacy [`.claude/rules/`](./.claude/rules/) cards only for very
> small, Claude-only quick-references; everything substantive lives in
> `docs/ai/`.

---

## Coordination

- For role-based collaboration (planner / implementer / reviewer), follow
  [`docs/ai/governance.md`](./docs/ai/governance.md).
- For PR title, scope, body and CI gates, follow
  [`docs/ai/pr-and-ci.md`](./docs/ai/pr-and-ci.md).
- For meta-updates (changing the rules themselves), follow the
  [meta-update rule](./docs/ai/governance.md#meta-update-rule).
