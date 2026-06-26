import { System } from "../System";
import { PointerMoveOption } from "./options/PointerMoveOption";
import { PointerDownOption } from "./options/PointerDownOption";
import { PointerOutOption } from "./options/PointerOutOption";
import type { RuntimeContext } from "@/engine/RuntimeContext";

/**
 * A system that manages user interaction with visual objects in the scene, including pointer events such as hover, click, and drag.
 * 
 * @description This system registers options for handling pointer down, pointer move, and pointer out events. 
 * It provides a centralized way to manage user interactions with visual objects, allowing other systems to respond to these events as needed.
 * 
 * @remark THis system mutates the state of the interaction manager through the registered options, by dispatching commands to the commands channel.
 */
export class InteractionSystem extends System {
    constructor(
        runtimeCtx: RuntimeContext,
    ) {
        super(runtimeCtx);

        this._optionManager.register(PointerDownOption, this.runtimeCtx.input, this.runtimeCtx.commandsChannel);
        this._optionManager.register(PointerMoveOption, this.runtimeCtx.input, this.runtimeCtx.commandsChannel);
        this._optionManager.register(PointerOutOption, this.runtimeCtx.input, this.runtimeCtx.commandsChannel);
    }

    public destroy(): void {
        this._optionManager.destroy();
    }
}
