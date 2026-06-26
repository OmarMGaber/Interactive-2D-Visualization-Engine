## Settings System

A hierarchical, tree-based settings management system for persisting and restoring runtime state.
Each module (system, option, manager) can expose a `SettingsNode` to serialize its configuration,
which is automatically persisted to localStorage and restored on app startup.

## Why This Exists

- **Single source of truth**: Centralized settings tree that mirrors the runtime object hierarchy.
- **Automatic persistence**: Changes notify the tree, which triggers a save to localStorage.
- **Stateless restore**: Load previous settings and replay them on startup without manual wiring.
- **Pluggable storage**: Swap persistence backends (localStorage, IndexedDB, file API, etc.).
- **Flexible strategies**: Bundle all settings into one object or separate them per-module.

## Key Building Blocks

### SettingsProvider (`SettingsProvider.ts`)
- Interface for objects that expose a settings node.
- Helper function `isSettingsProvider()` to check if an object is a provider.
- Enables duck-typing: any object with a `settingsNode` property works.

### SettingsNode (`SettingsNode.ts`)
- Represents one slice of the settings tree.
- Owns three responsibilities:
  - **Export**: Serialize its config via an `exporter` function.
  - **Import**: Deserialize config via an `importer` function.
  - **Notify**: Signal changes to the parent so they bubble up and trigger persistence.
- Supports parent–child relationships through `addChild()` and `removeChild()`.
- Provides static factory `BlankNode()` for organizational branches (no-op import/export).

### SettingsBundle & SettingsSchema (`SettingsSchema.ts`)
- `SettingsBundle`: `Record<key, SettingsEnvelope>` — serialized settings tree.
- `SettingsEnvelope`: Wraps config data; allows future metadata without API changes.
- Example: `{ "DragSystem-settings": { data: { enabled: true } }, "DebugSystem-settings": { data: { ... } } }`

### Storage Abstraction

#### PersistSettingsStorage (`strategy/persist/PersistSettingsStorage.ts`)
- Low-level interface for read/write/clear operations on the full settings bundle.
- Implementations: `LocalStorageAdapter`, IndexedDB adapter, file API, etc.

#### StorageStrategy (`strategy/storage/StorageStrategy.ts`)
- Mid-level interface: controls how bundles are loaded, batched, and committed.
- Two built-in strategies:
  - **BundledStorageStrategy**: One localStorage entry for all settings.
  - **SeparateStorageStrategy**: Each settings root in its own entry (e.g., `app::DragSystem-settings`).
- Defers writes until `commit()` is called (batch optimization).

## How It Works (Sequence)

1. **Setup Phase** (app startup)
   - Create systems/options with `SettingsNode` instances.
   - Attach them to a root node via `addChild()`, building the tree.
   - Initialize storage strategy and `SettingsManager`.
   - Call `import()` on the root node to load persisted values.

2. **Runtime Phase** (user interacts)
   - A system changes its state (e.g., enabled → disabled).
   - Calls `this.settingsNode.notify()`.
   - Notification bubbles up to the root node.
   - Root notifies the `SettingsManager`.

3. **Persist Phase** (batched)
   - Manager collects all dirty nodes' exports via `export()`.
   - Calls `storageStrategy.push(bundle)`.
   - On next idle moment or explicit `commit()`, writes to storage.

4. **Restore Phase** (next session)
   - App loads; `SettingsManager` calls `storageStrategy.load(keys)`.
   - Calls `import()` on root node to replay saved state.
   - All systems/options are restored to their previous state.

## Contributing: Add Settings to a New Module

1. Make your class implement `SettingsProvider<T>`:
   ```typescript
   export class MySystem implements SettingsProvider<MySystemSettings> {
       public readonly settingsNode: SettingsNode<MySystemSettings>;

       constructor(/* ... */) {
           this.settingsNode = new SettingsNode(
               "MySystem-settings",
               () => ({ enabled: this.state.isEnabled() }),  // exporter
               (data) => data.enabled ? this.state.enable() : this.state.disable(),  // importer
           );
       }
   }
   ```

2. Wire options and children:
   ```typescript
   // Attach option manager settings to the system settings tree
   this.settingsNode.addChild(this._optionManager.settingsNode);
   ```

3. Signal changes:
   ```typescript
   this.state.subscribe(() => this.settingsNode.notify());
   ```

4. Register with the root settings tree during runtime bootstrap.

## Storage Strategy Guide

- **BundledStorageStrategy**: Best for small to medium settings footprint.
  - Single localStorage write per batch.
  - Good for most visualizers.

- **SeparateStorageStrategy**: Best when some modules are optional or updated independently.
  - Separate key per root reduces re-write overhead.
  - Better for large settings that change frequently.

Choose `BundledStorageStrategy` by default unless you have specific I/O or module-isolation needs.

## Reset & Lifecycle

- `resetToDefaults()`: Restore a node (and optionally children) to their initial state.
- `import(bundle)`: Replay serialized state (called on app startup).
- `export()`: Serialize current state (called before persist).
- Settings are lazily loaded: only keys explicitly requested via `storageStrategy.load()` are deserialized.

## Update Checklist

When adding or modifying settings:

- Exporter returns current state, importer replays it correctly.
- Parent notifies when state changes.
- Children are attached/detached cleanly (no orphaned listeners).
- Storage strategy is appropriate for the settings volume and change frequency.
- Tests verify export -> import -> export produces the same result (idempotency).

## Directory Notes

- `SettingsNode.ts`, `SettingsProvider.ts`, `SettingsSchema.ts` - core tree API.
- `strategy/persist/` - low-level storage backends (localStorage, etc.).
- `strategy/storage/` - mid-level strategies (bundled, separate, custom).

Settings are simple when each node knows its slice, notifies its parent, and trusts the tree.
