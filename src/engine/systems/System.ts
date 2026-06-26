import { ToggleState } from "@/engine/common/ToggleState";
import type { Ticker } from "pixi.js";
import { OptionManager } from "@/engine/managers/OptionManager";
import type { RuntimeContext } from "@/engine/RuntimeContext";
import type { SystemOption, SystemOptionInfo } from "./SystemOption";
import type { SettingsProvider } from "../settings/SettingsProvider";
import { SettingsNode } from "../settings/SettingsNode";
import { RegistrySystem } from "./RegistrySystem";

// Global system ID counter.
let _id = 0;

/**
 * A snapshot of the system's current state, including its ID, name, enabled state, and registered options.
 * This information can be used for debugging, logging, or displaying system information in a UI.
 */
export interface SystemInfo {
    /** System ID */
    id: number;

    /** System Name */
    name: string;

    /** Indicates whether the system is currently enabled or disabled */
    enabled: boolean;

    /** Optional flag indicating if the system is a registry system */
    isRegistrySystem?: boolean;

    /** Array of registered visual IDs associated with the system, If the system is a registry system */
    registeredVisualIds?: number[];

    /** Array of option information associated with the system, If the system has options. */
    options?: SystemOptionInfo[];
}

// Definition of a System
export interface System {
    /** Unique identifier for the system */
    readonly id: number;

    /** The current state of the system, indicating whether it is enabled or disabled */
    readonly state: ToggleState;

    /**
     * Returns a snapshot of the system's current state, including its ID, name, enabled state, and registered options.
     * This information can be used for debugging, logging, or displaying system information in a UI.
     * 
     * @returns A `SystemInfo` object containing the system's current state.
    */
    getInfoSnapshot(): SystemInfo;
    
    /**
     * Optional method that can be implemented by systems that require cleanup or resource deallocation when the system is destroyed.
    */
    destroy?(): void;

    /**
     * Optional method that can be implemented by systems that require per-frame updates.
     * This method is called on each tick of the application's main loop, allowing the system to perform continuous updates.
     * 
     * @param ticker - The ticker object that provides the current FPS and other timing information.
     * 
     * @remark Systems that do not require per-frame updates can omit this method. 
     * It is primarily used for systems that need to react to changes in real-time, such as animations or dynamic visualizations.
    */
    update?(ticker: Ticker): void;
}

interface SystemSettings {
    enabled: boolean,
}

/**
 * Abstract base class for all systems. Provides common functionality for enabling/disabling and managing options.
 */
export abstract class System implements System, SettingsProvider<SystemSettings> {
    public readonly id: number = _id++;
    public readonly settingsNode: SettingsNode<SystemSettings>;
    public readonly state = new ToggleState(true);

    protected _optionManager = new OptionManager();

    // Hooks that can be set by the system implementation to react to enable/disable
    // Invoked automatically when the system state is changed.
    private _onEnableHook?: () => void;
    private _onDisableHook?: () => void;

    constructor(protected readonly runtimeCtx: RuntimeContext) {
        this.settingsNode = new SettingsNode(
            `${this.constructor.name}-settings`,
            () => ({ enabled: this.state.isEnabled() }),
            ({ enabled }) => (enabled ? this.state.enable() : this.state.disable()),
        )

        // Attach the OptionManager settings node to the system settings node.
        //
        // The OptionManager is responsible for managing the state of all options
        // and owns their corresponding settings nodes.
        // Settings Node heirerchy: System -> OptionManager -> [Option1, Option2, ...]
        this.settingsNode.addChild(this._optionManager.settingsNode);

        // Actions to perform when the system state is changed        
        this.state.subscribe((enabled) => {
            if (enabled) { // Nativelly invoke the lifecycle hooks
                this.onEnable();
            } else {
                this.onDisable();
            }

            // Notify the settings node to persist the state change
            this.settingsNode.notify();
        });
    }

    public getInfoSnapshot(): SystemInfo {
        const registrySystem = this instanceof RegistrySystem ? (this as RegistrySystem<any>) : null;

        return {
            id: this.id,
            name: this.constructor.name,
            enabled: this.state.isEnabled(),
            isRegistrySystem: registrySystem !== null,
            registeredVisualIds: registrySystem ? registrySystem.getRegisteredVisualIds() : [],
            options: this._optionManager.getAll().map(option => option.getInfo()),
        };
    }

    /**
     * Sets the callback function to be invoked when the system is enabled.
     * @param callback - The callback function to set.
     */
    public set onEnableHook(callback: () => void) {
        this._onEnableHook = callback;
    }

    /**
     * Sets the callback function to be invoked when the system is disabled.
     * @param callback - The callback function to set.
     */
    public set onDisableHook(callback: () => void) {
        this._onDisableHook = callback;
    }

    /**
     * Options registered with the system. These options can be used to configure the system's behavior.
     */
    public get options(): readonly SystemOption[] {
        return this._optionManager.getAll();
    }

    /**
     * Returns the option manager for the system.
     * @returns - The `OptionManager` instance.
     */
    public get optionsManager(): OptionManager {
        return this._optionManager;
    }
    
    private onEnable(): void {
        this._optionManager.onEnable();

        this._onEnableHook?.();
    }

    private onDisable(): void {
        this._optionManager.onDisable();

        this._onDisableHook?.();
    }
}