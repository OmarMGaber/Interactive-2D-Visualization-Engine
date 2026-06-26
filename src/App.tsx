import { useCallback, useState } from "react";
import Engine from "./editor/components/Engine";
import ModalManager from "./editor/modals/ModalManager";
import Settings from "./editor/settings/Settings";
import StructureControlsHub from "./editor/structures/StructureControlsHub";
import ToastLog from "./editor/components/ToastLog";
import type { RuntimeBootstrapStatus } from "./editor/components/RuntimeCanvas";
import RuntimeStartupOverlay from "./editor/components/RuntimeStartupOverlay";

function App() {
	const [runtimeStatus, setRuntimeStatus] = useState<RuntimeBootstrapStatus>("starting");
	const [runtimeError, setRuntimeError] = useState<string | null>(null);

	const handleRuntimeStatusChange = useCallback((status: RuntimeBootstrapStatus, error?: Error) => {
		setRuntimeStatus(status);
		setRuntimeError(error ? error.message : null);
	}, []);

	return (
		<div className="relative w-screen h-screen overflow-hidden bg-background">
			<Engine runtimeReady={runtimeStatus === "running"} onRuntimeStatusChange={handleRuntimeStatusChange} />
			<RuntimeStartupOverlay status={runtimeStatus} error={runtimeError} />

			{runtimeStatus === "running" ? (
				<>
					<ToastLog />

					<div className="z-50 pointer-events-auto">
						<Settings />
						<StructureControlsHub />
						<ModalManager />
					</div>
				</>
			) : null}
		</div>
	);
}

export default App;
