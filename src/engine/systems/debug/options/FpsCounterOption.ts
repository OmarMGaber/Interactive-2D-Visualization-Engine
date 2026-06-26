import { SystemOption } from "../../SystemOption";
import { DebugHud } from "../DebugHud";

/**
 * A system option that toggles the visibility of an FPS (frames per second) counter in the application.
 * 
 * @description When enabled, this option will display the current FPS in a heads-up display (HUD) on the screen.
 * When disabled, it will hide the FPS counter. This option is useful for monitoring the performance of the application during development and debugging.
 * 
 * @remark This option is designed to work with a `DebugHud` that manages the display of debug information. The FPS counter is updated based on the application's ticker or rendering loop.
 */
export class FpsCounterOption extends SystemOption {
    private hud: DebugHud;
    private readonly unsubscribeState: () => void;
    
    // Store the last FPS value to avoid unnecessary updates when the value hasn't changed
    private lastFps = 0;

    constructor() {
        super(
            "Show FPS Counter",
            "Displays the frames per second counter."
        );

        this.hud = new DebugHud("fps-hud");

        this.unsubscribeState = this.state.subscribe((enabled) => {
            this.hud.setVisible(enabled);
        });

        this.hud.setVisible(this.state.isEnabled());
    }

    public attachHost(host: HTMLElement): void {
        this.hud.attachToElement(host);
    }

    public update(fps: number): void {        
        this.executeIfEnabled(() => {
            const rounded = Math.max(0, Math.round(fps));
            if (rounded === this.lastFps) return;

            this.lastFps = rounded;
            this.hud.setText(`FPS: ${rounded}`);
        });
    }

    public override onSystemEnable(): void {
        this.hud.setVisible(this.state.value);
    }

    public override onSystemDisable(): void {
        this.hud.setVisible(false);
    }

    public override destroy(): void {
        this.unsubscribeState();
        this.hud.remove();
    }
}
