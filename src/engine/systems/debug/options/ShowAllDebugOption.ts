import type { Container } from "pixi.js";
import { SystemOption } from "../../SystemOption";
import type { DebugTextHandler } from "../DebugTextHandler";
import type ReadonlyObjectCollection from "@/engine/typing/ReadOnlyCollection";

/**
 * A system option that toggles the visibility of debug information for all registered objects in the scene.
 * 
 * @description When enabled, this option will display debug information for all objects in the scene.
 * When disabled, it will hide all debug information. This option is designed to work with a `DebugTextHandler` that manages the display of debug information.
 */
export class ShowAllDebugOption extends SystemOption {
    constructor(
        private registeredContainers: ReadonlyObjectCollection<Container>,
        private debugUtil: DebugTextHandler
    ) {
        super(
            "Show All Debug Info",
            "Shows debug information for all objects in the scene."
            ,
        );

        this.state.subscribe((enabled) => {
            if (enabled) {
                this.showAllDebug();
            } else {
                this.hideAllDebug();
            }
        });
    }

    private showAllDebug(): void {
        for (const obj of this.registeredContainers) {
            this.debugUtil.showDebug(obj);
        }
    }

    private hideAllDebug(): void {
        for (const obj of this.registeredContainers) {
            this.debugUtil.hideDebug(obj);
        }
    }

    public override onSystemEnable(): void {
        this.executeIfEnabled(() => {
            this.showAllDebug();
        });
    }

    public override onSystemDisable(): void {
        this.hideAllDebug();
    }

    public override onObjectRegister(obj: Container): void {
        this.executeIfEnabled(() => {
            this.debugUtil.showDebug(obj);
        });
    }

    public override onObjectUnregister(obj: Container): void {
        this.debugUtil.hideDebug(obj);
    }

    public override destroy(): void {
        this.onSystemDisable();
    }
}
