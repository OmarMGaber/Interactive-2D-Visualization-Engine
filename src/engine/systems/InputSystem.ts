import type { Container } from "pixi.js";
import { EventEmitter } from "../events/EventEmitter";

/**
 * Interface for providing input state and registering input event handlers.
 * 
 * @description This interface defines methods for registering event handlers for specific input topics and retrieving the unique identifier of the stage container.
 */
export interface InputStateProvider {
    /** 
     * Registers an event handler for a specific input topic.
     * @param topic - The input topic to listen for (e.g., "wheel", "pointerdown").
     * @param fn - The callback function to invoke when the event occurs. It receives a payload of type `TPayload`.
     * @returns A function that can be called to unregister the event handler.
     * 
     * @template TPayload - The type of the payload that will be passed to the callback function.
     */
    register<TPayload>(topic: string, fn: (payload: TPayload) => void): () => void;

    /**
     * Gets the unique identifier of the stage container.
     * @returns The unique identifier (UID) of the stage container.
     */
    get stageContainerId(): number;
}

/**
 * InputSystem is responsible for listening to user input events on the stage and forwarding them to the InputEventBus.
 * @description Bridges Pixi and DOM input events into the shared engine bus.
 */
export class InputSystem implements InputStateProvider {
    private registeredTopics: Set<string> = new Set();

    constructor(
        public readonly stage: Container,
        private readonly eventBus: EventEmitter
    ) {
        // Wheel events are not automatically forwarded by Pixi, so we need to listen for them on the window and forward them to the bus.
        // { passive: true } to improve scrolling performance and avoid blocking the main thread.
        window.addEventListener("wheel", this.onWheel, { passive: true });
    }

    public register<TPayload>(topic: string, fn: (payload: TPayload) => void): () => void {
        if (!this.registeredTopics.has(topic)) {
            // Mirror the Pixi stage event into the shared bus only once per topic.
            this.syncTopicToBus(topic);
        }

        return this.eventBus.on(topic, fn);
    }

    public get stageContainerId(): number {
        return this.stage.uid;
    }

    private onWheel = (e: WheelEvent): void => {
        this.eventBus.emit("wheel", e);
    };

    private syncTopicToBus(topic: string): void {
        this.stage.on(topic, (e) => this.eventBus.emit(topic, e));
        this.registeredTopics.add(topic);
    }
}