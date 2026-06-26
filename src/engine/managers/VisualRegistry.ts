import { VisualObject } from "../visuals/VisualObject";
import { TypedEventEmitter } from "../events/TypedEventEmitter";
import type { RuntimeEvents } from "../events/RuntimeEvents";
import enableInteractiveMode from "../utils/EnableInteractiveMode";
import { VisualFactory, type SupportedVisualTypes } from "./VisualFactory";
import type { Container } from "pixi.js";
import { Logger } from "@/lib/logger";

/**
 * Centralized registry for visual lifecycle: creation, system registration, and destruction.
 */
export class VisualRegistry {
    private visuals: VisualObject[] = [];
    private onRegisterCallbacks: Array<(visual: VisualObject) => void> = [];
    private onDestroyCallbacks: Array<(visual: VisualObject) => void> = [];
    private readonly logger = Logger.getOrCreateLogger("VisualRegistry");

    constructor(
        private readonly stage: Container,
        private readonly eventsBus: TypedEventEmitter<RuntimeEvents>
    ) { }

    /**
     * Create a visual with strict type checking and spread arguments.
     * Only registered visual types are allowed, enforced at compile time.
     *
     * @param type - The visual type to create (must be registered in VisualFactory)
     * @param args - Constructor arguments for the visual
     * 
     * @throws {Error} If the visual type is not registered, or if arguments do not match the constructor signature
     */
    public create<K extends keyof SupportedVisualTypes>(
        type: K,
        ...args: ConstructorParameters<SupportedVisualTypes[K]>
    ): InstanceType<SupportedVisualTypes[K]> {
        const visual = VisualFactory.create(type, ...args);
        this.registerVisual(visual as VisualObject);
        return visual;
    }

    public destroy(visual: VisualObject): void {
        const index = this.visuals.indexOf(visual);

        if (index === -1) {
            this.logger.warn(`Attempted to destroy visual with id ${visual.uid}, but it was not found in the registry.`);
            return;
        }

        this.destroyAtIndex(index);
    }

    public destroyById(visualId: number): void {
        for (let i = 0; i < this.visuals.length; i++) {
            if (this.visuals[i].uid === visualId) {
                this.destroyAtIndex(i);
                return;
            }
        }

        this.logger.warn(`Attempted to destroy visual with id ${visualId}, but it was not found in the registry.`);
    }

    /**
     * Get all registered visuals.
     */
    public getAll(): ReadonlyArray<VisualObject> {
        return this.visuals;
    }

    /**
     * Find a visual by ID.
     */
    public getById(visualId: number): VisualObject | undefined {
        return this.visuals.find(v => v.uid === visualId);
    }

    /**
     * Clear all visuals.
     */
    public clear(): void {
        for (let i = this.visuals.length - 1; i >= 0; i--) {
            this.destroyAtIndex(i);
        }
        this.visuals = [];
    }

    public addOnRegisterCallback(callback: (visual: VisualObject) => void): void {
        this.onRegisterCallbacks.push(callback);
    }

    public addOnDestroyCallback(callback: (visual: VisualObject) => void): void {
        this.onDestroyCallbacks.push(callback);
    }

    /**
     * Register a visual with all systems and add it to the stage.
     * @remarks Called by `create()` and `createFromArgs()` after instantiating a visual.
     */
    private registerVisual(visual: VisualObject): void {
        this.visuals.push(visual);
        this.stage.addChild(visual);
        enableInteractiveMode(visual);

        for (const callback of this.onRegisterCallbacks) {
            try {
                callback(visual);
            } catch (err) {
                this.logger.error(`Error in onRegister callback ${callback.toString()} for visual ${visual.uid}:`, err);
            }
        }

        visual.once("destroyed", () => {
            if (this.visuals.includes(visual)) {
                this.destroy(visual);
            }
        });

        this.eventsBus.emit("visual:created", {
            visualId: visual.uid,
            visualType: visual.constructor.name,
        });
    }

    /**
     * Destroy a visual instance directly.
     */
    private destroyAtIndex(index: number): void {
        if (index < 0 || index >= this.visuals.length) {
            throw new Error(`Invalid visual index: ${index}. Must be between 0 and ${this.visuals.length - 1}.`);
        }

        const visual = this.visuals[index];

        { // swap with the last element and pop to avoid shifting the array
            const lastVisual = this.visuals[this.visuals.length - 1];
            this.visuals[index] = lastVisual;
            this.visuals.pop();
        }

        for (const callback of this.onDestroyCallbacks) {
            try {
                callback(visual);
            } catch (err) {
                this.logger.error(`Error in onDestroy callback ${callback.toString()} for visual ${visual.uid}:`, err);
            }
        }

        if (!visual.destroyed) {
            visual.destroy();
        }

        this.eventsBus.emit("visual:destroyed", {
            visualId: visual.uid,
            visualType: visual.constructor.name,
        });
    }
}
