import type { InteractionStateProvider } from "@/engine/managers/InteractionManager";
import type { Container } from "pixi.js";
import { SystemOption } from "../../SystemOption";
import type { DebugTextHandler } from "../DebugTextHandler";
import type ReadonlyObjectCollection from "@/engine/typing/ReadOnlyCollection";

/**
 * A system option that toggles the visibility of debug information for hovered objects in the scene.
 * 
 * @description When enabled, this option will display debug information for the object currently being hovered over by the user.
 * When disabled, it will hide the debug information for the hovered object. This option is designed to work with a `DebugTextHandler` that manages the display of debug information.
 * 
 * @remark This option is dependent on the `InteractionStateProvider` to determine which object is currently being hovered over. It will only show debug information for objects that are registered in the provided `ReadonlyObjectCollection`.
 */
export class DebugInfoOption extends SystemOption {
    private currentHovered: Container | null = null;
    private readonly unsubscribeHover: () => void;
    private readonly unsubscribeState: () => void;

    constructor(
        private registeredContainers: ReadonlyObjectCollection<Container>,
        private interactionMgr: InteractionStateProvider,
        private debugUtil: DebugTextHandler
    ) {
        super(
            "Show Debug Info",
            "Toggles visibility of debug information for hovered objects. When 'Show All Debug Info' is enabled, this option has no effect."
        );

        this.unsubscribeHover = this.interactionMgr.onHover((obj) => {
            this.executeIfEnabled(() => {
                this.applyHoverChange(obj);
            });
        });

        this.unsubscribeState = this.state.subscribe((enabled) => {
            if (!enabled) {
                this.clearCurrentHover();
                return;
            }

            this.applyHoverChange(this.interactionMgr.getHovered());
        });
    }

    public onObjectUnregister(obj: Container): void {
        if (this.currentHovered === obj) {
            this.clearCurrentHover();
        }
    }

    public override onSystemEnable(): void {
        this.executeIfEnabled(() => {
            this.applyHoverChange(this.interactionMgr.getHovered());
        });
    }

    public override onSystemDisable(): void {
        this.clearCurrentHover();
    }

    public destroy(): void {
        this.unsubscribeHover();
        this.unsubscribeState();
        this.clearCurrentHover();
    }

    private applyHoverChange(obj: Container | null): void {
        if (this.currentHovered === obj) return;
        if (obj && !this.registeredContainers.has(obj)) return;

        this.clearCurrentHover();

        this.currentHovered = obj;

        if (this.currentHovered) {
            this.debugUtil.showDebug(this.currentHovered);
        }
    }

    private clearCurrentHover(): void {
        if (this.currentHovered) {
            this.debugUtil.hideDebug(this.currentHovered);
        }

        this.currentHovered = null;
    }
}
