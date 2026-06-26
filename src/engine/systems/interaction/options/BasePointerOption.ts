import type { FederatedPointerEvent } from "pixi.js";
import { SystemOption, } from "../../SystemOption";
import type { InputStateProvider } from "../../InputSystem";
import type { VisualObject } from "@/engine/visuals/VisualObject";

export abstract class BasePointerOption extends SystemOption {
    protected unsubscribe: (() => void) | null = null;

    constructor(
        name: string,
        description: string,
        protected readonly inputSystem: InputStateProvider,
    ) {
        super(name, description);
    }

    protected getHit(event: FederatedPointerEvent): VisualObject | null {
        const target = event.target as VisualObject;
        if (target?.uid <= this.inputSystem.stageContainerId) return null; // stage is hit, ignore

        return target;
    }

    public onSystemDisable(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    public destroy(): void {
        this.onSystemDisable();
    }
}
