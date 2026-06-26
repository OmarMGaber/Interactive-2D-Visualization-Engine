import type { SettingsBundle } from "../../SettingsSchema";
import type { PersistSettingsStorage } from "../persist/PersistSettingsStorage";
import type { StorageStrategy } from "./StorageStrategy";

/**
 * A storage strategy that bundles all settings roots into a single persisted object.
 * 
 */
export class BundledStorageStrategy implements StorageStrategy {
    /** Roots that have been pushed but not yet committed. */
    private pendingBundle: SettingsBundle[] = [];
    private cachedBundle: SettingsBundle | null = null;

    constructor(
        public readonly storageKey: string,
        public readonly storage: PersistSettingsStorage,
    ) {}

    load(keys: string[]): SettingsBundle {
        if (this.cachedBundle) return this.pickKeys(this.cachedBundle, keys);

        const full = this.storage.load(this.storageKey);
        return this.pickKeys(full, keys);
    }

    /**
     * Merges the incoming bundle into the in-memory pending state.
     * Nothing is written to storage until {@link commit} is called.
     */
    push(bundle: SettingsBundle): void {
        this.pendingBundle.push(bundle);
    }

    /**
     * Merges the pending bundle with whatever is already persisted,
     * writes the result to storage, then resets pending state.
     *
     * @returns The number of roots that were committed.
     */
    commit(): number {
        const pendingKeys = this.pendingBundle.length;
        if (pendingKeys === 0) return 0;

        const persisted = this.storage.load(this.storageKey);

        const merged = Object.assign({}, persisted, ...this.pendingBundle);

        this.storage.save(this.storageKey, merged);

        this.cachedBundle = merged;
        this.pendingBundle = [];

        return pendingKeys;
    }

    clear(keys: string[]): void {
        if (keys.length === 0) return;

        const persisted = this.storage.load(this.storageKey);
        const updated = this.omitKeys(persisted, keys);
        this.storage.save(this.storageKey, updated);
        this.cachedBundle = updated;
    }

    clearAll(): void {
        this.pendingBundle = [];
        this.storage.clear(this.storageKey);
        this.cachedBundle = null;
    }

    private pickKeys(bundle: SettingsBundle, keys: string[]): SettingsBundle {
        return Object.fromEntries(
            keys.filter((k) => k in bundle).map((k) => [k, bundle[k]]),
        );
    }

    private omitKeys(bundle: SettingsBundle, keys: string[]): SettingsBundle {
        const set = new Set(keys);
        return Object.fromEntries(
            Object.entries(bundle).filter(([k]) => !set.has(k)),
        );
    }
}