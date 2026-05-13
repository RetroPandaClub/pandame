# PandaMe

PandaMe is a SvelteKit frontend for the standalone **Escrow** Rust
canister at
[`AntonioVentilii/escrow`](https://github.com/AntonioVentilii/escrow)
(checked out locally as `../escrow/`; mainnet
`umxj5-niaaa-aaaae-af2sq-cai`). It lets a payer lock funds against a
known recipient, share a tip link to anyone via QR / URL, and reclaim
unclaimed deals after expiry — all from a single Internet Identity
session powered by [Juno](https://juno.build). The UI is a mobile-first
"phone frame" (max-width 420 px, centred on tablet / desktop) wired to
a purple-and-green design system that's CSS-variable-themed and ready
to flip to dark mode in one file.

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

- **History dashboard** (`/`): logged-out shows a connect-wallet
  welcome screen; logged-in lists every deal the caller is on, with
  filter chips (All / Active / Settled / Refunded / Cancelled) and a
  raised "Create" button in the bottom nav.
- **Create deal flow** (`/deals/new`): full-screen Pay/Receive tabs
  for amount, currency (ICP today), counterparty principal, expiry,
  plus a stubbed dispute-jury picker. Triggers
  `create_deal → icrc2_approve(amount + fee) → fund_deal` end-to-end.
- **Deal detail** (`/deals/[deal_id]`): live amount, countdown to
  expiry, counterparty + consent state, lifecycle action bar
  (Consent / Reject / Cancel / Accept / Reclaim).
- **Tip / share-link flow**: deals without a bound recipient generate
  a cryptographic claim code; the post-create modal renders a QR + a
  copyable URL pointing at `/claim/{deal_id}?code={claim_code}`.
- **Public claim page** (`/claim/[deal_id]`): previews the deal via
  `get_claimable_deal`, prompts II sign-in if needed, then runs
  `accept_deal` to release funds.
- **Profile** (`/profile`, `/profile/edit`): editable user metadata
  (username / name / address / email) persisted in a Juno datastore
  collection (`profiles`), plus a reliability summary read from the
  escrow canister. `/profile/arbitrator` and `/profile/admin` ship
  as visual stubs for v2.
- **Dispute mockup** (`/deals/[deal_id]/dispute`): visual preview of
  the v2 dispute flow (disabled inputs + warning banner) — the
  canister has no `Disputed` state yet (see
  [`AntonioVentilii/escrow#future-expansion`](https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md#future-expansion)).
- **ICP balance**: the header pill reads the caller's ICP balance
  from the NNS ledger (`ryjl3-tyaaa-aaaaa-aaaba-cai`).
- **Authentication**: Internet Identity via `@junobuild/core`.
- **Theming**: every brand colour resolves through CSS variables, so
  a dark theme is a single-file change in
  [`src/app.css`](./src/app.css). Today only the `light` theme ships.
- **i18n scaffolding**: typed dictionary generated from
  `src/lib/i18n/*.json` via `npm run i18n`.

## 🛠️ Technology Stack

- **Frontend**: [SvelteKit](https://kit.svelte.dev/) with
  **Svelte 5 (Runes)**.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a
  purple-and-green brand palette + Poppins + a modular type scale,
  declared via `@theme` in [`src/app.css`](./src/app.css). All
  brand-aware colours are wired through CSS variables on
  `[data-theme]` so dark mode is a one-file swap.
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
├── routes/                 SvelteKit shell — multiple mobile-first routes:
│                             /, /claim/[id], /deals/{new,[id],[id]/dispute},
│                             /profile/{,,edit,arbitrator,admin}, /send
├── declarations/           Generated Candid bindings (`npm run did`)
└── lib/
    ├── actors/             Shared agent / actor manager
    ├── api/                Identity-passing facades (`*.api.ts`)
    ├── canisters/          `Canister<S>` wrappers (`*.canister.ts`)
    ├── components/         Svelte components (Button, BrandHeader, DealCard,
    │                         AppBottomNav, ShareLinkModal, …) +
    │                         components/icons/ (single-path SVGs)
    ├── constants/          App-wide constants & lookup tables
    ├── derived/            Derived stores
    ├── enums/              const-object enums
    ├── env/                Vite env wrappers
    ├── i18n/               Translation dictionaries (one JSON per locale)
    ├── services/           Side-effectful orchestration (deal / balance / profile / identity)
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
- Docker (or Podman) — required by the local Juno emulator
  (`juno emulator start`).
- The [`dfx`](https://internetcomputer.org/docs/current/developer-docs/setup/install/)
  CLI and a Rust toolchain (`rustup target add wasm32-unknown-unknown`) —
  required only the first time you set up a local replica, to build and
  deploy the upstream escrow canister into the Juno emulator. See
  [`.agents/workflows/deployment.md`](./.agents/workflows/deployment.md).

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

The Juno emulator is a **fully self-contained local IC replica** — it
does not proxy calls to mainnet. Internet Identity, the ICP ledger and
the satellite that hosts pandame's `profiles` datastore all run inside
the local Docker container. The escrow Rust canister is **not**
pre-installed there, so a working local setup needs the upstream
[`../escrow/`](../escrow/) repo built and deployed into the same local
replica.

1. **Start the local Juno emulator** (requires Docker / Podman):

   ```bash
   juno emulator start
   ```

   The IC HTTP gateway is exposed on `http://127.0.0.1:5987`; the Juno
   admin console on <http://localhost:5866>.

2. **First run only — deploy the escrow canister into the local
   replica.** Pandame's [`dfx.json`](./dfx.json) points `dfx` at the
   emulator's gateway (`--network local`) so the escrow wasm built from
   `../escrow/` lands inside the same replica the dashboard talks to:

   ```bash
   npm run dev:setup
   ```

   The script prints the assigned local canister ID; copy it into a
   `.env.local` at the repo root as `VITE_ESCROW_CANISTER_ID=<id>`.

3. **Start the dev server** in a new terminal:

   ```bash
   npm run dev
   ```

   The app boots at <http://localhost:5173>. Vite proxies `/api/*` to
   the Juno emulator, so the agent in the browser reaches the local
   replica via the same origin as the dev server. The Juno satellite
   hosts the `profiles` datastore for editable user metadata (see
   the `satellite.collections.datastore` block in
   [`juno.config.ts`](./juno.config.ts)).

> Don't run `dfx start`. Pandame's `dfx.json` is wired to use the Juno
> emulator's replica as its `local` network — running a separate
> replica on port 4943 will collide and confuse you.

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

| Command               | Action                                                                                            |
| :-------------------- | :------------------------------------------------------------------------------------------------ |
| `npm install`         | Install dependencies                                                                              |
| `npm run dev`         | Start the dev server at `http://localhost:5173`                                                   |
| `juno emulator start` | Start the local Juno emulator (requires Docker / Podman)                                          |
| `npm run dev:setup`   | Build & deploy the upstream escrow canister into the local Juno emulator (first-time local setup) |
| `npm run build`       | Type-check and build the production site to `./build/`                                            |
| `npm run preview`     | Preview the production build locally                                                              |
| `npm run check`       | Run `svelte-check`                                                                                |
| `npm run quality`     | Run `format` then `lint` in one shot                                                              |
| `npm run test`        | Run the Vitest unit tests                                                                         |
| `npm run e2e`         | Run the Playwright E2E suite                                                                      |
| `npm run did`         | Re-pull `escrow.did` from upstream and regenerate TS bindings                                     |
| `npm run i18n`        | Regenerate the typed i18n dictionary                                                              |
| `juno deploy`         | Deploy the build output to a Juno satellite                                                       |

## 🚀 Deploy

Production deploys are handled by the Juno satellite configured in
[`juno.config.ts`](./juno.config.ts). See
[`.agents/workflows/deployment.md`](./.agents/workflows/deployment.md)
for the full local + CI deploy runbook.

## ✨ Links & Resources

- [Escrow canister docs](https://github.com/AntonioVentilii/escrow/blob/main/src/escrow/README.md)
  — deal lifecycle, ICRC-7 NFT views, scaling roadmap.
- [Tip flow walkthrough](https://github.com/AntonioVentilii/escrow/blob/main/TIPS.md) — sequence diagrams for
  the share-link flow.
- [Juno documentation](https://juno.build)
- [SvelteKit documentation](https://kit.svelte.dev/)
- [Tailwind CSS documentation](https://tailwindcss.com/)
- Discuss on [Discord](https://discord.gg/wHZ57Z2RAG) or
  [OpenChat](https://oc.app/community/vxgpi-nqaaa-aaaar-ar4lq-cai/?ref=xanzv-uaaaa-aaaaf-aneba-cai).
