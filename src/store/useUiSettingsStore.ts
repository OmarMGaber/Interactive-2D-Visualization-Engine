import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UiSettingsState = {
    enableToast: boolean;
};

export type UiSettingsActions = {
    setEnableToast: (enabled: boolean) => void;
    reset: () => void;
};

export type UiSettingsStore = UiSettingsState & UiSettingsActions;

const UI_SETTINGS_STORAGE_KEY = "dsav-editor-ui-settings";

const DEFAULT_UI_SETTINGS: UiSettingsState = {
    enableToast: true,
};

/**
 * This store manages the UI settings of the application in a React application.
 */
export const useUiSettingsStore = create<UiSettingsStore>()(
    persist(
        (set) => ({
            ...DEFAULT_UI_SETTINGS,
            setEnableToast: (enabled) => set({ enableToast: enabled }),
            reset: () => set(DEFAULT_UI_SETTINGS),
        }),
        {
            name: UI_SETTINGS_STORAGE_KEY,
        },
    ),
);
