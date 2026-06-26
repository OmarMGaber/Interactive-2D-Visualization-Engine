/**
 * Central z-index map for top-level editor UI.
 *
 * Keep these values in ascending order to make layering intent explicit:
 * context menu < notifications < modal overlay < modal content.
 */
export const UI_LAYERS = {
	CONTEXT_MENU: 800,
	TOASTS: 900,
	MODAL_OVERLAY: 1000,
	MODAL_CONTENT: 1010,
} as const;

export type UiLayerKey = keyof typeof UI_LAYERS;
export type UiLayerValue = (typeof UI_LAYERS)[UiLayerKey];
