import { VisualizationRuntime, DEFAULT_SETTINGS, type RuntimeSettings } from "./engine/VisualizationRuntime";
import { RuntimeLifecycle } from "./engine/RuntimeLifecycle";
import type { RuntimeAPI } from "./engine/RuntimeAPI";
import { Logger } from "./lib/logger";

let logger: Logger = Logger.getOrCreateLogger("RuntimeSession");

type Session = {
    readonly runtime: VisualizationRuntime;
    readonly destroy: () => void;
};

function buildSession(rt: VisualizationRuntime): Session {
    const destroy = () => {
        if (rt.lifecycle !== RuntimeLifecycle.Destroyed) {
            rt.destroy();
        }

        if (import.meta.env.DEV) {
            delete (window as any).__runtime;
        }

        // Clear the session reference to allow new sessions to be started and to free resources.
        _session = null;
    };

    return {
        runtime: rt,
        destroy,
    };
}


let _session: Session | null = null;

/**
 * Ends the active session (if any) when the page is unloaded or hot-reloaded.
 * This is a safety measure to ensure resources are cleaned up and to prevent
 * multiple sessions from running simultaneously in development.
 */
function onPageTeardown(): void {
    RuntimeSession.end();
}

if (typeof window !== "undefined") {
    logger.debug("Setting up page unload handlers for RuntimeSession.");

    window.addEventListener("beforeunload", onPageTeardown);
    window.addEventListener("pagehide", onPageTeardown);

    if (import.meta.hot) {
        import.meta.hot.dispose(() => {
            RuntimeSession.end();
            window.removeEventListener("beforeunload", onPageTeardown);
            window.removeEventListener("pagehide", onPageTeardown);
        });
    }
}

/**
 * RuntimeSession provides a simple interface for managing the lifecycle of a VisualizationRuntime instance.
 *
 * Usage:
 *   - Call RuntimeSession.start(container) to initialize a new session. This returns a cleanup function that should be called on unmount.
 *   - Use RuntimeSession.getAPI() to access the runtime API for sending commands and subscribing to events.
 *   - Call RuntimeSession.end() to end the session early if needed.
 *
 * The module ensures that only one session can be active at a time and that resources are cleaned up properly on page unload or hot-reload.
 */
export const RuntimeSession = {
    /**
     * Starts a new runtime session bound to the given container.
     *
     * @returns {() => void} Cleanup function to end the session.
     * @throws {TypeError} If container is not a valid HTMLElement.
     * @throws {Error}     If a session is already active.
     */
    async start(container: HTMLElement): Promise<() => void> {
        logger.info("Starting new runtime session...");

        if (!(container instanceof HTMLElement)) {
            throw new TypeError("[RuntimeSession] Invalid container: must be a valid HTMLElement.");
        }

        if (_session) {
            const state = _session.runtime.lifecycle;
            if (state === RuntimeLifecycle.Starting || state === RuntimeLifecycle.Running) {
                throw new Error(
                    "[RuntimeSession] A session is already active. " +
                    "Call the cleanup returned by RuntimeSession.start() before starting again."
                );
            }
        }

        const rt = new VisualizationRuntime();

        try {
            await rt.start(container);
        } catch (error) {
            logger.error("Failed to start:", error);
            throw error;
        }

        // Component unmounted while awaiting start, clean up immediately and return a no-op cleanup function.
        if (rt.lifecycle === RuntimeLifecycle.Destroyed) {
            return () => { };
        }

        _session = buildSession(rt);

        if (import.meta.env.DEV) {
            (window as any).__runtime = rt;
        }

        logger.info("Runtime session started.");

        return _session.destroy;
    },

    /** Ends the active session. Safe to call multiple times. */
    end(): void {
        logger.info("Ending runtime session...");
        _session?.destroy();
    },

    /**
     * Returns the API for the active session.
     * @throws {Error} If no session is running.
     */
    getAPI(): RuntimeAPI {
        if (!_session) {
            throw new Error("[RuntimeSession] No active session, call RuntimeSession.start() first.");
        }
        return _session.runtime.runttimeAPI;
    },

    /** Current settings, or defaults when no session is active. */
    getSettings(): RuntimeSettings {
        if (_session) {
            return _session.runtime.settings;
        } else {
            return DEFAULT_SETTINGS;
        }
    },

    get isSessionActive(): boolean {
        return _session !== null
    },

    /** Returns the lifecycle state of the active session, or null if no session is active. */
    get lifecycle(): RuntimeLifecycle | null {
        return this.isSessionActive ? _session!.runtime.lifecycle : null;
    },

    get isRuntimeActive(): boolean {
        return this.isSessionActive ? _session!.runtime.lifecycle === RuntimeLifecycle.Running : false;
    },
} as const;