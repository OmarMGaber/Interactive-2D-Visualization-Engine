import { Logger } from "@/lib/logger";
import gsap from "gsap";
import { UPDATE_PRIORITY } from "pixi.js";
import type { Application } from "pixi.js";

/**
 * Bridges the GSAP global timeline to the PixiJS ticker so both animation
 * systems share one time source, enabling a single `tickerSpeed` multiplier
 * to affect all animations uniformly.
 */
export class GsapPixiSync {
    /** The total accumulated time in seconds. */
    private _totalSeconds: number = 0;
    private readonly logger: Logger = Logger.getOrCreateLogger("VisualizationRuntime").child("GsapPixiSync");

    constructor(private readonly app: Application) {}


    /** Removes GSAP's own ticker and attaches manual updates to the Pixi ticker. */
    attach(): void {
        gsap.ticker.remove(gsap.updateRoot);
        this.app.ticker.add(this._tick, this, UPDATE_PRIORITY.HIGH);
        
        this.logger.info("GSAP-Pixi synchronization attached.");
    }

    /** Clean up method, Detaches the Pixi ticker callback */
    detach(): void {
        this.app.ticker.remove(this._tick, this);

        this.logger.info("GSAP-Pixi synchronization detached.");
    }

    /** 
     * Bound ticker callback.
     * 
     * @remarks This is named method to avoid per-frame closure allocations.
     */
    private _tick(ticker: { deltaMS: number }): void {
        this._totalSeconds += ticker.deltaMS / 1000;
        gsap.updateRoot(this._totalSeconds);
    }
}