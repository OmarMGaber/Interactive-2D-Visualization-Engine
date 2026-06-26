import { Rectangle } from "pixi.js";
import type { Application } from "pixi.js";
import { ExecutionThrottle } from "@/engine/common/ExecutionThrottle";
import { Logger } from "@/lib/logger";

/**
 * Manages stage scaling so the canvas fills its container while maintaining a
 * consistent design-space coordinate system.
 *
 * @remarks
 * `designWidth` / `designHeight` define the "virtual" screen size against which
 * all positions and sizes are authored. On every container resize the stage is
 * uniformly scaled so the design space fits inside the real container.
 */
export class ViewportScaler {
    private static readonly RESIZE_THROTTLE_MS = 100;

    private readonly _throttle: ExecutionThrottle;
    private readonly _observer: ResizeObserver;

    private _currentScale: number = 1;

    private readonly logger: Logger = Logger.getOrCreateLogger("VisualizationRuntime").child("ViewportScaler");

    constructor(
        private readonly app: Application,
        private readonly designWidth: number,
        private readonly designHeight: number,
    ) {
        this._throttle = new ExecutionThrottle(ViewportScaler.RESIZE_THROTTLE_MS);

        this._observer = new ResizeObserver(() => {
            this._throttle.run(() => this._update());
        });
    }

    /** Attaches the scaler to a container and performs an immediate update. */
    observe(container: HTMLElement): void {
        this._observer.observe(container);
        this._update();
    }

    /** Detaches the scaler and stops observing. Call from the runtime's `destroy()`. */
    disconnect(): void {
        this._observer.disconnect();
    }

    get currentScale(): number {
        return this._currentScale;
    }

    private _update(): void {
        const { stage, renderer } = this.app;
        const w = renderer.width / renderer.resolution;
        const h = renderer.height / renderer.resolution;

        const scale = Math.min(
            w / this.designWidth,
            h / this.designHeight,
        );

        this._currentScale = scale;
        stage.scale.set(scale);

        // Keep the hit area aligned with the unscaled logical space so pointer
        // events are tested in design-space coordinates, not screen pixels.
        stage.hitArea = new Rectangle(0, 0, w / scale, h / scale);
    
        this.logger.debug("Updated viewport scale", { scale, rendererWidth: w, rendererHeight: h });
    }
}