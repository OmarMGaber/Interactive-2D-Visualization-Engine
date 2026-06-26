export type RuntimeSettingsEvents = {
    "settings:backgroundColorChanged": { color: string };
    "settings:tickerSpeedChanged": { speed: number };
    "settings:systemToggled": { systemName: string; enabled: boolean };
    "settings:reset": void;
};

export type RuntimeLifecycleEvents = {
    "runtime:paused": void;
    "runtime:resumed": void;
    "runtime:error": { message: string };
};

export type RuntimeVisualEvents = {
    "visual:created": { visualId: number, visualType: string };
    "visual:destroyed": { visualId: number, visualType: string };
};

export type RuntimeSystemsEvents = {
    "systems:selectionChanged": { visualId: number | null, visualType: string | null };
    "systems:enabled": { systemId: number };
    "systems:disabled": { systemId: number };
    "systems:optionEnabled": { systemId: number, optionId: number };
    "systems:optionDisabled": { systemId: number, optionId: number };
    "systems:removedVisual": { visualId: number, systemId: number };
    "systems:addedVisual": { visualId: number, systemId: number };
};

export type RuntimePlayerEvents = {
    "player:resumed": { visualId: number };
    "player:paused": { visualId: number };
};

export type RuntimeEvents =
    & RuntimeSettingsEvents
    & RuntimeLifecycleEvents
    & RuntimeVisualEvents
    & RuntimeSystemsEvents
    & RuntimePlayerEvents
    ;