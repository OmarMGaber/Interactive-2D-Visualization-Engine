import type { SettingsBundle } from "../../SettingsSchema";
import type { PersistSettingsStorage } from "../persist/PersistSettingsStorage";
import type { StorageStrategy } from "./StorageStrategy";

/**
 * A storage strategy that separates each root into its own storage entry.
 * This allows for more granular control over which roots are loaded and saved,
 * at the cost of more storage operations.
 */
export class SeparateStorageStrategy implements StorageStrategy {
    /**
     * A Cache of bundles loaded from storage, keyed by root name. 
     * Avoid unnecessary storage loads by keeping track of the last loaded state for each root.
     */
    private bundleCache: Record<string, SettingsBundle> = {};

    /** Roots batched by `push` that are waiting to be flushed by `commit`. */
    private pendingBundle: SettingsBundle[] = [];

    constructor(
        public readonly storageKey: string,
        public readonly storage: PersistSettingsStorage,
    ) { }

    load(keys: string[]): SettingsBundle {
        const result: SettingsBundle = {};

        for (const key of keys) {
            if (key in this.bundleCache) {
                result[key] = Object.values(this.bundleCache[key])[0];
                continue;
            } else {
                const rootBundle = this.storage.load(this.rootKey(key));
                if (key in rootBundle) {
                    result[key] = rootBundle[key];
                }
                
                this.bundleCache[key] = rootBundle;
            }
        }

        return result;
    }

    /**
     * Batches the incoming bundle in memory.
     * Nothing is written to storage until {@link commit} is called.
     */
    push(bundle: SettingsBundle): void {
        const key = Object.keys(bundle)[0];
        const value = bundle[key];

        if (this.bundleCache[key] === value) return;

        for (let i = this.pendingBundle.length - 1; i >= 0; i--) {
            if (Object.keys(this.pendingBundle[i])[0] === key) {
                this.pendingBundle[i] = bundle;
                return;
            }
        }

        this.pendingBundle.push(bundle);
    }

    /**
     * Flushes each staged root to its own storage entry
     * 
     * @returns The number of roots that were committed.
     */
    commit(): number {
        if (this.pendingBundle.length === 0) return 0;

        const pendingEntries = this.pendingBundle.flatMap((bundle) =>
            Object.entries(bundle).map(([key, value]) => ({ key, value })),
        );

        for (const { key, value } of pendingEntries) {
            const rootBundle: SettingsBundle = {
                [key]: value,
            };
            this.storage.save(this.rootKey(key), rootBundle);
            this.bundleCache[key] = rootBundle;
        }

        this.pendingBundle.length = 0;
        return pendingEntries.length;
    }

    clear(keys: string[]): void {
        if (keys.length === 0) return;

        for (const key of keys) {
            this.storage.clear(this.rootKey(key));
            delete this.bundleCache[key];
        }
    }

    clearAll(): void {
        const keys = Object.keys(this.bundleCache);
        for (const key of keys) {
            this.storage.clear(this.rootKey(key));
        }

        this.storage.clear(this.storageKey);
        this.pendingBundle.length = 0;
        this.bundleCache = {};
    }

    /**
     */
    private rootKey(rootName: string): string {
        return `${this.storageKey}::${rootName}`;
    }
}