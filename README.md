# PandaMe

PandaMe is a SvelteKit frontend for the standalone **Escrow** Rust
canister at [`../escrow/`](../escrow/) (mainnet
`umxj5-niaaa-aaaae-af2sq-cai`). It lets a payer lock funds against a
known recipient, share a tip link to anyone via QR / URL, and reclaim
unclaimed deals after expiry — all from a single Internet Identity
session powered by [Juno](https://juno.build).

## 📖 Project Guidelines & AI Agent Docs

This project follows strict development patterns. AI agents (Claude Code,
Cursor, Copilot, Codex, …) and humans should start at the canonical
entry point:

- **[AGENTS.md](./AGENTS.md)** — universal entry for every AI agent.
- **[CLAUDE.md](./CLAUDE.md)** — Claude-specific runtime layer (defers
  to AGENTS.md).
- **[docs/ai/](./docs/ai/)** — long-form documentation:
  - [`docs/ai/governance.md`](./docs/ai/governance.md) — truth
    hierarchy, boundaries, capabilities, meta-update rule.
  - [`docs/ai/pr-and-ci.md`](./docs/ai/pr-and-ci.md) — PR conventions,
    CI gates, local quality gates.
  - [`docs/ai/frontend/`](./docs/ai/frontend/) — SvelteKit + Svelte 5 +
    Tailwind v4 conventions, structure, reusability catalog, a11y,
    testing, plus workflows for adding components / services / stores
    / i18n keys / Candid bindings.
- **[.agents/workflows/deployment.md](./.agents/workflows/deployment.md)** —
  local + production deployment runbook.
- **[.claude/rules/](./.claude/rules/)** — Claude-only quick-reference
  cards that defer to `docs/ai/`.

## ⚙️ What's inside

- **Escrow dashboard**: list, create, fund, accept, consent, reject,
  cancel and reclaim deals against the upstream Escrow Rust canister.
- **Tip / share-link flow**: deals without a bound recipient generate a
  cryptographic claim code; the dashboard renders a copyable URL + QR
  pointing at `/claim/{deal_id}?code={claim_code}`.
- **Public claim page** (`/claim/[deal_id]`): previews the deal via
  `get_claimable_deal`, prompts II sign-in if needed, then runs
  `accept_deal` to release funds.
- **ICP balance**: the dashboard reads the caller's ICP balance from
  the NNS ledger (`ryjl3-tyaaa-aaaaa-aaaba-cai`).
- **Authentication**: Internet Identity via `@junobuild/core`.
- **Dispute affordances**: stubbed (the canister has no `Disputed`
  state yet — see
  [`../escrow/src/escrow/README.md#future-expansion`](../escrow/src/escrow/README.md#future-expansion)).
- **i18n scaffolding**: typed dictionary generated from
  `src/lib/i18n/*.json` via `npm run i18n`.

## 🛠️ Technology Stack

- **Frontend**: [SvelteKit](https://kit.svelte.dev/) with
  **Svelte 5 (Runes)**.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with the
  lavender-blue palette declared via `@theme` in
  [`src/app.css`](./src/app.css).
- **Auth**: [Juno](https://juno.build/) +
  [Internet Identity](https://identity.ic0.app/).
- **IC client**: [`@dfinity/agent`](https://github.com/dfinity/agent-js),
  [`@icp-sdk/canisters`](https://github.com/dfinity/icp-sdk-canisters)
  (ICRC-1 / -2 ledger), [`@icp-sdk/core`](https://github.com/dfinity/icp-sdk),
  [`@dfinity/utils`](https://github.com/dfinity/ic-js).
- **Bindings**: [`@icp-sdk/bindgen`](https://github.com/dfinity/icp-sdk-bindgen)
  (driven by `npm run did`).
- **E2E**: [Playwright](https://playwright.dev/) (multi-device
  snapshots).
- **Unit tests**: [Vitest](https://vitest.dev/) + jsdom.
- **QR rendering**: [`qrcode`](https://www.npmjs.com/package/qrcode).

## 📦 Project Structure

```
src/
├── app.{css,html,d.ts}     Theme tokens, base HTML, ambient types
├── custom-events.d.ts      Custom Juno DOM events typing
├── routes/                 SvelteKit shell (single dashboard + /claim/[deal_id])
├── declarations/           Generated Candid bindings (`npm run did`)
└── lib/
    ├── actors/             Shared agent / actor manager
    ├── api/                Identity-passing facades (`*.api.ts`)
    ├── canisters/          `Canister<S>` wrappers (`*.canister.ts`)
    ├── components/         Svelte components (DealsTable, CreateDealModal, …)
    ├── constants/          App-wide constants & lookup tables
    ├── derived/            Derived stores
    ├── enums/              const-object enums
    ├── env/                Vite env wrappers
    ├── i18n/               Translation dictionaries (one JSON per locale)
    ├── services/           Side-effectful orchestration (deal / balance / identity)
    ├── stores/             Writable / readable Svelte stores
    ├── types/              TS interfaces / types (incl. generated `i18n.d.ts`)
    └── utils/              Pure helpers (`*.utils.ts` + colocated `.spec.ts`)
```

Path aliases (declared in [`svelte.config.js`](./svelte.config.js) and
mirrored in [`vite.config.ts`](./vite.config.ts)):

- `$lib` → `src/lib` (default SvelteKit)
- `$declarations` → `src/declarations`
- `$routes` → `src/routes`
- `$root` → repo root

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) — version pinned in
  [`.node-version`](./.node-version).
- [Juno CLI](https://juno.build/docs/miscellaneous/cli) — for deploying
  to a satellite.
- Optional: Docker — required by the local Juno emulator
  (`juno dev start`).

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

3. (Optional) regenerate Candid bindings against the latest upstream
   `escrow.did`:

   ```bash
   npm run did
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

   The app boots at <http://localhost:5173> and talks to the escrow
   canister on mainnet (the agent dials `window.location.origin`,
   which `juno dev` proxies). PandaMe ships no Juno datastore
   collections — only II auth.

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

| Command           | Action                                                        |
| :---------------- | :------------------------------------------------------------ |
| `npm install`     | Install dependencies                                          |
| `npm run dev`     | Start the dev server at `http://localhost:5173`               |
| `juno dev start`  | Start the local Juno emulator (requires Docker)               |
| `npm run build`   | Type-check and build the production site to `./build/`        |
| `npm run preview` | Preview the production build locally                          |
| `npm run check`   | Run `svelte-check`                                            |
| `npm run quality` | Run `format` then `lint` in one shot                          |
| `npm run test`    | Run the Vitest unit tests                                     |
| `npm run e2e`     | Run the Playwright E2E suite                                  |
| `npm run did`     | Re-pull `escrow.did` from upstream and regenerate TS bindings |
| `npm run i18n`    | Regenerate the typed i18n dictionary                          |
| `juno deploy`     | Deploy the build output to a Juno satellite                   |

## 🚀 Deploy

Production deploys are handled by the Juno satellite configured in
[`juno.config.ts`](./juno.config.ts). See
[`.agents/workflows/deployment.md`](./.agents/workflows/deployment.md)
for the full local + CI deploy runbook.

## ✨ Links & Resources

- [Escrow canister docs](../escrow/src/escrow/README.md) — deal
  lifecycle, ICRC-7 NFT views, scaling roadmap.
- [Tip flow walkthrough](../escrow/TIPS.md) — sequence diagrams for
  the share-link flow.
- [Juno documentation](https://juno.build)
- [SvelteKit documentation](https://kit.svelte.dev/)
- [Tailwind CSS documentation](https://tailwindcss.com/)
- Discuss on [Discord](https://discord.gg/wHZ57Z2RAG) or
  [OpenChat](https://oc.app/community/vxgpi-nqaaa-aaaar-ar4lq-cai/?ref=xanzv-uaaaa-aaaaf-aneba-cai).
