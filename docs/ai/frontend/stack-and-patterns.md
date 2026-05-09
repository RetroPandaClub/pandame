# Stack & Patterns

Idiomatic patterns for the **SvelteKit 2 + Svelte 5 + TypeScript +
Tailwind v4 + Juno + Escrow canister** stack as it lives in this repo.
If a pattern here disagrees with code in `src/`, the code wins (truth
hierarchy in [governance.md](../governance.md)). Update this page in the
same PR — that's the
[meta-update rule](../governance.md#meta-update-rule).

## Svelte 5 — runes everywhere

This project is **Svelte 5** and uses runes for new code:

| Use (new code)                                                                                     | Don't use (Svelte 4 style)                    |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Separate `interface Props { … }` + `let { … }: Props = $props()` (see [Props shape](#props-shape)) | `export let foo`                              |
| `let count = $state(0)`                                                                            | plain `let` for component-local reactive vars |
| `let total = $derived(price * qty)`                                                                | `$: total = price * qty`                      |
| `let label = $derived.by(() => …)`                                                                 | imperative effect-driven assignment           |
| `$effect(() => { /* I/O */ })`                                                                     | side-effect via `$:`                          |
| `<button onclick={fn}>`                                                                            | `on:click`                                    |
| `{#snippet}` + `{@render}`                                                                         | named `<slot>` for new code                   |

### Props shape

Always declare props as a **named `interface Props`** above the
destructuring, declared **inside** the component file. Real example from
[`DealRow.svelte`](../../../src/lib/components/DealRow.svelte):

```svelte
<script lang="ts">
	import type { Deal } from '$lib/types/deal';

	interface Props {
		deal: Deal;
	}

	let { deal }: Props = $props();
</script>
```

Rules:

- One `interface Props` per component, declared at the top of the
  `<script>` after imports.
- Required props first, optional / defaulted ones after.
- Callbacks default to a no-op (`() => {}`) so callers can omit them.
- **Avoid `$bindable`** unless explicitly required. Prefer callback props
  (`oncreated`, `onclose`).
- Do **not** inline the type literal into `$props()` for new code — use a
  named `interface Props`.
- For `Button`, the `onclick` signature is intentionally
  `() => void | Promise<void>` so synchronous handlers (e.g. opening a
  modal) compile.

### Effect hygiene

- Never read state inside an `$effect` and write it back without a guard —
  it loops. Restructure to `$derived` whenever possible.
- Prefer `$derived` over `$effect`. An `$effect` is for I/O (DOM, network,
  `setInterval`); computation belongs in `$derived` / `$derived.by`.
- When TypeScript can't narrow across a `$derived` arrow boundary, use
  `$derived.by(() => …)` and pull the value into a local `const`
  before branching — see the claim page for the canonical example.

### Stores still exist

Svelte stores (`writable` / `readable` / `derived` from `svelte/store`)
remain the primary cross-route reactive primitive in this repo. The
graph under `$lib/stores/` and `$lib/derived/` is the source of truth
for cross-component state — extend it instead of inventing a parallel
runes-only world.

## TypeScript

- **No `any`.** Use `unknown` and narrow.
- **No `as unknown as X`** to launder types. Either fix the type, or write
  a narrowing function.
- **No non-null assertion (`!`)** on values that can actually be null —
  use `isNullish` / `nonNullish` from `@dfinity/utils`, optional chaining,
  or an explicit guard with an early return.
- **`EscrowDid` types are the source of truth at the canister boundary.**
  Re-export them through `$lib/types/deal.ts` so app code doesn't import
  from `$declarations/**` outside `$lib/{api,canisters}/`.
- **Variant unwrapping.** Generated Candid variants look like
  `{ Funded: null }` — use the `dealStatus` / `consentState` helpers in
  [`deal.utils.ts`](../../../src/lib/utils/deal.utils.ts) instead of
  hand-written `Object.keys` calls.
- **Optional Candid fields.** `[] | [T]` from bindgen — wrap with
  `fromNullable` / `toNullable` from `@dfinity/utils`. Never use
  `value[0]` directly.
- **Type imports**: prefer `import type { … }` for types-only;
  `prettier-plugin-organize-imports` will sort them.

## Service / data flow

```
Component (.svelte)
  ↳ $lib/services/*.services.ts          orchestration + identity wiring + error handling
       ↳ $lib/api/*.api.ts               identity-passing facade
            ↳ $lib/canisters/*.canister.ts    typed actor wrappers (Canister<S>)
                 ↳ $lib/actors/agents.ic.ts   shared AgentManager
                      ↳ @dfinity/agent / @icp-sdk/canisters
```

- Components **do not** call `EscrowCanister.create` / the
  `@dfinity/agent` actor / `IcrcLedgerCanister` directly. Always go
  through the matching service module.
- A `*.services.ts` function should:
  - Accept a typed input.
  - Pull identity via
    [`safeGetIdentityOnce`](../../../src/lib/services/identity.services.ts)
    for authenticated actions or `getIdentityOrAnonymous` for public
    reads.
  - Surface errors by throwing a useful `Error` (the canister wrapper's
    `unwrap()` already JSON-stringifies the typed `EscrowError`).
- Worker-bound logic (auth workers) lives under `static/workers/` and is
  synced by `npm run postinstall`. Don't hand-edit those files.

Example shape (from
[`deal.services.ts`](../../../src/lib/services/deal.services.ts)):

```ts
export const createAndFundDeal = async (
	request: CreateDealRequest
): Promise<{ created: EscrowDid.DealView; funded: EscrowDid.DealView }> => {
	const identity = await safeGetIdentityOnce();
	const token = request.token ?? ICP_TOKEN;

	const created = await escrowApi.createDeal({ identity, params: { …request } });

	await ledgerApi.approve({
		identity,
		ledgerCanisterId: token.ledgerCanisterId,
		amount: request.amount + token.fee,
		spender: { owner: ESCROW_CANISTER_ID, subaccount: created.escrow_subaccount },
		expiresAt: request.expires_at_ns
	});

	const funded = await escrowApi.fundDeal({ identity, dealId: created.id });

	return { created, funded };
};
```

## Identity & auth

- Principal source of truth:
  [`identity.services.ts`](../../../src/lib/services/identity.services.ts).
- Use `getIdentityOrAnonymous` for public reads (the `/claim` preview).
- Use `safeGetIdentityOnce` for authenticated actions (throws if the
  user isn't signed in).
- Auth uses Internet Identity via Juno. The single subscription to
  `onAuthStateChange` lives in
  [`Auth.svelte`](../../../src/lib/components/Auth.svelte). Other
  components read from
  [`userStore`](../../../src/lib/stores/user.store.ts) and the
  [`userSignedIn` / `userNotSignedIn`](../../../src/lib/derived/user.derived.ts)
  derived stores.
- `signIn` requires the provider object:
  `signIn({ internet_identity: {} })`.
- `signOut` accepts `SignOutOptions` — wrap it in an arrow function when
  binding to `onclick`: `onclick={() => signOut()}`.
- Auth worker assets must be synced via `npm run postinstall` to
  `./static/workers` — otherwise sign-in silently breaks.

## Talking to the escrow canister

- One canister wrapper per upstream canister. Today: `EscrowCanister`
  ([`canisters/escrow.canister.ts`](../../../src/lib/canisters/escrow.canister.ts)).
- One api facade per canister wrapper. Today:
  [`api/escrow.api.ts`](../../../src/lib/api/escrow.api.ts).
- The wrapper internal `unwrap()` turns the canister's `{ Ok | Err }`
  into a thrown `Error` with the JSON-stringified variant. Components
  catch it via the standard `try/catch` + UI error state.
- Both `idlFactoryEscrow` (normal) and `idlFactoryCertifiedEscrow`
  (queries-as-updates) are wired so `@dfinity/utils`'s `Canister<S>`
  knows when to certify a query.

## ICRC-1 / -2 ledger

- `IcrcLedgerCanister` from `@icp-sdk/canisters/ledger/icrc` is the
  canonical wrapper. Don't redeclare it. The api facade is
  [`api/icrc-ledger.api.ts`](../../../src/lib/api/icrc-ledger.api.ts).
- The deal funding flow is **always** create → `icrc2_approve(amount + fee)`
  → `fund_deal`. The fee headroom matters: without it,
  `transfer_from` will fail on the ledger because the spender (the
  escrow canister) needs both the `amount` and the `fee` available.
- Pandame ships a single token today (`ICP_TOKEN`,
  `ryjl3-tyaaa-aaaaa-aaaba-cai`, 8 decimals, fee 10_000 e8s). Add new
  tokens to `$lib/constants/tokens.constants.ts` (and call out the
  reason in the PR), don't sprinkle hex literals across the codebase.

## Tailwind v4 + design tokens

Pandame uses Tailwind v4. There is **no `tailwind.config.ts`**.

- **Theme tokens** live in [`src/app.css`](../../../src/app.css) inside
  an `@theme` block. The block opens with `--color-*: initial;` — only
  the colours enumerated in `@theme` are available. To use a new
  colour, **add it to `@theme`** (and call it out in the PR), don't
  reach for arbitrary `bg-[#hex]`.

  Brand palette (semantic — always reach for these first):

  | Token           | Hex       | Use it for                                |
  | --------------- | --------- | ----------------------------------------- |
  | `primary`       | `#632AE8` | CTAs, headings emphasis, brand chrome.    |
  | `primary-light` | `#D5C4F9` | Soft chips, status backgrounds, dividers. |
  | `success`       | `#1DBB8E` | Settled deals, positive outcomes.         |
  | `success-light` | `#29E8B1` | Subtle success accents.                   |
  | `warning`       | `#F3A712` | "Coming soon" notices, refunded state.    |
  | `danger`        | `#E64545` | Errors, cancelled / rejected state.       |

  Surface / text / border tokens (full list in `src/app.css`):
  `bg`, `bg-soft`, `bg-inverse`, `default`, `default-inverse`,
  `muted`, `subtle`, `border`, `border-soft`, `border-strong`.

- **Typography** is the modular scale base 16 / ratio 1.25 — utilities
  are `text-{xxs,body2,body1,h6,h5,h4,h3,h2,h1}` with paired
  `--text-*--line-height` tokens. Default font is **Poppins**
  (self-hosted woff2 in `static/fonts/`, weights 400 / 600 / 700 /
  900), with `JetBrains Mono` available as `--font-mono` for
  principal / amount displays.

- **Radii** match the Figma's pill-heavy CTA pattern: `rounded-sm`
  (8 px), `rounded-md` (12 px), `rounded-lg` (16 px), `rounded-xl`
  (20 px), `rounded-pill` (9999 px).

- **No raw hex** (`bg-[#0f0]`), no inline `style="color:…"`, **no
  `text-white` / `bg-black` / `border-black` literals** in component
  markup — those bypass the theme. Use the inverse tokens
  (`text-default-inverse`, `bg-bg-inverse`) when you need the
  light-on-brand pattern (e.g. `bg-primary text-default-inverse`).
  Arbitrary values are tolerated for non-colour props (e.g.
  `shadow-[5px_5px_0px_rgba(0,0,0,1)]`) but prefer a named token when
  you can.
- **Class order** is auto-sorted by `prettier-plugin-tailwindcss`. Don't
  bikeshed it.
- **Variants & responsive:** prefer Tailwind variants (`md:`, `tall:`)
  over JS branches. Don't add `dark:` overrides — dark mode is wired via
  CSS-variable swap on `[data-theme='dark']` (see [Theming
  &amp; dark-mode readiness](#theming--dark-mode-readiness) below), not
  via per-utility variants. Pandame is **mobile-first** — design at
  375 × 812 (iPhone 13 mini) and let `md:` / `lg:` add desktop polish.

### Theming & dark-mode readiness

Every brand-aware token is declared **twice** in
[`src/app.css`](../../../src/app.css):

1. As a **compile-time default** inside `@theme { … }` so Tailwind
   generates the utilities (`bg-primary`, `text-default`, …) that
   resolve to `var(--color-*)` at runtime.
2. As a **runtime value** inside `:root, [data-theme='light'] { … }` so
   the cascade can be flipped without a rebuild.

A future dark theme is a **single-file change**: fill in the values in
the `[data-theme='dark']` block (already scaffolded with a commented
template) and the `@media (prefers-color-scheme: dark)` rule that
mirrors them when the user hasn't picked a theme. No component touches
the literal palette, so no component needs to change.

Today `<html data-theme="light">` is hard-coded in
[`src/app.html`](../../../src/app.html); the toggle / preference store
will be added with the dark theme. While building light-mode UI, **just
use the semantic tokens** — the moment a `text-default` lands on top of
a `bg-bg`, it'll swap correctly the day dark values arrive.

## Mobile-first device frame

The root layout
([`+layout.svelte`](../../../src/routes/+layout.svelte)) wraps every
page in a `max-w-[420px]` device frame centred on tablet / desktop and
edge-to-edge on phones:

```svelte
<div class="bg-bg-soft min-h-[100dvh] pb-[env(safe-area-inset-bottom)]">
	<div class="bg-bg shadow-primary/10 mx-auto flex min-h-[100dvh] max-w-[420px] flex-col shadow-xl">
		{@render children()}
	</div>
</div>
```

- Outer is `bg-bg-soft` (lavender wash); inner device frame is `bg-bg`
  (white) with a soft purple shadow so it reads as a card on desktop.
- The frame is a **flex column** so pages can use `mt-auto` to push
  content (e.g. a Sign-out button) to the bottom of the viewport.
- The bottom-nav uses `sticky bottom-0` + `mt-auto` so it docks inside
  the frame on tall screens but flows naturally on short ones.

A typical authenticated page composes:

```svelte
<BrandHeader title="…">
	{#snippet leading()}<IconButton>back</IconButton>{/snippet}
	{#snippet trailing()}<Avatar />{/snippet}
	<DealFilterChips bind:value={filter} />
</BrandHeader>

<section class="flex flex-1 flex-col gap-4 px-6 pt-6 pb-28">
	<!-- page content; pb-28 leaves room for AppBottomNav -->
</section>

<AppBottomNav />
```

A logged-out / public page (welcome, claim) drops `AppBottomNav` and
typically uses a centred column instead.

## Routing

Pandame ships several mobile-first routes wrapped in the shared device
frame (see [structure.md](./structure.md#top-level-src) for the full
tree):

| Route                      | What                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| `/`                        | Logged-out → `WelcomeScreen`; logged-in → History dashboard.        |
| `/deals/new`               | Create-deal full-screen flow with Pay/Receive tabs.                 |
| `/deals/[deal_id]`         | Per-deal detail with the lifecycle action bar.                      |
| `/deals/[deal_id]/dispute` | Dispute mockup (v2 stub — disabled inputs + warning banner).        |
| `/profile`                 | User profile (avatar + reliability + sign-out).                     |
| `/profile/edit`            | Editable user metadata persisted to the Juno `profiles` collection. |
| `/profile/arbitrator`      | Arbitrator dashboard preview (v2 stub).                             |
| `/profile/admin`           | Admin console preview (v2 stub).                                    |
| `/send`                    | Direct send/receive (v2 stub).                                      |
| `/claim/[deal_id]?code=…`  | Public claim page for the QR / share-link flow.                     |

`src/routes/+layout.ts` sets `ssr = false` and `prerender = false`
(SPA fallback via `adapter-static`). Deeply-linked routes work because
the static fallback serves the same shell.

Auth-gated routes (everything except `/` logged-out and `/claim`) call
`goto('/')` from an `$effect` when `userSignedIn` flips false, so
direct URL hits route the user back to the welcome screen.

Don't add new SvelteKit routes without a deliberate reason — surface
the ask first.

## i18n

Pandame ships a typed-i18n layer. The runtime store is
[`$lib/stores/i18n.store.ts`](../../../src/lib/stores/i18n.store.ts);
the typed shape is generated into
[`$lib/types/i18n.d.ts`](../../../src/lib/types/i18n.d.ts) by
`npm run i18n` from `src/lib/i18n/<locale>.json`.

- **Add a key:** edit every locale JSON (today `en.json`) → run
  `npm run i18n` → use `$i18n.section.key` in your component.
- **No raw English in components** for new copy — go through `$i18n`.
- **Interpolation** is done by the call site via `String#replace` (see
  [`/deals/new/+page.svelte`](../../../src/routes/deals/new/+page.svelte)
  for the `{symbol}` / `{fee_str}` pattern). We don't ship a runtime
  ICU formatter today.
- See [`workflows/i18n.md`](./workflows/i18n.md) for the full flow.

## Custom DOM events

Juno emits `junoSignOutAuthTimer` and `junoExampleReload` on `window`.
Their typings live in
[`src/custom-events.d.ts`](../../../src/custom-events.d.ts) (augmenting
`svelte/elements`). Listen with
`<svelte:window onjunoXxx={handler} />` — see
[`Auth.svelte`](../../../src/lib/components/Auth.svelte) and
[`+page.svelte`](../../../src/routes/+page.svelte) (`junoExampleReload`
is reused by `<svelte:window>` for the dashboard refresh hook).

If you add a new custom event, declare it in `src/custom-events.d.ts`.

## Performance

- Wrap expensive work in `$derived.by` (cached) or in a `derived(...)`
  Svelte store, not in the render path.
- `{#each items as item, index (item.key)}` with a stable key (eslint
  enforces `svelte/require-each-key`).
- For ID-keyed lists like the deals table, use `(deal.id)` — the
  canister gives every deal a unique `bigint` id.

## Anti-patterns (do not do these)

- Importing from `$declarations/**` outside `$lib/{api,canisters}/` —
  re-export through `$lib/types/`.
- Calling `EscrowCanister.create` / `IcrcLedgerCanister.create` /
  `getAgent` from a component — go through the api facade + service.
- Mirroring a `Doc<T>` from the canister into a store you keep manually
  in sync. Push refresh through the matching service so the canister
  stays the source of truth.
- `export let foo` in new code.
- Inline type literal in `$props()` (`let { … }: { … } = $props()`).
- Reactive `$:` statements in new code.
- `$bindable` unless explicitly required by the API.
- Reaching into `document.querySelector` to mutate Svelte-managed DOM.
- Catching an error and silently swallowing it; either propagate, log
  with `console.error`, or surface to the user via UI state.
- Hard-coding strings, hex colours, magic numbers in components.
- Hard-coded English copy for new user-visible text — use `$i18n`.
- "Just one more `any`" — there is no "just one more".
- Adding a wrapper component that only re-exports another component.
- `target="_blank"` without `rel="noopener noreferrer"`.
- `{@html …}` without sanitisation — the only tolerated cases today are
  `$i18n.*_html` keys (controlled-input dictionary) with an
  `eslint-disable-next-line svelte/no-at-html-tags`.
- `console.log` left in committed code (eslint allows only
  `console.warn` / `console.error`).
- Calling `signIn()` without a provider object (`@junobuild/core` 5.x
  requires it: `signIn({ internet_identity: {} })`).
- Binding `signOut` directly to `onclick` (it accepts `SignOutOptions`,
  not a `MouseEvent` — wrap it in an arrow).
