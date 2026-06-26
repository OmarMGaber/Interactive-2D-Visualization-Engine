import type { SettingsBundle } from "../../SettingsSchema";
import type { PersistSettingsStorage } from "../persist/PersistSettingsStorage";

/**
 * Defines the contract for settings persistence strategies.
 *
 * A storage strategy controls how settings roots are stored,
 * merged, loaded, and removed from persistence.
 *
 * Different strategies may:
 * - store each root separately
 * - bundle all roots into one object
 * - cache data in memory
 */
export interface StorageStrategy {
    storageKey: string;
    storage: PersistSettingsStorage;

    /**
     * Loads specific settings roots.
     *
     * @param keys - Root keys to load.
     * @returns Bundle containing only the requested roots.
     */
    load(keys: string[]): SettingsBundle;

    /**
     * Saves the provided settings bundle. to be presisted when commit is called.
     * The implementation may choose to merge the incoming bundle with existing persisted data or overwrite it entirely.
     * The actual persistence is defferred until commit is called.
     *
     * @param bundle - Settings bundle to persist.
     */
    push(bundle: SettingsBundle): void;

    /**
     * Called after saving to finalize persistence. Returns the number of roots persisted.
     */
    commit(): number;

    /**
     * Removes specific settings roots from persistence.
     *
     * @param keys - Root keys to remove.
     */
    clear(keys: string[]): void;

    /**
     * Clears all persisted settings.
     */
    clearAll(): void;
}