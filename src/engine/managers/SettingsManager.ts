import type { SettingsProvider } from "../settings/SettingsProvider";
import { type SettingsNode, CONNECT_NOTIFIER } from "../settings/SettingsNode";
import type { SettingsBundle } from "../settings/SettingsSchema";
import type { StorageStrategy } from "../settings/strategy/storage/StorageStrategy";
import { Logger } from "@/lib/logger";
import { debounce } from "../common/Debouncer";

export class SettingsManager {
    // Key = node.key, value = the node itself.
    private readonly roots = new Map<string, SettingsNode<any>>();

    /**
     * Tracks which roots have been modified since the last commit.
     * Only dirty nodes are pushed on the next save cycle, keeping
     * both the number of `push` calls and the data written to storage minimal.
     */
    private readonly dirtyKeys = new Set<string>();

    private readonly logger: Logger = Logger.getOrCreateLogger("SettingsManager");

    // private saveTimer: ReturnType<typeof setTimeout> | null = null;
    private destroyed = false;

    private static readonly SAVE_DEBOUNCE_MS = 300;

    private readonly saveDebouncer = debounce(() => this.saveImmediately(), SettingsManager.SAVE_DEBOUNCE_MS);

    constructor(private readonly storageStrategy: StorageStrategy) {
        this.handleUnload = this.handleUnload.bind(this);
        window.addEventListener("beforeunload", this.handleUnload);
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Registers a settings node with the manager.
     * Loads persisted data if available; otherwise writes defaults immediately.
     */
    addRoot(provider: SettingsProvider<any>): void {
        this.assertAlive();

        const node = provider.settingsNode;

        if (this.roots.has(node.key)) {
            this.logger.warn(`Node "${node.key}" is already registered.`);
            return;
        }

        this.roots.set(node.key, node);
        node[CONNECT_NOTIFIER](() => this.scheduleNodeSave(node.key));

        const saved = this.storageStrategy.load([node.key]);

        if (node.key in saved) {
            this.logger.info(`Loaded persisted settings for node "${node.key}".`, saved[node.key]);
            
            this.importNode(node, saved);
        } else { // No saved data, push defaults immediately so that something is persisted for next time.
            this.logger.info(`No persisted settings found for node "${node.key}". Saving defaults.`);
            
            this.dirtyKeys.add(node.key);
            this.saveImmediately();
        }
    }

    /**
     * Unregisters a settings node. The node's notifier is always disconnected
     * and its dirty state is cleared, regardless of whether it was registered.
     */
    removeRoot(provider: SettingsProvider<any>): void {
        const node = provider.settingsNode;

        // Always disconnect the notifier — even if the node was not registered —
        // to prevent stale callbacks from firing after removal.
        node[CONNECT_NOTIFIER](null);

        if (!this.roots.has(node.key)) return;

        this.roots.delete(node.key);
        this.dirtyKeys.delete(node.key);

        this.logger.info(`Node "${node.key}" unregistered and its dirty state cleared.`);
    }

    /**
     * Forces an immediate save of every registered node, bypassing debounce.
     */
    save(): void {
        this.assertAlive();
        this.markAllDirty();
        this.saveImmediately();
    }

    /**
     * Reloads every registered node from storage, discarding unsaved changes.
     */
    reload(): void {
        this.assertAlive();

        const keys = [...this.roots.keys()];
        const saved = this.storageStrategy.load(keys);

        for (const [key, node] of this.roots) {
            if (key in saved) {
                this.importNode(node, saved);
            }
        }
    }

    resetToDefaults(): void {
        this.assertAlive();

        for (const node of this.roots.values()) {
            node.resetToDefaults();
        }

        this.save();
    }

    /**
     * Clears the persisted state for all registered nodes and cancels any
     * pending save.
     */
    clear(): void {
        this.assertAlive();
        this.saveDebouncer.cancel();
        this.dirtyKeys.clear();
        this.storageStrategy.clear([...this.roots.keys()]);
    }

    /**
     * Returns a snapshot bundle of all registered nodes' current in-memory state.
     */
    snapshot(): SettingsBundle {
        this.assertAlive();

        const bundle: SettingsBundle = {};

        for (const [key, node] of this.roots) {
            try {
                Object.assign(bundle, node.export());
            } catch (err) {
                this.logger.warn(`Snapshot failed for "${key}".`, err);
            }
        }

        return bundle;
    }

    /**
     * Saves all nodes, disconnects all notifiers, and permanently disables
     * this instance.
     */
    destroy(): void {
        if (this.destroyed) return;

        // Mark everything dirty so no unsaved state is lost.
        this.markAllDirty();
        this.saveImmediately();

        for (const node of this.roots.values()) node[CONNECT_NOTIFIER](null);

        this.roots.clear();
        this.dirtyKeys.clear();

        window.removeEventListener("beforeunload", this.handleUnload);
        this.destroyed = true;
    }

    /**
     * Marks a single node dirty and arms the debounce timer.
     * Multiple rapid changes to the same (or different) nodes
     * collapse into one write cycle.
     */
    private scheduleNodeSave(key: string): void {
        if (this.destroyed) return;

        this.dirtyKeys.add(key);

        this.saveDebouncer();
    }

    /**
     * Flushes only dirty nodes to the persistence strategy, then commits.
     * Skips entirely if nothing is dirty — no-op I/O.
     */
    private saveImmediately(): void {
        this.assertAlive();
        this.saveDebouncer.cancel();

        if (this.dirtyKeys.size === 0) return;

        for (const key of this.dirtyKeys) {
            const node = this.roots.get(key);
            if (!node) continue;

            try {
                const exported = node.export();
                this.logger.info(`Saving node "${key}":`, exported);
                this.storageStrategy.push(exported);
            } catch (err) {
                this.logger.warn(`Export failed for "${key}".`, err);
            }
        }

        this.dirtyKeys.clear();
        this.storageStrategy.commit();
    }

    private importNode(node: SettingsNode<any>, bundle: SettingsBundle): void {
        try {
            node.import(bundle);
        } catch (err) {
            this.logger.warn(`Import failed for "${node.key}". Node will use its defaults.`, err);
        }
    }

    private markAllDirty(): void {
        for (const key of this.roots.keys()) this.dirtyKeys.add(key);
    }

    /**
     * Flushes any pending dirty state on page unload.
     * Guards against the case where a timer is NOT pending but dirty keys still
     * exist (e.g. after a failed commit or a late-arriving push).
     */
    private handleUnload(): void {
        if (this.dirtyKeys.size > 0) {
            this.logger.info(`Page unloading with ${this.dirtyKeys.size} dirty node(s). Flushing to storage.`);
            this.saveImmediately();
        }
    }

    private assertAlive(): void {
        if (this.destroyed) {
            throw new ReferenceError("[SettingsManager] This instance has been destroyed.");
        }
    }
}