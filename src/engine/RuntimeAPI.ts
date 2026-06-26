import type { RuntimeMessaging } from "./RuntimeContext";
import type { SystemInfo } from "./systems/System";
import type { RuntimeSettings } from "./VisualizationRuntime";

/**
 * Public API exposed by the VisualizationRuntime to external consumers.
 * @remarks
 * This interface defines the contract for the runtime API, which provides access to
 * runtime settings, system information, and messaging channels for events and commands.
 * Consumers can use this API to query the runtime state, interact with systems, and respond to runtime events.
 * The API is intentionally limited to what external consumers are allowed to read/write,
 * enforcing encapsulation across the boundary.
 */
export interface RuntimeAPI extends RuntimeMessaging {
    /** Returns the current runtime settings. */
    readonly getSettings: () => Readonly<RuntimeSettings>;

    /** Returns whether the runtime is currently running. */
    readonly isRunning: () => boolean;

    /**
     * Returns information about all registered systems.
     * 
     * @returns Array of system information objects, sorted by system ID.
     */
    readonly getSystemsInfo: () => SystemInfo[];
}