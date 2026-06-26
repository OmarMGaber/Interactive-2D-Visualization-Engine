import type { SettingsBundle } from "../../SettingsSchema";

/**
 * Low-level persistence interface used by the settings system.
 *
 * Implementations are responsible for reading and writing
 * the entire settings bundle to a persistence layer such as:
 * - localStorage
 * - files
 *
 * This interface operates on the complete settings object
 * and does not handle partial updates or key filtering.
 */
export interface PersistSettingsStorage {
    /**
     * Loads the full persisted settings bundle.
     *
     * @returns The persisted settings bundle.
     */
    load(storageKey: string): SettingsBundle;

    /**
     * Persists the entire settings bundle.
     *
     * @param settings - The settings bundle to save.
     */
    save(storageKey: string, settings: SettingsBundle): void;

    /**
     * Clears all persisted settings data.
     */
    clear(storageKey: string): void;
}