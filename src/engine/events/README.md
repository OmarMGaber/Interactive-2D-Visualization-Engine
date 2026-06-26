## Events & Messaging System

A lightweight, type-safe pub/sub system for decoupled communication between runtime modules.
Supports both untyped string-based events (`EventEmitter`) and strongly typed events (`TypedEventEmitter`),
plus a minimal observable pattern (`Notifier`) for local state notifications.

## Why This Exists

- **Decouple systems**: Systems don't know about each other; they communicate via events.
- **Type safety**: Typed event maps prevent payload mismatches at compile time.
- **Flexible**: Mix untyped and typed emitters depending on use case.
- **Memory efficient**: Listeners are stored in a `Set`; unsubscribe removes them cleanly.
- **Void-safe**: Events with no payload are handled correctly without awkward `undefined` casts.

## Key Building Blocks

### ListenerBucket (`ListenerBucket.ts`)
- Low-level listener storage using a `Set<Listener>`.
- Provides `add()` (returns unsubscribe function) and `values()` (live iterable).
- Used internally by all emitters.

### BaseEventEmitter (`BaseEventEmitter.ts`)
- Abstract base for all emitters.
- Manages a map of `ListenerBucket`s, keyed by event type.
- Provides `on(key, fn)` and protected `dispatch(key, args)`.
- Keeps type inference clean by avoiding direct listener type pollution.

### EventEmitter (`EventEmitter.ts`)
- **Untyped** event bus: string-based event names, any payload.
- Use when event schema is dynamic or loosely coupled.
- Example: `emitter.on("wheel", (event) => { ... })`
- Has static `Shared` singleton for app-wide events.

### TypedEventEmitter (`TypedEventEmitter.ts`)
- **Strongly typed** emitter with a discriminated event map.
- Implements `EventListener<T>` and `EventDispatcher<T>` interfaces.
- Void-safe: events with no payload use empty array syntax.
- Example:
  ```typescript
  type MyEvents = {
    "event:foo": { value: string };
    "event:bar": void;  // no payload
  };
  
  const emitter = new TypedEventEmitter<MyEvents>();
  emitter.on("event:foo", (payload) => payload.value);
  emitter.emit("event:bar");  // no payload arg
  ```

### Notifier (`Notifier.ts`)
- Minimal observable for **local state changes** inside the engine.
- Not an event bus; used for internal subscriptions.
- Examples:
  - System state changes: `system.state.subscribe((enabled) => { ... })`
  - Toggle updates: `toggleState.subscribe((value) => { ... })`

## Command vs. Event Pattern

The runtime uses two event buses with different semantics:

### Commands (`RuntimeCommands.ts`)
- **Intent**: "Do something now" (imperative).
- **Flow**: One sender → handlers (broadcast, but handlers are responsible).
- **Example**: `"interaction:select"` — set selected object.
- **Payload**: Includes all data needed to execute the command.
- Used by UI, player, and systems to request state mutations.

### Events (`RuntimeEvents.ts`)
- **Intent**: "Something happened" (declarative).
- **Flow**: Emitter notifies all listeners.
- **Example**: `"systems:enabled"` — a system just enabled.
- **Payload**: Includes facts about what happened, not how to react.
- Used by debug UI, player, and external integrations to listen.

**Key difference**: Commands are sent; events are emitted after a state change.

## Architecture: Commands → Events

```
UI/Player sends Command
    ↓
System/Manager handles command
    ↓
State mutates
    ↓
Emits Event
    ↓
UI/Player/Debug listen and update
```

This ensures single responsibility: handlers own command logic, listeners react to facts.

## Runtime Commands & Events Schema

Commands are grouped by domain:
- `RuntimeSettingsCommands` — color, speed, reset.
- `RuntimeLifecycleCommands` — pause, resume.
- `RuntimeInteractionCommands` — select, hover.
- `RuntimeVisualsCommands` — create, destroy.
- `RuntimeSystemCommands` — enable/disable systems and options.
- `RuntimePlayerCommands` — play, pause, step.

Events mirror these domains:
- `RuntimeSettingsEvents` — settings changed.
- `RuntimeLifecycleEvents` — paused, resumed, errors.
- `RuntimeVisualEvents` — visual created/destroyed.
- `RuntimeSystemsEvents` — system/option toggled, visual registered.
- `RuntimePlayerEvents` — playback state changed.

Combined into single maps: `RuntimeCommands`, `RuntimeEvents`.

## Contributing: Add a New Command or Event

### Add a Command

1. Add a new type to `RuntimeCommands.ts`:
   ```typescript
   export type RuntimeMyCommands = {
       "my:action": { param: string };
       "my:simpleAction": void;  // if no payload
   };
   ```

2. Add it to the union:
   ```typescript
   export type RuntimeCommands =
       & RuntimeSettingsCommands
       & RuntimeMyCommands
       & /* other domains */;
   ```

3. In your handler, listen for the command:
   ```typescript
   this.runtimeCtx.commandsChannel.on("my:action", (payload) => {
       // Handle command
   });
   ```

### Add an Event

1. Add a new type to `RuntimeEvents.ts`:
   ```typescript
   export type RuntimeMyEvents = {
       "my:actionCompleted": { result: string };
       "my:error": void;
   };
   ```

2. Add it to the union:
   ```typescript
   export type RuntimeEvents =
       & RuntimeSettingsEvents
       & RuntimeMyEvents
       & /* other domains */;
   ```

3. Emit the event after state changes:
   ```typescript
   this.runtimeCtx.eventsChannel.emit("my:actionCompleted", { result: "done" });
   ```

## Best Practices

- **Commands are imperative**, events are declarative.
  - Send a command to request an action; emit an event after it succeeds.
  
- **Type over string**.
  - Prefer `TypedEventEmitter<T>` over bare `EventEmitter` for core buses.
  - String events are fine for transient, local communication.

- **Unsubscribe correctly**.
  - Always store and call unsubscribe functions:
    ```typescript
    const unsubscribe = emitter.on("event", handler);
    // later...
    unsubscribe();
    ```
  - For long-lived subscriptions, clean up in `destroy()` or lifecycle hooks.

- **Void vs. undefined payloads**.
  - Use `void` for events with no payload (not `undefined`).
  - `TypedEventEmitter` handles the `[]` vs `[payload]` distinction for you.

- **Avoid circular dependencies**.
  - Commands and events are central buses; use them instead of direct module-to-module coupling.
  - If module A needs to know about module B, have B emit an event and A listen.

- **Batch commands carefully**.
  - Commands are executed immediately; if you send 10 at once, all 10 handlers run.
  - Use events to gather side effects if you need batching.

## Directory Notes

- `BaseEventEmitter.ts` — core storage + dispatch logic.
- `EventEmitter.ts` — untyped string-based bus.
- `TypedEventEmitter.ts` — strongly typed bus with void-safe payloads.
- `ListenerBucket.ts` — listener set storage.
- `Notifier.ts` — minimal observable for local state.
- `RuntimeCommands.ts` — command type map (imperative).
- `RuntimeEvents.ts` — event type map (declarative).
- `README.md` — this file.

Events are simple when each module knows what it sends and listens to, and when command/event semantics are clear.
