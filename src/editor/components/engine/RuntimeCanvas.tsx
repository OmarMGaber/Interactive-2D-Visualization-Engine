import { useEffect, useRef } from "react";
import { RuntimeSession } from "@/RuntimeSession";

export type RuntimeBootstrapStatus = "idle" | "starting" | "running" | "error";
export type RuntimeStatusCallback = (
	status: RuntimeBootstrapStatus,
	error?: Error,
) => void;

type RuntimeCanvasProps = {
	onRuntimeStatusChange?: RuntimeStatusCallback;
};

export default function VisualizerCanvas({
	onRuntimeStatusChange,
}: RuntimeCanvasProps) {
	const canvasRef = useRef<HTMLDivElement>(null);

	// We use a ref callback to track the latest onRuntimeStatusChange without re-running the effect.
	const statusCallbackRef = useRef(onRuntimeStatusChange);
	statusCallbackRef.current = onRuntimeStatusChange;

	useEffect(() => {
		if (!canvasRef.current) {
			console.error("[VisualizerCanvas] Canvas ref not set.");
			return;
		}

		console.assert(
			!RuntimeSession.isSessionActive,
			"[VisualizerCanvas] Runtime session already active on mount. This may indicate multiple RuntimeCanvas instances or a session that wasn't properly cleaned up.",
		);

		const notify: RuntimeStatusCallback = (status, error) => {
			if (statusCallbackRef.current) {
				statusCallbackRef.current(status, error);
			}
		};

		const controller = new AbortController();

		let destroy: (() => void) | undefined;

		notify("starting");

		RuntimeSession.start(canvasRef.current!)
			.then((destroyFn) => {
				if (controller.signal.aborted) {
					// Component unmounted while starting up.
					destroyFn(); // unmounted before start resolved
				} else {
					destroy = destroyFn;
					notify("running");
				}
			})
			.catch((err) => {
				if (!controller.signal.aborted) {
					console.error(
						"[VisualizerCanvas] Runtime failed to start:",
						err,
					);
					notify(
						"error",
						err instanceof Error ? err : new Error(String(err)),
					);
				}
			});

		return () => {
			controller.abort();
			destroy?.();
			notify("idle");
		};
	}, []);

	return <div ref={canvasRef} className="w-full h-full" />;
}
