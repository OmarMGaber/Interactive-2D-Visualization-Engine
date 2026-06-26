import { RegistrySystem } from "./RegistrySystem";
import { clamp } from "../../math/Clamp";
import type { VisualObject } from "../visuals/VisualObject";
import type { RuntimeContext } from "@/engine/RuntimeContext";

/**
 * A system for managing zoom functionality for visual objects.
 *  
 * This system listens for mouse wheel events and adjusts the zoom factor of visual objects accordingly.
 * It only mutates the zoom factor of objects that are either hovered over or selected
 * and it ensures that the zoom factor remains within defined minimum and maximum limits.
 * Visauls that are not registered with this system will not be affected by zoom events.
 * 
*/
export class ZoomSystem extends RegistrySystem<VisualObject> {
    private readonly zoomSensitivity = 0.0005;
    private readonly minZoom = 0.1;
    private readonly maxZoom = 10;

    constructor(
        runtimeCtx: RuntimeContext,
    ) {
        super(runtimeCtx);

        this.runtimeCtx.input.register("wheel", this.onWheel);
    }

    private getZoom(target: VisualObject): number {
        return target.zoomFactor;
    }

    private setZoom(target: VisualObject, value: number): void {
        target.zoomFactor = value;
        target.scale.set(value);
    }

    private onWheel = (event: WheelEvent): void => {
        if (!this.state.isEnabled()) return;

        const hovered = this.runtimeCtx.interactionManagerState.getHovered() as VisualObject | null;
        const selected = this.runtimeCtx.interactionManagerState.getSelected() as VisualObject | null;

        const target = hovered ?? selected;
        if (!target || !this.objects.has(target)) return;

        this.applyZoom(target, event.deltaY);
    };

    private applyZoom(target: VisualObject, deltaY: number): void {
        const current = this.getZoom(target);

        const zoomFactor = Math.exp(-deltaY * this.zoomSensitivity);

        let next = current * zoomFactor;

        next = clamp(next, this.minZoom, this.maxZoom);

        this.setZoom(target, next);
    }
}