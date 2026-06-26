import type { FederatedPointerEvent } from "pixi.js";
import { BasePointerOption } from "./BasePointerOption";
import type { InputStateProvider } from "../../InputSystem";
import type { RuntimeCommands } from "@/engine/events/RuntimeCommands";
import type { EventDispatcher } from "@/engine/events/TypedEventEmitter";

export class PointerDownOption extends BasePointerOption {
    constructor(
        inputSystem: InputStateProvider,
        private commandsBus: EventDispatcher<RuntimeCommands>,
    ) {
        super(
            "Pointer Down",
            "Handles pointer down events for tracking selected objects",
            inputSystem,
        );

        this.unsubscribe = this.inputSystem.register("pointerdown", this.onPointerDown);
    }

    private onPointerDown = (event: FederatedPointerEvent): void => {
        this.executeIfEnabled(() => {
            const hitObject = this.getHit(event);
            this.commandsBus.emit("interaction:select", {object: hitObject});
        });
    };

    onSystemEnable(): void {
        if (!this.unsubscribe) {
            this.unsubscribe = this.inputSystem.register("pointerdown", this.onPointerDown);
        }
    }
}
