# Frontend Structure & Naming

The folder taxonomy is **closed**: do not add new top-level folders under
`src/lib/` (or `src/`) without explicit user approval. Place new code in
the folder that already owns the concern.

## Top level (`src/`)

```
src/
├── app.css                 Tailwind v4 entry + @theme tokens + @font-face
├── app.d.ts                Ambient SvelteKit types
├── app.html                HTML shell (mobile-first viewport, theme-color, font preloads)
├── custom-events.d.ts      Ambient custom-event types for Juno DOM events
│
├── routes/                 SvelteKit file-based routing (mobile-first)
│   ├── +layout.svelte      Phone-frame shell (max-w-[420px], safe-area, mounts <Auth />)
│   ├── +layout.ts          ssr=false, prerender=false (SPA fallback)
│   ├── +page.svelte        / — chatbot wizard (logged-in) / WelcomeScreen (logged-out)
│   │
│   ├── claim/[deal_id]/+page.svelte       /claim/[id]?code=xxx  Public claim page
│   │
│   ├── deals/
│   │   ├── new/+page.svelte               /deals/new           Create-deal full-screen form
│   │   └── [deal_id]/
│   │       ├── +page.svelte               /deals/[id]          Deal detail
│   │       └── dispute/+page.svelte       /deals/[id]/dispute  Dispute flow (stubbed v2)
│   │
│   ├── history/+page.svelte               /history             History list (FilterChip + DealCards)
│   ├── transactions/+page.svelte          /transactions        Pending / Created / Disputate tabs
│   │
│   └── profile/+page.svelte               /profile             Profile (inline editable rows)
│
├── declarations/           Generated Candid bindings (DO NOT hand-edit)
│   ├── _factory.ts
│   ├── _types.ts
│   ├── index.ts
│   └── escrow/
│
└── lib/                    Application code (cross-route)
    ├── actors/             Shared agent / actor manager (`agents.ic.ts`)
    ├── api/                Identity-passing facades (`*.api.ts`)
    ├── canisters/          `Canister<S>` wrappers (`*.canister.ts`)
    ├── components/         UI components (flat — no feature folders today)
    │   └── icons/          Inline-SVG icon components (no lucide-svelte dep yet)
    ├── constants/          App-wide constants & lookup tables (`*.constants.ts`)
    ├── derived/            Derived stores (`*.derived.ts`)
    ├── enums/              Plain TS enums / const objects (`*.ts`)
    ├── env/                Vite env wrappers (`app.env.ts`)
    ├── i18n/               Translation dictionaries (one JSON per locale)
    ├── services/           Side-effectful orchestration (`*.services.ts`)
    ├── stores/             Writable / readable Svelte stores (`*.store.ts`)
    ├── types/              TS interfaces / types (incl. generated `i18n.d.ts`)
    └── utils/              Pure helpers — no I/O, no DOM (`*.utils.ts`)
```

## Components — current inventory

`src/lib/components/` is flat (the design system is small enough). Use
the matching layer first; only create a new component when no existing
one fits.

### Primitives

- `Avatar.svelte` — round image with text-initials fallback (sm 32 / md 48 / lg 76 / xl 134 px).
- `Backdrop.svelte` — full-screen dim + optional spinner.
- `BottomNav.svelte` — rounded-top white card with the ambient lift shadow + raised centre button.
- `BrandHeader.svelte` — full-bleed coloured header (`tone="primary"` purple or `tone="success"` green) + Tabs / FilterChip slot.
- `Button.svelte` — CTA button (primary / secondary / ghost; xs 31 / sm 36 / md 40 / lg 54 px; loading state).
- `ChatBubble.svelte` — bot / user speech bubble (panda avatar + soft-bg bubble or right-aligned brand bubble).
- `ChatChoiceRow.svelte` — array-driven row of outlined / filled reply pills aligned under the bot.
- `Chip.svelte` — small chip / badge / filter pill (solid / outline / soft / success / warning / danger).
- `Countdown.svelte` — live `<time>` element ticking every second.
- `EmptyState.svelte` — dashed "nothing here yet" placeholder.
- `FilterChip.svelte` — single dropdown-style filter chip (label + funnel + chevron).
- `FormField.svelte` — label-above input wrapper. `labelFamily="sans" | "serif-ui"`.
- `IconButton.svelte` — square / circular icon-only button (4 variants × 3 sizes).
- `InfoLink.svelte` — info-icon + Poppins Light 15 px link ("Do you need help?").
- `Modal.svelte` — generic dialog shell (title / children / footer + Esc to close).
- `Money.svelte` — formatted token amount (signed / colorize / sm / md / lg).
- `PandaBotAvatar.svelte` — lavender disc with the panda silhouette (chat-bubble face).
- `PandaMark.svelte` — brand mark (panda in a lavender squircle, real artwork from `static/brand/panda.png`).
- `ProfileFieldRow.svelte` — label-left / green-value-right inline-editable row.
- `Sheet.svelte` — white off-white card with `rounded-t-[40px]` sliding over the BrandHeader.
- `Tabs.svelte` — generic segmented control `<T extends string>` (matches Toggle Pay/Receive).
- `TermsCheckbox.svelte` — 14×14 checkbox with multi-color label.
- `TextInput.svelte` — themed `<input>` (41 px h, 8 px radius, 1.5 px light-purple border, `variant="default" | "active"`).
- `UploadCTA.svelte` — purple "Choose files to upload" + "Zip, Jpg or Pdf …" caption pair.
- `VoteQuorumPicker.svelte` — concentric Roboto rings 3-radio picker.

### Composed

- `AppBottomNav.svelte` — wires `BottomNav` to /transactions · / · /profile.
- `Auth.svelte` — behaviour-only: subscribes to `onAuthStateChange`.
- `AuthGuard.svelte` — behaviour-only redirect guard for logged-in routes.
- `DealActions.svelte` — context-aware action bar (Consent / Reject / Cancel / Accept / Reclaim / Dispute).
- `DealCard.svelte` — single-deal preview (purple title bar + status icon + signed amount + countdown + optional inline `actions` snippet).
- `DealStatusIcon.svelte` — 24 px circular status badge (check / cross / dot / swap / refresh).
- `DealsTable.svelte` — list wrapper (loading / empty / `<ul>` of `DealCard` links).
- `Login.svelte` — Internet Identity sign-in button (forwards `fullWidth` / `size` / `label`).
- `LogoutConfirmModal.svelte` — sign-out confirmation (solid `#3B2370` backdrop, both purple CTAs).
- `ShareLinkModal.svelte` — post-create QR + copyable share link.
- `UserPrincipalBadge.svelte` — short-principal + Avatar pair for the BrandHeader trailing slot.
- `WelcomeScreen.svelte` — full-screen logged-out connect-wallet hero.

### Icons (`components/icons/`)

`BackIcon`, `ChevronDownIcon`, `FilterIcon`, `HomeIcon`, `InfoIcon`,
`PencilIcon`, `PlusIcon`, `ProfileIcon`, `SwapIcon`. Each is a single
24-viewBox stroked path keyed by `currentColor`. Add new icons as
their own files; consider `lucide-svelte` once we cross ~12.

## Naming conventions

Strict — eslint / svelte-check enforce only some of this.

### File suffixes

| Suffix               | Meaning                                            | Example                           |
| -------------------- | -------------------------------------------------- | --------------------------------- |
| `*.svelte`           | Component (PascalCase filename)                    | `DealCard.svelte`, `Modal.svelte` |
| `*.canister.ts`      | IC actor wrapper extending `Canister<S>`           | `escrow.canister.ts`              |
| `*.api.ts`           | Identity-passing facade over a `*.canister.ts`     | `escrow.api.ts`                   |
| `*.services.ts`      | Side-effectful orchestration                       | `deal.services.ts`                |
| `*.store.ts`         | Svelte store factory                               | `deals.store.ts`                  |
| `*.derived.ts`       | Derived Svelte store                               | `deals.derived.ts`                |
| `*.constants.ts`     | App-wide constants & lookup tables                 | `tokens.constants.ts`             |
| `*.utils.ts`         | Pure helpers                                       | `format.utils.ts`                 |
| `*.spec.ts`          | Vitest spec, colocated next to the file under test | `format.utils.spec.ts`            |
| `*.test.ts`          | Playwright E2E spec under `e2e/`                   | `homepage.test.ts`                |
| `*.ts` (in `types/`) | Interfaces / types                                 | `deal.ts`, `token.ts`             |
| `*.ts` (in `enums/`) | Plain TS enums / const objects                     | `deal-status.ts`                  |

### Casing

| Thing                    | Style                         | Example                     |
| ------------------------ | ----------------------------- | --------------------------- |
| `.svelte` filename       | `PascalCase`                  | `DealCard.svelte`           |
| `.ts` filename           | `kebab-case` (or single word) | `deal.services.ts`          |
| Folder                   | `kebab-case` (or single word) | `components/`, `canisters/` |
| Component name           | `PascalCase`                  | `DealCard`, `BrandHeader`   |
| TS type / interface      | `PascalCase`                  | `Deal`, `DealSide`          |
| Function / variable      | `camelCase`                   | `createAndFundDeal`         |
| Constant export          | `SCREAMING_SNAKE`             | `ESCROW_CANISTER_ID`        |
| Test ID / data attribute | `kebab-case`                  | `data-tid="deal-card"`      |

### Time variables — `_ms` / `_ns`

Time values must carry their unit in the variable name:

- **`_ms`** — milliseconds (default for business logic).
- **`_ns`** — nanoseconds (canister-boundary fields like `expires_at_ns`,
  `created_at_ns` — match the generated Candid field names).

Use `nsToDate` / `msToNs` from
[`format.utils.ts`](../../../src/lib/utils/format.utils.ts) when
crossing units.

### Imports — aliases only

`import/no-relative-parent-imports` is **`error`** under `src/**`. Use
the path aliases declared in
[`svelte.config.js`](../../../svelte.config.js):

| Alias           | Path               |
| --------------- | ------------------ |
| `$lib`          | `src/lib`          |
| `$declarations` | `src/declarations` |
| `$routes`       | `src/routes`       |
| `$root`         | repo root          |

Single tolerated exception: the side-effect CSS import in
[`+layout.svelte`](../../../src/routes/+layout.svelte) (`import '../app.css'`)
which carries an inline `eslint-disable-next-line`.

### Forbidden imports / patterns

- Relative imports across folders (`../../...`) under `src/**`.
- Hand-edits to `src/lib/types/i18n.d.ts` — generated by `npm run i18n`.
- Hand-edits to anything under `src/declarations/escrow/` — generated
  by `npm run did`.
- Hand-edits to `static/workers/**` — synced from `@junobuild/core`
  by `npm run postinstall`.
- Importing from `$declarations/**` outside of `$lib/{api,canisters}/` —
  re-export through `$lib/types/` and `$lib/api/` so callers don't
  depend on the generated layer.
- Hex literals or arbitrary `bg-[#...]` classes — use the design tokens
  in `src/app.css` (`bg-primary`, `text-default`, `border-soft`, …).
  See [stack-and-patterns.md](./stack-and-patterns.md#tailwind-v4--design-tokens).
- Raw `text-white` / `bg-white` / `bg-black` / `border-black` in
  component markup — use the inverse / surface tokens
  (`text-default-inverse`, `bg-bg`, `bg-bg-elevated`, `bg-bg-inverse`,
  `border-default`) so dark mode flips correctly.
- Tailwind `dark:` utility variants. Dark mode is wired via CSS-variable
  swap on `[data-theme='dark']` in [`src/app.css`](../../../src/app.css);
  per-utility `dark:` classes bypass that and break theme switching.

## Where to put new files (decision tree)

1. **New URL?** Add a `src/routes/<segment>/+page.svelte`. Mobile-first
   layout = wrap content in `BrandHeader` + content section + `AppBottomNav`.
2. **UI component?** → `$lib/components/<Name>.svelte`. Look at
   the existing inventory first; reach for primitives before composing.
3. **New icon?** → `$lib/components/icons/<Name>Icon.svelte`. Single
   24-viewBox stroked path keyed by `currentColor`.
4. **Side-effectful business logic?** → `*.services.ts` under
   `$lib/services/`.
5. **New canister endpoint?** → bump `$lib/canisters/escrow.canister.ts`
   - the matching `$lib/api/escrow.api.ts` facade. New canister
     entirely → see
     [`workflows/regenerate-bindings.md`](./workflows/regenerate-bindings.md).
6. **Svelte store?** → `*.store.ts` under `$lib/stores/`.
7. **Derived store?** → `*.derived.ts` under `$lib/derived/`.
8. **Pure helper?** → `*.utils.ts` under `$lib/utils/` plus a
   colocated `*.spec.ts`.
9. **TypeScript type / interface?** → `$lib/types/<name>.ts`.
10. **Constant / lookup table?** → `*.constants.ts` in
    `$lib/constants/`, or a const-object enum in `$lib/enums/`.
11. **Translation key?** → add to every `src/lib/i18n/<locale>.json`
    (today: `en.json`) and run `npm run i18n`.
12. **Generated?** → don't create it by hand. Run the generator
    (`npm run did` for Candid, `npm run i18n` for `i18n.d.ts`).
13. **None of the above?** → ask. Don't invent a folder.
