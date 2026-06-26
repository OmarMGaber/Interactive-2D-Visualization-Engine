/**
 * Represents the lifecycle state of the VisualizationRuntime.
 *
 * Transitions:
 *   Idle -> Starting -> Running <--> Paused -> Destroyed
 */
export const enum RuntimeLifecycle {
    /** Initial state before `start()` has been called. */
    Idle = "idle",

    /** `start()` has been called but has not yet resolved. */
    Starting = "starting",

    /** Runtime is fully initialized and the ticker is running. */
    Running = "running",

    /** Ticker and GSAP are paused; resumes to Running on `resume()`. */
    Paused = "paused",

    /** `destroy()` has been called; the instance is no longer usable. */
    Destroyed = "destroyed",
}