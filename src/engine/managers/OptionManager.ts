import type { Container } from "pixi.js";
import type { SystemOption } from "../systems/SystemOption";
import { isSettingsProvider, type SettingsProvider } from "../settings/SettingsProvider";
import { SettingsNode } from "../settings/SettingsNode";

/**
 * OptionManager is responsible for managing system options in the visualization runtime.
 * It allows registering, retrieving, enabling/disabling, and destroying options. 
 * It also provides utility methods to propagate lifecycle events to all registered options.
 * 
 * **Automatic State Management**: When a system enables/disables, this manager automatically
 * disables/enables all options' states to match the system's state. This ensures that disabled
 * systems have disabled options, eliminating the need for manual state management in each option.
 */
export class OptionManager implements SettingsProvider<null>{
    private readonly options: SystemOption[] = [];
    public settingsNode = SettingsNode.BlankNode(`options`);

    /**
     * Stores the enabled state of each option before the system was disabled.
     * Used to restore option states when the system is re-enabled.
     * Key: option id, Value: was the option enabled before disabling?
     */
    private readonly previousEnabledStates = new Map<number, boolean>();

    /**
     * Registers an option of the given class.
     * If an option of the same class is already registered, it returns the existing instance instead of creating a new one.
     *
     * @example
     * const debugInfoOption = optionManager.register(DebugInfoOption, this.objects, this.debugTextHandler);
     * const option2 = optionManager.register(DebugInfoOption, ...); // returns the same instance as debugInfoOption
     * 
     * @param OptionClass The class of the option to register.
     * @param args Option arguments to pass to the option's constructor.
     * @returns The registered option instance.
     */
    register<T extends SystemOption, TArgs extends unknown[]>(
        OptionClass: new (...args: TArgs) => T,
        ...args: TArgs
    ): T {
        const existing = this.options.find(o => o instanceof OptionClass);
        if (existing) return existing as T;

        const instance = new OptionClass(...args);
        this.options.push(instance);

        if (isSettingsProvider(instance)) {
            this.settingsNode.addChild(instance.settingsNode);
        }

        return instance;
    }

    /**
     * Retrieves an option of the specified class, if it is registered.
     * 
     * @param OptionClass The class of the option to retrieve. 
     * @returns The option instance, or undefined if not found.
     */
    get<T extends SystemOption>(OptionClass: new (...args: any[]) => T): T | undefined {
        return this.options.find(o => o instanceof OptionClass) as T | undefined;
    }

    /**
     * Retrieves an option of the specified class, if it is registered.
     * Throws an error if the option is not found.
     * 
     * @example
     * const debugInfoOption = optionManager.require(DebugInfoOption); // returns the instance if registered, otherwise throws an error
     *
     * @param OptionClass The class of the option to retrieve.
     * @returns The option instance.
     * @throws {Error} If the option is not found.
     */
    require<T extends SystemOption>(OptionClass: new (...args: any[]) => T): T {
        const o = this.get(OptionClass);
        if (!o) throw new Error(`[OptionManager] "${OptionClass.name}" is not registered.`);
        return o;
    }

    getAll(): readonly SystemOption[] {
        return this.options;
    }

    /**
     * Called when the system is enabled.
     * Automatically restores previous option states and calls onSystemEnable hooks.
     */
    onEnable() {
        for (const option of this.options) {
            const previousState = this.previousEnabledStates.get(option.id);
            if (previousState === undefined) continue;
            if (previousState) option.state.enable(); else option.state.disable();
        }

        for (const option of this.options) {
            option.onSystemEnable?.();
        }
    }

    /**
     * Called when the system is disabled.
     * Automatically disables all options and calls onSystemDisable hooks.
     */
    onDisable() {
        for (const option of this.options) {
            this.previousEnabledStates.set(option.id, option.state.isEnabled());
            option.state.disable();
        }

        for (const option of this.options) {
            option.onSystemDisable?.();
        }
    }

    /**
     * Stores the current enabled state of an option before the system disables.
     * Only stores for SystemOption instances that have a state property.
     */
    // (Helper methods removed) We operate directly on `SystemOption` instances now.

    onObjectRegister(obj: Container) { for (const o of this.options) o.onObjectRegister?.(obj); }
    onObjectUnregister(obj: Container) { for (const o of this.options) o.onObjectUnregister?.(obj); }

    destroy(): void {
        for (const o of this.options) {
            if (isSettingsProvider(o)) this.settingsNode.removeChild(o.settingsNode);
            o.destroy?.();
        }
        this.options.length = 0;
        this.previousEnabledStates.clear();
    }
}