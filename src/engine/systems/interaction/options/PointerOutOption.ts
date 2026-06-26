import type { RuntimeCommands } from "@/engine/events/RuntimeCommands";
import { BasePointerOption } from "./BasePointerOption";
import type { EventDispatcher } from "@/engine/events/TypedEventEmitter";
import type { InputStateProvider } from "../../InputSystem";

export class PointerOutOption extends BasePointerOption {
    constructor(
        inputSystem: InputStateProvider,
        private commandsBus: EventDispatcher<RuntimeCommands>,
    ) {
        super(
            "Pointer Out",
            "Handles pointer out events to clear hover state",
            inputSystem,
        );

        this.unsubscribe = this.inputSystem.register("globalpointerout", this.onPointerOut);
    }

    private onPointerOut = (): void => {
        this.executeIfEnabled(() => {
            this.commandsBus.emit("interaction:hover", {object: null});
        });
    };

    onSystemEnable(): void {
        if (!this.unsubscribe) {
            this.unsubscribe = this.inputSystem.register("globalpointerout", this.onPointerOut);
        }
    }
}
