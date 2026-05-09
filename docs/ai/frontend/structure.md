# Frontend Structure & Naming

The folder taxonomy is **closed**: do not add new top-level folders under
`src/lib/` (or `src/`) without explicit user approval. Place new code in
the folder that already owns the concern.

## Top level (`src/`)

```
src/
├── app.css                 Tailwind v4 entry + @theme tokens + JetBrains Mono @font-face
├── app.d.ts                Ambient SvelteKit types
├── app.html                HTML shell
├── custom-events.d.ts      Ambient custom-event types for Juno DOM events
│
├── routes/                 SvelteKit file-based routing
│   ├── +layout.svelte      Auth shell + global UI
│   ├── +layout.ts          ssr=false, prerender=false (SPA fallback)
│   └── +page.svelte        Hosts the notes table + create modal
│
└── lib/                    Application code (cross-route)
    ├── components/         UI components
    ├── derived/            Derived stores (`*.derived.ts`)
    ├── i18n/               Translation dictionaries (one JSON per locale)
    ├── stores/             Writable / readable Svelte stores (`*.store.ts`)
    ├── types/              TS interfaces / types (incl. generated `i18n.d.ts`)
    └── utils/              Pure helpers — no I/O, no DOM (`*.utils.ts`)
```

### Components — current inventory

`src/lib/components/` is flat today (no feature folders). Look here before
creating a new component:

- `Auth.svelte` — auth wrapper that subscribes to `onAuthStateChange` and
  renders `Login` / `Logout` + the children.
- `Backdrop.svelte` — dimmed overlay with optional spinner.
- `Background.svelte` — decorative right-side illustration.
- `Button.svelte` — themed CTA button used across the app.
- `Delete.svelte` — inline delete control for a note (handles both the
  doc and its attached image asset).
- `Footer.svelte` — page footer with brand + social links.
- `Login.svelte` — sign-in CTA (Internet Identity).
- `Logout.svelte` — sign-out button.
- `Modal.svelte` — modal shell hosting the new-note form (text + image).
- `Table.svelte` — notes list, refreshes on `junoExampleReload` events.

If you add a new feature, prefer extending one of the above. Only create a
new component when no neighbour fits.

## Naming conventions

These are **strict**. ESLint / `svelte-check` do not enforce all of them,
so agents must.

### File suffixes

| Suffix               | Meaning                                               | Example                              |
| -------------------- | ----------------------------------------------------- | ------------------------------------ |
| `*.svelte`           | Component (PascalCase filename)                       | `Modal.svelte`, `Table.svelte`       |
| `*.svelte.ts`        | Module that uses Svelte 5 runes outside a component   | _(rare today; introduce as needed)_  |
| `*.store.ts`         | Writable / readable Svelte store factory              | `user.store.ts`, `i18n.store.ts`     |
| `*.derived.ts`       | Derived Svelte store                                  | `user.derived.ts`                    |
| `*.utils.ts`         | Pure helpers — no I/O, no side effects, no DOM access | `storage.utils.ts`                   |
| `*.spec.ts`          | Vitest spec, colocated next to the file under test    | `storage.utils.spec.ts`              |
| `*.test.ts`          | Playwright E2E spec under `e2e/`                      | `homepage.test.ts`                   |
| `*.ts` (in `types/`) | Interfaces / types                                    | `note.ts`, `user.ts`, `languages.ts` |

### Casing

| Thing                    | Style                         | Example                         |
| ------------------------ | ----------------------------- | ------------------------------- |
| `.svelte` filename       | `PascalCase`                  | `Modal.svelte`                  |
| `.ts` filename           | `kebab-case` (or single word) | `storage.utils.ts`, `user.ts`   |
| Folder                   | `kebab-case` (or single word) | `components/`, `stores/`        |
| Component name           | `PascalCase`                  | `Modal`, `Table`                |
| TS type / interface      | `PascalCase`                  | `Note`, `Language`              |
| Function / variable      | `camelCase`                   | `userStore`, `automaticSignOut` |
| Constant export          | `SCREAMING_SNAKE`             | `DEFAULT_LANGUAGE`              |
| Test ID / data attribute | `kebab-case`                  | `data-tid="add-note"`           |

### Imports — aliases only

Pandame's eslint config sets `import/no-relative-parent-imports` to
**`error`** under `src/**`. Use the path aliases declared in
[`svelte.config.js`](../../../svelte.config.js):

| Alias     | Path         |
| --------- | ------------ |
| `$lib`    | `src/lib`    |
| `$routes` | `src/routes` |
| `$root`   | repo root    |

```ts
import { i18n } from '$lib/stores/i18n.store';
import type { Note } from '$lib/types/note';
import { userSignedIn } from '$lib/derived/user.derived';
```

The single tolerated exception is the side-effect CSS import in
[`src/routes/+layout.svelte`](../../../src/routes/+layout.svelte):

```svelte
<script lang="ts">
	// eslint-disable-next-line import/no-relative-parent-imports
	import '../app.css';
</script>
```

Don't introduce new exceptions — surface a question instead.

### Forbidden imports / patterns

- Relative imports across folders (`../../...`) under `src/**` (eslint
  `import/no-relative-parent-imports`).
- Hand-edits to `src/lib/types/i18n.d.ts` — generated by
  `npm run i18n` from `src/lib/i18n/*.json`.
- Hand-edits to `static/workers/**` — synced from `@junobuild/core` by
  `npm run postinstall`.

## Where to put new files (decision tree)

1. **Is it a route?** No new SvelteKit routes — Pandame is a
   single-route SPA. Drop new UI as components and mount them in
   `src/routes/+page.svelte` (or `+layout.svelte` if it's chrome).
2. **Is it a UI component?** → `$lib/components/<Name>.svelte`. Look at
   the existing inventory first.
3. **Is it a Svelte store?** → `*.store.ts` under `$lib/stores/`.
4. **Is it a derived store?** → `*.derived.ts` under `$lib/derived/`.
5. **Is it a pure helper?** → `*.utils.ts` under `$lib/utils/` plus a
   colocated `*.spec.ts`.
6. **Is it a TypeScript type / interface?** → `$lib/types/<name>.ts`.
7. **Is it a translation key?** → add to every `src/lib/i18n/<locale>.json`
   (today: `en.json`) and run `npm run i18n` to regenerate the typed
   dictionary. See [`workflows/i18n.md`](./workflows/i18n.md).
8. **None of the above?** → ask. Don't invent a folder.
