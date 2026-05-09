# Workflow: Add a new Svelte component

Use this when you need a new `.svelte` file. Don't use it when an existing
component (see [`../reusability.md`](../reusability.md)) already covers
the use case.

## Steps

1. **Search first.** `Grep` / `Glob` `$lib/components/*.svelte` to confirm
   nothing already does what you need. Pandame's component set is small
   (10 files); skim it before adding.
2. **Pick the name.** PascalCase, descriptive, no `Component` / `Widget`
   suffix. Reflects role, not appearance (`NoteList`, not `BluePanel`).
3. **Place it.** Pandame's `$lib/components/` is flat today — don't
   introduce a feature subfolder for a single component. If you have ≥ 3
   related components, surface the question first.
4. **Sketch props first.** Always use a named `interface Props` above
   the destructure — see
   [`../stack-and-patterns.md#props-shape`](../stack-and-patterns.md#props-shape).

   ```ts
   import type { Snippet } from 'svelte';

   interface Props {
   	title: string;
   	highlight?: boolean;
   	onSelect?: () => void;
   	children?: Snippet;
   }

   let { title, highlight = false, onSelect = () => {}, children }: Props = $props();
   ```

   - All props typed via `interface Props`.
   - Required props first, optional / defaulted after.
   - Callbacks default to a no-op (`() => {}`).
   - **Avoid `$bindable`** unless explicitly required — prefer a callback
     prop.

5. **Compose, don't reinvent.** Build on the existing primitives —
   `Button`, `Modal`, `Card`, `Backdrop`, `Background`, `EmptyState`,
   `BalanceBadge`, `DealStatusBadge`, `DealActions` — before inventing
   new shapes. Re-use icons that already live inside sibling components
   instead of inlining a fourth copy.
6. **Style with the project's tokens.** Look at the closest neighbour's
   classes. Use the lavender-blue palette + base colours via the matching
   Tailwind utilities (`bg-lavender-blue-500`, `text-lavender-blue-400`,
   …). No raw hex. See
   [`../stack-and-patterns.md#tailwind-v4--design-tokens`](../stack-and-patterns.md#tailwind-v4--design-tokens).
7. **a11y.** Real `<button>` / `<a>` elements. Labels on every input.
   Decorative icons `aria-hidden="true"`, icon-only buttons get an
   `aria-label`. See [`../a11y.md`](../a11y.md).
8. **i18n.** Any new user-visible string goes through `$i18n.*` — see
   [`./i18n.md`](./i18n.md).
9. **Each-block keys.** `{#each items as item, index (item.key)}` — the
   eslint plugin enforces it.
10. **Test ID** if the component is targeted by a Playwright test:
    `data-tid="<kebab-case>"`.
11. **Tests** for any non-trivial logic — see [`../testing.md`](../testing.md).
12. **Catalog update** — add a row to
    [`../reusability.md`](../reusability.md#components--libcomponents).
    This is the [meta-update rule](../../governance.md#meta-update-rule).
13. **Run quality gates** (`npm run quality && npm run check && npm run test -- --run`).
14. **Open the PR** with the right title:
    - New feature visible to users → `feat(<scope>): …` or `feat: …`.
    - Restructure / extract with no behaviour change →
      `refactor(<scope>): …`.
    - Pure visual update → `style(<scope>): …`.

## Skeleton

```svelte
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Deal } from '$lib/types/deal';

	interface Props {
		deal: Deal;
		highlight?: boolean;
		onSelect?: () => void;
	}

	let { deal, highlight = false, onSelect = () => {} }: Props = $props();
</script>

<article
	class="rounded border-[3px] border-black bg-white p-3 shadow-[5px_5px_0px_rgba(0,0,0,1)] dark:bg-black dark:text-white"
	class:bg-lavender-blue-50={highlight}
>
	<h3 class="font-semibold">#{deal.id.toString()}</h3>
	<Button onclick={onSelect}>{$i18n.deals.actions.accept}</Button>
</article>
```

## Common mistakes (don't)

- A new `<button>` markup that duplicates `Button.svelte`.
- Hard-coded colour (`bg-[#0f0]`) instead of the lavender-blue palette.
- Hard-coded English copy instead of `$i18n.*`.
- A wrapper that only re-exports another component.
- Logic in the markup that should be a `$derived`.
- Reading from a store deep inside the markup instead of a top-level
  `$derived` / store reference.
- Missing key in `{#each}`.
- Inlining the same SVG icon a third time — extract it.
