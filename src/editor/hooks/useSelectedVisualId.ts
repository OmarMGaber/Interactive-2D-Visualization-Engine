import { useEffect, useState } from "react";
import { RuntimeSession } from "@/RuntimeSession";

export function useSelectedVisualId() {
	const [selectedVisualId, setSelectedVisualId] = useState<number | null>(null);
	const runtime = RuntimeSession.getAPI();

	useEffect(() => {
		return runtime.eventsChannel.on("systems:selectionChanged", ({ visualId }) => {
			setSelectedVisualId(visualId);
		});
	}, []);

	return selectedVisualId;
}
