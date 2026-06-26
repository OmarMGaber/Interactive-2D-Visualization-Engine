import { ToggleState } from "@/engine/common/ToggleState";
import type { Container } from "pixi.js";
import type { SettingsProvider } from "../settings/SettingsProvider";
import { SettingsNode } from "../settings/SettingsNode";

export interface SystemOptionInfo {
    id: number;
    name: string;
    description: string;
    enabled: boolean;
}

export interface SystemOption {
    readonly id: number;
    readonly name: string;
    readonly description: string;

    getInfo(): SystemOptionInfo;
}

let _optionId = 0;

interface OptionSettingsConfig {
    enabled: boolean;
}

/**
 * Base class for all system options.
 * Each option is its own SettingsProvider, it owns its enabled-state serialization,
 * so neither OptionManager nor System need to know the internal shape of an option.
 */
export abstract class SystemOption implements SettingsProvider<OptionSettingsConfig> {
    public readonly id: number = _optionId++;
    public readonly state: ToggleState;
    public readonly settingsNode: SettingsNode<OptionSettingsConfig>;

    constructor(
        public readonly name: string,
        public readonly description: string,
        initiallyEnabled: boolean = true,
    ) {
        this.state = new ToggleState(initiallyEnabled);

        this.settingsNode = new SettingsNode<OptionSettingsConfig>(
            this.constructor.name,
            () => ({ enabled: this.state.isEnabled() }),
            ({ enabled }) => {
                console.log(`Importing settings for option "${this.name}": enabled = ${enabled}`);
                enabled ? this.state.enable() : this.state.disable()
            },
        );

        // Make the settings node notify whenever the state changes to presist the state
        this.state.subscribe(() => this.settingsNode.notify());
    }

    /**
     * Option information used for serialization and editor UI.
     */
    getInfo(): SystemOptionInfo {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            enabled: this.state.isEnabled(),
        };
    }

    protected executeIfEnabled(action: () => void): void {
        if (this.state.isEnabled()) {
            action();
        }
    }

    protected executeIfDisabled(action: () => void): void {
        if (!this.state.isEnabled()) {
            action();
        }
    }

    // Optional lifecycle hooks that systems can implement to react to option changes without manual subscription.
    onSystemEnable?(): void;
    onSystemDisable?(): void;
    onObjectRegister?(obj: Container): void;
    onObjectUnregister?(obj: Container): void;
    destroy?(): void;
}