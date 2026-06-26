import { SettingsNode } from "../settings/SettingsNode";
import { isSettingsProvider, type SettingsProvider } from "../settings/SettingsProvider";
import { RegistrySystem } from "../systems/RegistrySystem";
import type { System } from "../systems/System";
import type { RuntimeContext } from "@/engine/RuntimeContext";
import type { VisualObject } from "../visuals/VisualObject";

/**
 * SystemManager is responsible for managing all systems in the visualization runtime. 
 * It allows registering, retrieving, enabling/disabling, and destroying systems. 
 * It also provides utility methods to register/unregister visuals to all systems that support it (i.e., those extending RegistrySystem).
 */
export class SystemManager implements SettingsProvider<any> {
    public settingsNode = SettingsNode.BlankNode("systems-mgr");
    private readonly systems: System[] = [];


    constructor(private readonly context: RuntimeContext) {
    }

    /**
     * Registers a system of the given class. 
     * If a system of the same class is already registered, it returns the existing instance instead of creating a new one.
     * 
     * @example
     * const debugSystem = systemManager.register(DebugSystem, debugTextHandler); // creates and registers a new DebugSystem instance
     * const sameDebugSystem = systemManager.register(DebugSystem, ...); // returns the same DebugSystem instance without creating a new one
     * 
     * @param SystemClass The class of the system to register. Must extend the base System class.
     * @param args System arguments to pass to the system's constructor, excluding the RuntimeContext which is provided by the SystemManager.
     * @returns The registered system instance.
     */
    register<T extends System, TArgs extends unknown[]>(
        SystemClass: new (ctx: RuntimeContext, ...extra: TArgs) => T,
        ...args: TArgs
    ): T {
        const existing = this.systems.find(s => s instanceof SystemClass);
        if (existing) return existing as T;

        const instance = new SystemClass(this.context, ...args);
        this.systems.push(instance);

        if (isSettingsProvider(instance)) {
            this.settingsNode.addChild(instance.settingsNode);
        }

        return instance;
    }

    /**
     * Retrieves a system of the specified class, if it is registered.
     * 
     * @param ClassType The class of the system to retrieve.
     * @returns The system instance, or undefined if not found.
     */
    get<T extends System>(ClassType: new (...args: any[]) => T): T | undefined {
        return this.systems.find(s => s instanceof ClassType) as T | undefined;
    }

    /**
     * Retrieves a system of the specified class, if it is registered.
     * Throws an error if the system is not found.
     *
     * @param ClassType The class of the system to retrieve.
     * @returns The system instance.
     * @throws {Error} If the system is not found.
     */
    require<T extends System>(ClassType: new (...args: any[]) => T): T {
        const s = this.get(ClassType);
        if (!s) throw new Error(`[SystemManager] "${ClassType.name}" is not registered.`);
        return s;
    }

    enableAll() { for (const s of this.systems) s.state.enable(); }
    disableAll() { for (const s of this.systems) s.state.disable(); }

    registerVisualToAllSystems(visual: VisualObject) {
        for (const s of this.systems) {
            if (s instanceof RegistrySystem) {
                s.registerObject?.(visual);
            }
        }
    }

    unregisterVisualFromAllSystems(visual: VisualObject) {
        for (const s of this.systems) {
            if (s instanceof RegistrySystem) {
                s.unregisterObject?.(visual);
            }
        }
    }

    values(): IterableIterator<System> {
        return this.systems.values();
    }

    destroy(): void {
        for (const s of this.systems) {
            if (isSettingsProvider(s)) {
                this.settingsNode.removeChild(s.settingsNode);
            }

            s.destroy?.();
        }
        this.systems.length = 0;
    }

    getSystemById(systemId: number): System | undefined {
        for (const system of this.systems.values()) {
            if (system.id === systemId) {
                return system;
            }
        }

        return undefined;
    }
}