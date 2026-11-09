# Agent docs

Long-form pages behind [`AGENTS.md`](../../AGENTS.md). Do not read them all:
start from `AGENTS.md` and open the page its table names. The universal rules
are in the
[officina standard](https://github.com/AntonioVentilii/officina/blob/main/standards/code.md);
these pages only say what is specific to PandaMe.

```
docs/ai/
├── README.md                 this index
├── governance.md             protected and generated paths, ask-first list, meta-update map
├── pr-and-ci.md              PR title and body, local gates, CI jobs, updating a PR
├── frontend/
│   ├── README.md             pre-flight checklist and stack at a glance (start here)
│   ├── structure.md          folder taxonomy, routes, naming, aliases, where new code goes
│   ├── stack-and-patterns.md patterns with real examples, anti-patterns found in the code
│   ├── reusability.md        catalog of every shared component, service, store, util, constant, type
│   ├── a11y.md               accessibility rules
│   ├── testing.md            Vitest and Playwright conventions
│   └── workflows/
│       ├── new-component.md
│       ├── new-service.md    wiring a new escrow endpoint or service
│       ├── new-store.md
│       ├── i18n.md
│       └── regenerate-bindings.md
└── backend/
    └── README.md             the profiles canister (Rust)
```

Related docs kept where tools expect them:

- [`.agents/workflows/deployment.md`](../../.agents/workflows/deployment.md):
  local network, local escrow, deploys, production canister IDs.
- [`README.md`](../../README.md): the human-facing overview.
- [`CLAUDE.md`](../../CLAUDE.md): a pointer here for Claude Code.

These pages adapt with the code: see the
[meta-update rule](./governance.md#meta-update-rule).
