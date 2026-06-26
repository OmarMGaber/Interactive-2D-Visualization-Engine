import { Container, Ticker } from "pixi.js";
import { RegistrySystem } from "../RegistrySystem";
import { DebugInfoOption } from "./options/DebugInfoOption";
import { ShowAllDebugOption } from "./options/ShowAllDebugOption";
import { FpsCounterOption } from "./options/FpsCounterOption";
import { type DebugTextHandler } from "./DebugTextHandler";
import type { RuntimeContext } from "@/engine/RuntimeContext";

/**
 * A system that manages the display of debug information for visual objects in the scene.
 * 
 * @description This system registers options for showing debug information on individual objects, showing all debug information, and displaying an FPS counter.
 * It uses a `DebugTextHandler` to handle the actual display of debug information.
 * 
 * @remark This system is designed to work with Pixi.js containers and assumes that the objects being debugged are instances of `Container`.
 */
export class DebugSystem extends RegistrySystem<Container> {

    constructor(
        runtimeCtx: RuntimeContext,
        private debugTextHandler: DebugTextHandler,
    ) {
        super(runtimeCtx);

        this._optionManager.register(DebugInfoOption, this.objects, this.runtimeCtx.interactionManagerState, this.debugTextHandler);
        this._optionManager.register(ShowAllDebugOption, this.objects, this.debugTextHandler);
        this._optionManager.register(FpsCounterOption);

        this.setupOptionsRules();
    }

    /**
     * Attaches the debug HUD's to a specific HTML element in the DOM. This is typically used to display the FPS counter and other debug information.
     * 
     * @param host - The HTML element to which the debug HUD's will be attached.
     */
    public attachHost(host: HTMLElement): void {
        this._optionManager.get(FpsCounterOption)?.attachHost(host);
    }

    /**
     * Updates the debug system, including the FPS counter, based on the provided ticker.
     * 
     * @description This method is called on each tick of the application's main loop. It updates the FPS counter if the system is enabled.
     * 
     * @param ticker - The ticker object that provides the current FPS and other timing information.
     * 
     * @remark This method should be called in the main update loop of the application to ensure that the debug information is kept up to date.
     */
    public update(ticker: Ticker): void {
        if (!this.state.isEnabled()) {
            return;
        }

        this._optionManager.get(FpsCounterOption)?.update(ticker.FPS);
    }

    public destroy(): void {
        this._optionManager.destroy();
    }

    /**
     * Sets up the rules for the debug options.
     * @example When "Show All Debug Info" is enabled, it will automatically disable "Show Debug Info" to prevent conflicting states.
     * 
     * @remark This method ensures that the debug options behave correctly in relation to each other, preventing situations where both options could be enabled simultaneously, which would lead to unexpected behavior.
     */
    // TODO: This method should be refactored to be more generic and not hardcoded to specific options. Consider using a more flexible approach to define rules between options.
    private setupOptionsRules(): void {
        const debugInfoOption = this._optionManager.get(DebugInfoOption);
        const showAllDebugOption = this._optionManager.get(ShowAllDebugOption);

        if (debugInfoOption && showAllDebugOption) {
            // When "Show All Debug Info" is enabled, force disable "Show Debug Info"
            showAllDebugOption.state.subscribe((enabled) => {
                if (enabled) {
                    debugInfoOption.state.disable();
                }
            });
        }
    }
}


