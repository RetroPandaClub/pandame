/**
 * The arbitrator panel sizes the `PanelSizePicker` exposes. These map
 * to the Figma triplet (`Fast = 3` / `Fair = 7` / `Less fast = 11`)
 * on the create-deal screen.
 *
 * The canister enforces `panel_size` ∈ `[DisputeConfig.min_panel_size,
 * DisputeConfig.max_panel_size]` (default `[3, 11]`) at `create_deal`
 * time, with `PanelSizeOutOfRange { min, max, got }` on violation. The
 * default `[3, 11]` accepts the full triplet without admin
 * intervention; if a controller tightens the upper bound, sending
 * `panel_size = 11` will be rejected and the create-deal page surfaces
 * the typed error.
 */
export const PANEL_SIZE_FAST = 3;
export const PANEL_SIZE_FAIR = 7;
export const PANEL_SIZE_SLOW = 11;

/**
 * The Figma "Fair / Recommended" option — used as the default
 * pre-selection on `/deals/new` so the picker matches the design even
 * before the user touches it. `Some(7)` overrides the canister's
 * `cfg.panel_size = 3` default; product intent (per Figma) is to
 * recommend a 7-arbitrator panel for end-users.
 */
export const PANEL_SIZE_DEFAULT = PANEL_SIZE_FAIR;
