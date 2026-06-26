import type { FederatedPointerEvent } from "pixi.js";
import { BasePointerOption } from "./BasePointerOption";
import type { InputStateProvider } from "../../InputSystem";
import type { RuntimeCommands } from "@/engine/events/RuntimeCommands";
import type { EventDispatcher } from "@/engine/events/TypedEventEmitter";

export class PointerMoveOption extends BasePointerOption {
    constructor(
        inputSystem: InputStateProvider,
        private commandsBus: EventDispatcher<RuntimeCommands>,
    ) {
        super(
            "Pointer Move",
            "Handles pointer move events for tracking hovered objects",
            inputSystem,
        );

        this.unsubscribe = this.inputSystem.register("globalpointermove", this.onPointerMove);
    }

    private onPointerMove = (event: FederatedPointerEvent): void => {
        this.executeIfEnabled(() => {
            const hitObject = this.getHit(event);
            this.commandsBus.emit("interaction:hover", {object: hitObject});
        });
    };

    onSystemEnable(): void {
        if (!this.unsubscribe) {
            this.unsubscribe = this.inputSystem.register("globalpointermove", this.onPointerMove);
        }
    }
}
