import type { VisualObject } from "../visuals/VisualObject";

export type RuntimeSettingsCommands = {
    "settings:setBackgroundColor": { color: string };
    "settings:setTickerSpeed": { speed: number };
    "settings:reset": void;
};

export type RuntimeLifecycleCommands = {
    "runtime:pause": void;
    "runtime:resume": void;
};

export type RuntimeInteractionCommands = {
    "interaction:select": { object: VisualObject | null };
    "interaction:hover": { object: VisualObject | null };
};

export type RuntimeVisualsCommands = {
    "create:visual:array": { x: number; y: number; items: any[] };
    "visuals:destroy": { visualId: number };
};

export type RuntimeSystemCommands = {
    "systems:setEnabled": { systemId: number; enabled: boolean };
    "systems:setOptionEnabled": { systemId: number; optionId: number; enabled: boolean };
    "systems:addVisual": { visualId: number; systemId: number };
    "systems:removeVisual": { visualId: number; systemId: number };
};

export type RuntimePlayerCommands = {
    "player:resume": { visualId: number };
    "player:pause": { visualId: number };
    "player:step": { visualId: number, backwards?: boolean };
};

export type RuntimeCommands =
    & RuntimeSettingsCommands
    & RuntimeLifecycleCommands
    & RuntimeVisualsCommands
    & RuntimeSystemCommands
    & RuntimePlayerCommands
    & RuntimeInteractionCommands
    ;