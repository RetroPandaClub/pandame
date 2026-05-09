# AI Agents Documentation

This is the long-form documentation that backs the agent entry points
([`AGENTS.md`](../../AGENTS.md), [`CLAUDE.md`](../../CLAUDE.md), and the
legacy [`.claude/rules/`](../../.claude/rules/) cards).

If you are an agent: do **not** read everything. Read the entry point first
(`AGENTS.md`), then jump to the specific page you need.

## Map

```
docs/ai/
├── README.md                    ← you are here
├── governance.md                Truth hierarchy, boundaries, capabilities, meta-update rule
├── pr-and-ci.md                 PR title regex, body template, CI cheatsheet, local gates
└── frontend/
    ├── README.md                Frontend bootstrap (start here for any FE change)
    ├── structure.md             Folder taxonomy, naming, aliases
    ├── stack-and-patterns.md    Svelte 5 (runes), TS, Tailwind v4, Juno + escrow usage
    ├── reusability.md           Catalog of components / services / api / canisters / stores / utils
    ├── a11y.md                  Accessibility rules
    ├── testing.md               Vitest + Playwright policy and conventions
    └── workflows/
        ├── new-component.md
        ├── new-service.md
        ├── new-store.md
        ├── regenerate-bindings.md
        └── i18n.md
```

## Audience

- **AI agents** (Claude Code, Cursor, Copilot, Codex, Aider, opencode, …).
- **Humans** giving instructions to those agents — including non-engineers
  writing prompts for small visual / copy / refactor PRs.

## Maintenance — auto-adapting

These docs **must auto-adapt**. When you (agent or human) introduce a new
pattern, naming convention, shared component, shared type, or workflow,
update the relevant page in the **same PR** as the code change. See the
[meta-update rule](./governance.md#meta-update-rule).

## Relationship to the legacy `.claude/rules/`

The repository also keeps Claude-specific guidance under
[`.claude/rules/`](../../.claude/rules/) and operational runbooks under
[`.agents/workflows/`](../../.agents/workflows/):

- `.claude/rules/*.md` — short Claude-only quick-reference cards. Defer to
  the matching `docs/ai/**` page; only Claude-specific tweaks live there.
- `.agents/workflows/*.md` — operational runbooks (e.g. local deploy).

If two pages disagree, the page under `docs/ai/` wins (see the
[truth hierarchy](./governance.md#truth-hierarchy)).
