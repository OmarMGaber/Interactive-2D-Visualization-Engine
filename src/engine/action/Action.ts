import type { VisualObject } from "../visuals/VisualObject";

export interface Action<T extends VisualObject> {
    apply(target: T): Promise<void>;
    reverse?(target: T): Promise<void>;
    getDescription?(): string;
}