// Canister rejects values outside its `[min, max]` (default `[3, 11]`)
// with a typed `PanelSizeOutOfRange { min, max, got }` the create-deal
// page surfaces directly.
export const PANEL_SIZE_FAST = 3;
export const PANEL_SIZE_FAIR = 7;
export const PANEL_SIZE_SLOW = 11;

// Overrides the canister's `cfg.panel_size = 3` default because we
// want to recommend a 7-arbitrator panel to end-users.
export const PANEL_SIZE_DEFAULT = PANEL_SIZE_FAIR;
