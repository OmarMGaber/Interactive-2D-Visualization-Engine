import { Container, FederatedPointerEvent } from "pixi.js";
import type { Vec2 } from "../../math/Vec2";
import type { RuntimeContext } from "../RuntimeContext";
import { RegistrySystem } from "./RegistrySystem";

/**
 * A system that allows registered objects to be dragged and moved with the mouse or touch input.
 */
export class DragSystem extends RegistrySystem<Container> {
    private dragging = false;
    private offset: Vec2 = { x: 0, y: 0 };

    constructor(
        runtimeCtx: RuntimeContext,
    ) {
        super(runtimeCtx);

        this.runtimeCtx.input.register("pointerdown", this.onDown);
        this.runtimeCtx.input.register("globalpointermove", this.onMove);
        this.runtimeCtx.input.register("pointerup", this.onUp);

        this.onUnregisterHook = (obj) => {
            // if the currently dragged object is unregistered, stop dragging
            if (this.runtimeCtx.interactionManagerState.getSelected() === obj) {
                this.dragging = false;
            }
        };
    }

    private onDown = (event: FederatedPointerEvent): void => {
        if (!this.state.isEnabled()) return;

        const obj = this.runtimeCtx.interactionManagerState.getSelected();
        if (!obj) return;

        // ensure it's draggable (registered)
        if (!this.objects.has(obj as any)) return;

        this.dragging = true;

        const parent = obj.parent!;
        const local = event.getLocalPosition(parent);

        this.offset.x = local.x - obj.x;
        this.offset.y = local.y - obj.y;
    };

    private onMove = (event: FederatedPointerEvent): void => {
        if (!this.state.isEnabled()) return;
        if (!this.dragging) return;

        const obj = this.runtimeCtx.interactionManagerState.getSelected();
        if (!obj) return;

        const parent = obj.parent!;
        const global = event.global;
        const local = parent.toLocal(global);

        obj.position.set(
            local.x - this.offset.x,
            local.y - this.offset.y
        );
    };

    private onUp = (): void => {
        if (!this.state.isEnabled()) return;

        this.dragging = false;
    };
}