## Runtime Systems

Systems are runtime modules that encapsulate behavior (input handling, dragging, zooming,
outlines, debug overlays, etc.) and keep that behavior out of core runtime code.

Each system receives `RuntimeContext`, can be enabled/disabled, and can expose configurable
`SystemOption`s. The engine composes many systems together through `SystemManager`.

## Why This Exists

- Keep behaviors isolated and testable.
- Allow features to be added without changing the runtime bootstrap flow.
- Enable per-feature toggles and settings persistence through `SettingsNode`.

## Key Building Blocks

- `System` (`System.ts`)
	- Base class for all systems.
	- Owns `state` (enabled/disabled), lifecycle hooks (`onEnableHook`/`onDisableHook`),
		and an `OptionManager`.
	- Exposes serializable metadata via `getInfoSnapshot()`.

- `RegistrySystem<T extends Container>` (`RegistrySystem.ts`)
	- `System` + object registry (`registerObject` / `unregisterObject`).
	- Use when behavior only applies to a subset of visuals.
	- Forwards object register/unregister lifecycle events to options.

- `SystemOption` (`SystemOption.ts`)
	- Feature toggle/config unit owned by a system.
	- Has its own enabled state and settings serialization.
	- Can react to system and object lifecycle events.

- `OptionManager` (in `engine/managers/OptionManager.ts`)
	- Registers and retrieves options.
	- Automatically disables options when the parent system is disabled.
	- Restores previous option states when the system is re-enabled.

## Runtime Lifecycle (High Level)

1. A system is registered through `SystemManager`.
2. The system constructor wires listeners/options using `RuntimeContext`.
3. Engine toggles system state as needed (`enableAll`, `disableAll`, or per-system).
4. If the system implements `update(ticker)`, it is updated each frame.
5. On runtime shutdown, `destroy()` is called and listeners/resources must be released.

## Event-Driven vs Tick-Driven Systems

- Event-driven examples: `DragSystem`, `ZoomSystem`, `InteractionSystem`.
	- Subscribe to input/commands/events and react only when events happen.

- Tick-driven examples: systems that implement `update(ticker)` for per-frame work.
	- `DebugSystem` is hybrid: it listens/reacts through options and also updates per-frame (FPS).

Choose event-driven by default. Add `update` only when continuous frame updates are required.

## Contributing: Add a New System

1. Choose base class:
	 - Extend `System` for global behavior.
	 - Extend `RegistrySystem` for object-scoped behavior.
2. Wire dependencies in constructor via `RuntimeContext` and explicit args.
3. Register any options through `_optionManager.register(...)`.
4. Guard behavior with `this.state.isEnabled()`.
5. Implement `destroy()` to unsubscribe/cleanup external resources.
6. Register the system in runtime bootstrap using `SystemManager.register(...)`.

## Update Checklist

When changing or adding a system, verify:

- Enabling/disabling behaves correctly.
- Option states persist and restore as expected.
- Listeners are not duplicated and are cleaned up on destroy.
- `RegistrySystem` membership is respected before mutating objects.
- `getInfoSnapshot()` still reports useful data for editor/debug UI.

## Directory Notes

- Root-level files define common system infrastructure and core systems.
- `interaction/`, `outline/`, and `debug/` group domain-specific systems.
- Nested `options/` folders contain `SystemOption` implementations for that domain.

If you keep systems small, state-aware, and cleanup-safe, they remain easy to compose and maintain.
