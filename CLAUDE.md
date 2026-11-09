# CLAUDE.md

Claude Code reads this file; every rule for this repository lives in
[`AGENTS.md`](./AGENTS.md) and the pages it links under
[`docs/ai/`](./docs/ai/README.md). Read `AGENTS.md` first, then the page its
"You are about to..." table names for your task. Nothing here overrides them.

Claude-specific notes only:

- **Tools.** Find files with `Glob`, exact text with `Grep`, code by meaning
  with the semantic search tool when available; read with `Read`, change with
  `Edit` (targeted edits, never a whole-file rewrite for a small change); run
  commands with `Bash`; hand broad read-only exploration to an `Explore`
  subagent and batch independent reads in one turn.
- **Before declaring done**, run the gates in
  [`pr-and-ci.md`](./docs/ai/pr-and-ci.md#4-local-quality-gates).
- **When something here, in `AGENTS.md` or in `docs/ai/` turns out wrong**,
  fix the doc in the same PR ([meta-update rule](./docs/ai/governance.md#meta-update-rule)).
