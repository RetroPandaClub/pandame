# Pandame

Pandame is a SvelteKit + [Juno](https://juno.build) starter scaffolded around a
notes + image upload datastore. It uses Internet Identity for authentication and
runs on the Internet Computer via a Juno satellite.

## 📖 Project Guidelines & AI Agent Docs

This project follows strict development patterns. AI agents (Claude Code,
Cursor, Copilot, Codex, …) and humans should start at the canonical
entry point:

- **[AGENTS.md](./AGENTS.md)** — universal entry for every AI agent.
- **[CLAUDE.md](./CLAUDE.md)** — Claude-specific runtime layer (defers to
  AGENTS.md).
- **[docs/ai/](./docs/ai/)** — long-form documentation:
  - [`docs/ai/governance.md`](./docs/ai/governance.md) — truth hierarchy,
    boundaries, capabilities, meta-update rule.
  - [`docs/ai/pr-and-ci.md`](./docs/ai/pr-and-ci.md) — PR conventions, CI
    gates, local quality gates.
  - [`docs/ai/frontend/`](./docs/ai/frontend/) — SvelteKit + Svelte 5 +
    Tailwind v4 conventions, structure, reusability catalog, a11y,
    testing.
- **[.agents/workflows/deployment.md](./.agents/workflows/deployment.md)** —
  local + production deployment runbook.
- **[.claude/rules/](./.claude/rules/)** — Claude-only quick-reference
  cards that defer to `docs/ai/`.

## ⚙️ What's inside

- **Notes datastore**: list, create and delete notes from the `notes` Juno
  collection.
- **Image storage**: upload assets into the `images` Juno storage collection
  and attach them to notes.
- **Authentication**: sign in / sign out with Internet Identity through
  `@junobuild/core-peer`.
- **i18n scaffolding**: typed dictionary generated from `src/lib/i18n/*.json`
  via `npm run i18n`.

## 🛠️ Technology Stack

- **Frontend**: [SvelteKit](https://kit.svelte.dev/) with **Svelte 5 (Runes)**.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/).
- **Backend / Storage**: [Juno](https://juno.build/) on the Internet Computer.
- **Authentication**: [Internet Identity](https://identity.ic0.app/).
- **E2E**: [Playwright](https://playwright.dev/) (multi-device snapshots).
- **Unit tests**: [Vitest](https://vitest.dev/) + jsdom.

## 📦 Project Structure

```
src/
├── app.{css,html,d.ts}     Theme tokens, base HTML, ambient types
├── custom-events.d.ts      Custom Juno DOM events typing
├── routes/                 SvelteKit shell (single layout + page)
└── lib/
    ├── components/         Svelte components (Auth, Modal, Table, …)
    ├── derived/            Derived stores
    ├── i18n/               Translation dictionaries (one JSON per locale)
    ├── stores/             Svelte stores (`*.store.ts`)
    ├── types/              TS interfaces / types (incl. generated `i18n.d.ts`)
    └── utils/              Pure helpers (`*.utils.ts` + `.spec.ts`)
```

Path aliases (declared in
[`svelte.config.js`](./svelte.config.js) and mirrored in
[`vite.config.ts`](./vite.config.ts)):

- `$lib` → `src/lib` (default SvelteKit)
- `$routes` → `src/routes`
- `$root` → repo root

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) — version pinned in
  [`.node-version`](./.node-version).
- [Juno CLI](https://juno.build/docs/miscellaneous/cli) — for deploying to a
  satellite.
- Optional: Docker — required by the local Juno emulator (`juno dev start`).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AntonioVentilii/pandame.git
   cd pandame
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Local development

1. **Start the local Juno emulator** (requires Docker):

   ```bash
   juno dev start
   ```

2. **Start the dev server** in a new terminal:

   ```bash
   npm run dev
   ```

   The app boots at <http://localhost:5173>.

### Quality gates

Before opening a PR:

```bash
npm run format    # prettier --write + eslint --fix
npm run lint      # prettier --check + eslint
npm run check     # svelte-check
npm run quality   # = format && lint, in one shot
npm run test      # vitest
npm run e2e       # playwright
```

## 🧞 Common Commands

| Command           | Action                                                 |
| :---------------- | :----------------------------------------------------- |
| `npm install`     | Install dependencies                                   |
| `npm run dev`     | Start the dev server at `http://localhost:5173`        |
| `juno dev start`  | Start the local Juno emulator (requires Docker)        |
| `npm run build`   | Type-check and build the production site to `./build/` |
| `npm run preview` | Preview the production build locally                   |
| `npm run check`   | Run `svelte-check`                                     |
| `npm run quality` | Run `format` then `lint` in one shot                   |
| `npm run test`    | Run the Vitest unit tests                              |
| `npm run e2e`     | Run the Playwright E2E suite                           |
| `npm run i18n`    | Regenerate the typed i18n dictionary                   |
| `juno deploy`     | Deploy the build output to a Juno satellite            |

## 🚀 Deploy

Production deploys are handled by the Juno satellite configured in
[`juno.config.ts`](./juno.config.ts). See the
[Juno docs](https://juno.build/docs/add-juno-to-an-app/create-a-satellite) for
how to launch a satellite and run `juno deploy`.

## ✨ Links & Resources

- [Juno documentation](https://juno.build)
- [SvelteKit documentation](https://kit.svelte.dev/)
- [Tailwind CSS documentation](https://tailwindcss.com/)
- Discuss on [Discord](https://discord.gg/wHZ57Z2RAG) or
  [OpenChat](https://oc.app/community/vxgpi-nqaaa-aaaar-ar4lq-cai/?ref=xanzv-uaaaa-aaaaf-aneba-cai).
