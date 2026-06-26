import { Signal } from "../common/Signal";
import type { VisualObject } from "../visuals/VisualObject";

// Interfaces for type safety and abstraction
export interface InteractionStateProvider {
    getHovered(): VisualObject | null;
    getSelected(): VisualObject | null;
    onHover(listener: (obj: VisualObject | null) => void): () => void;
    onSelect(listener: (obj: VisualObject | null) => void): () => void;
}

// InteractionManager definition
export interface InteractionStateHandler {
    setHovered(obj: VisualObject | null): void;
    setSelected(obj: VisualObject | null): void;
}

/**
 * Manages interaction state for visuals, including hovered and selected objects.
 * 
 * Mainly updated by {@link InteractionSystem}.
 * Systems can subscribe to changes via `onHover` and `onSelect` to react to user interactions.
 */
export class InteractionManager implements InteractionStateProvider, InteractionStateHandler {
    #hovered: Signal<VisualObject | null> = new Signal<VisualObject | null>(null);
    #selected: Signal<VisualObject | null> = new Signal<VisualObject | null>(null);

    setHovered(obj: VisualObject | null) {
        this.#hovered.value = obj;
    }

    setSelected(obj: VisualObject | null) {
        this.#selected.value = obj;
    }

    getHovered() { return this.#hovered.value; }
    getSelected() { return this.#selected.value; }

    onHover = this.#hovered.subscribe.bind(this.#hovered);

    onSelect = this.#selected.subscribe.bind(this.#selected);
}