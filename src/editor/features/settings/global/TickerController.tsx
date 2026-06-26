import { useState, useEffect } from "react";
import { RuntimeSession } from "@/RuntimeSession";
import ToggleSettingItem from "../button/components/ToggleSettingItem";

export default function TickerController() {
	const [isPaused, setIsPaused] = useState(false);
	const runtime = RuntimeSession.getAPI();

	// Subscribe to pause/resume events
	useEffect(() => {
		const offPaused = runtime.eventsChannel.on("runtime:paused", () => {
			setIsPaused(true);
		});

		const offResumed = runtime.eventsChannel.on("runtime:resumed", () => {
			setIsPaused(false);
		});

		return () => {
			offPaused();
			offResumed();
		};
	}, []);

	const onToggle = (nextPaused: boolean) => {
		runtime.commandsChannel.emit(!nextPaused ? "runtime:pause" : "runtime:resume");
	};

	return (
		<ToggleSettingItem
			label={isPaused ? "Paused" : "Running"}
			description="Global runtime ticker control"
			enabled={!isPaused}
			onToggle={onToggle}
		/>
	);
}
