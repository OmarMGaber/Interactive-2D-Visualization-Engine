import { Logger } from "@/lib/logger";
import type { SettingsBundle } from "./SettingsSchema";

/**
 * A symbol used to connect notifiers to settings nodes.
 * Used to make the connection without exposing the notifier API publicly on the SettingsNode class, 
 * since only the SettingsManager and the class internally should be aware of notifiers.
 */
export const CONNECT_NOTIFIER = Symbol("CONNECT_NOTIFIER");

/**
 * Represents a node in the settings tree. 
 * Each node should only care about its own slice of the settings data, and delegate the rest to its children.
 */
export class SettingsNode<ConfigurationType> {
    private _onDirty: (() => void) | null = null;
    private readonly _children: SettingsNode<any>[] = [];
    static readonly logger = Logger.getOrCreateLogger("SettingsNode");

    constructor(
        public readonly key: string,
        private readonly exporter: () => ConfigurationType,
        private readonly importer: (data: ConfigurationType) => void,
        readonly children: SettingsNode<any>[] = [],
        private readonly reset?: () => ConfigurationType,
    ) {
        if (children.length > 0) {
            for (const child of children) {
                this.addChild(child);
            }
        }
    }

    /**
     * Adds a child node to this node.
     * @note The child's notifier will be changed to point to this node's notifier 
     * 
     * @param child The child node to add.
     */
    public addChild(child: SettingsNode<any>): void {
        this._children.push(child);
        child[CONNECT_NOTIFIER](() => this.notify());
    }

    public removeChild(child: SettingsNode<any>): void {
        const index = this._children.indexOf(child);
        if (index !== -1) {
            this._children.splice(index, 1);
            child[CONNECT_NOTIFIER](null);
        }
    }

    /**
     * Calls the connected notifier, if any. 
     * This should be called whenever this node's configuration is modified, 
     * so that the change can be propagated up to the SettingsManager and eventually persisted to storage.
     */
    public notify(): void {
        if (!this._onDirty) {
            SettingsNode.logger.warn(`No notifier connected for node "${this.key}, call chain ${new Error().stack}".`);
            return;
        }

        this._onDirty();
    }

    /**
     * Exports this node and all its descendants into a bundle. The bundle is expected to be consumed by {@link import}.
     * 
     * @returns A settings bundle containing this node's configuration and all descendant configurations, keyed by their respective node keys. 
     */
    public export(): SettingsBundle {
        const bundle: SettingsBundle = {
            [this.key]: { data: this.exporter() }
        };

        Object.assign(bundle, { children: { data: {} } });

        for (const child of this._children) {
            Object.assign(bundle.children.data!, child.export().children.data);
        }

        return bundle;
    }

    /**
     * Imports data from a bundle into this node and all its descendants.
     * The bundle is expected to contain an entry for this node's key, as well as entries for all descendant nodes.
     * 
     * @param bundle The settings bundle to import 
     */
    public import(bundle: SettingsBundle): void {
        SettingsNode.logger.info(`Importing settings for node "${this.key}" from bundle:`, bundle);

        const envelope = bundle[this.key];
        if (envelope) {
            this.importer(envelope.data as ConfigurationType);
        }

        for (const child of this._children) {
            child.import(bundle);
        }
    }

    /**
     * Creates a blank node with no {@link exporter} or {@link importer}. 
     * This can be used as a placeholder or for nodes that only serve as organizational branches in the settings tree.
     * 
     * @param key The key name for this node
     * @returns A new SettingsNode instance with no-op exporter and importer hooks.
     */
    public static BlankNode(key: string): SettingsNode<any> {
        return new SettingsNode(
            key,
            () => { },
            () => { },
        );
    }

    public resetToDefaults(resetChildNodes?: boolean): void {
        if (this.reset) {
            const defaultConfig = this.reset();
            this.importer(defaultConfig);
            this.notify();
        }

        if (resetChildNodes) {
            for (const child of this._children) {
                child.resetToDefaults(resetChildNodes);
            }
        }
    }

    /**
     * Connects or disconnects the dirty-state notifier for this node.
     * The notifier is invoked whenever this node, or any of its descendants,
     * reports a configuration change through {@link notify}.
     *
     * This API is intended for internal use only and is exposed
     * through the {@link CONNECT_NOTIFIER} symbol to avoid leaking notifier
     * management into the public API surface.
     *
     * @remarks A node may only have a single notifier at a time, meaning it should belong
     * to exactly one settings tree (i.e. have only one parent).
     *
     * @param onDirty Callback invoked when this node becomes dirty,
     * or `null` to disconnect the current notifier.
     */
    private [CONNECT_NOTIFIER](onDirty: (() => void) | null): void {
        this._onDirty = onDirty;
    }
}