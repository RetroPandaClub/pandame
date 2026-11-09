# Workflow: add a Svelte component

Only when nothing in [`../reusability.md`](../reusability.md) fits, even with
a new prop.

1. **Search.** The catalog, then `src/lib/components/**/*.svelte`. Something
   marked **(unused)** that fits is reused, not rewritten.
2. **Name.** PascalCase for the role, not the look (`DisputeCard`, not
   `RedPanel`); no `Component` / `Widget` suffix.
3. **Place.** Flat in `src/lib/components/`, icons in `icons/`. Ask before a
   feature subfolder.
4. **Props.** A named `interface Props` in the file, required props first,
   optional callbacks typed `() => void | Promise<void>`, no `$bindable` by
   default. Model: [`Chip.svelte`](../../../../src/lib/components/Chip.svelte).
5. **Compose.** Build on `Button`, `BrandHeader`, `Sheet`, `Modal`, `Money`,
   `Countdown`, `EmptyState`, `TextInput`, `FormField`, `Tabs` and the icons
   instead of new markup. Variant classes go in one `Record<Variant, string>`.
6. **Data.** A component that needs canister data calls a service; it never
   imports `$lib/api`, `$lib/canisters` or `$declarations`.
7. **Style.** Semantic tokens only; no raw colour, no `dark:`
   ([theming](../stack-and-patterns.md#styling-and-theming)).
8. **a11y and i18n.** [`../a11y.md`](../a11y.md); every string a `$i18n.*`
   key ([`i18n.md`](./i18n.md)).
9. **Keys and ids.** Keyed `{#each}`; `data-tid` if Playwright targets it.
10. **Tests** for real logic ([`../testing.md`](../testing.md)).
11. **Catalog.** Add the row to [`../reusability.md`](../reusability.md).
12. **Gates and PR.** [`../../pr-and-ci.md`](../../pr-and-ci.md): `feat` for a
    visible feature, `refactor` for an extraction, `style` for visuals only.

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
	class="bg-bg-elevated text-default border-border-soft rounded-lg border p-4"
	class:bg-bg-soft={highlight}
>
	<h3 class="text-h6 font-bold">#{deal.id.toString()}</h3>
	<Button onclick={onSelect}>{$i18n.core.text.open_dashboard}</Button>
</article>
```

Do not: duplicate `Button` markup, inline an SVG a second time, compute in
markup what belongs in `$derived`, wrap a component only to re-export it.
