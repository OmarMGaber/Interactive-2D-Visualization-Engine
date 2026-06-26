import type { RuntimeCommands } from "./events/RuntimeCommands";
import type { RuntimeEvents } from "./events/RuntimeEvents";
import type { EventDispatcher, EventListener } from "./events/TypedEventEmitter";
import type { InteractionStateProvider } from "./managers/InteractionManager";
import type { InputStateProvider } from "./systems/InputSystem";

/**
 * Defines the messaging channels and state providers available to systems within the runtime.
 */
export interface RuntimeMessaging {
    readonly eventsChannel: EventListener<RuntimeEvents>;

    readonly commandsChannel: EventDispatcher<RuntimeCommands>;
}

/**
 * Context object passed to all systems on initialization.
 * @remarks
 * This interface defines the contract for the runtime context, which provides access to
 * the messaging channels and state providers necessary for systems to interact with the runtime.
 * Systems can use this context to subscribe to events, dispatch commands, and access input and interaction states.
 */
export interface RuntimeContext extends RuntimeMessaging {
    readonly interactionManagerState: InteractionStateProvider;

    readonly input: InputStateProvider;
}