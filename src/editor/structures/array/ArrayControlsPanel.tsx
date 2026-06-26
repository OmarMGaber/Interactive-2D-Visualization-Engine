import { useCallback, useEffect, useState } from "react";
import { RuntimeSession } from "@/RuntimeSession";
import AlgorithmsListCard from "@/editor/structures/shared/components/AlgorithmsList";
import PlayerControlsCard from "../shared/components/PlayerControlsCard";
import StructureControlsCard from "@/editor/structures/shared/components/StructureControlsCard";
import SystemRegistryCard from "@/editor/structures/shared/components/SystemRegistry";
import { SORTING_ALGORITHMS } from "@/engine/algorithms";

type ArrayControlsPanelProps = {
	visualId: number | null;
};

export default function ArrayControlsPanel({
	visualId,
}: ArrayControlsPanelProps) {
	if (visualId === null) {
		return null;
	}

	const [isPlaying, setIsPlaying] = useState(true);
	const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string>(
		SORTING_ALGORITHMS[0].id,
	);

	const runtime = RuntimeSession.getAPI();

	useEffect(() => {
		const offPaused = runtime.eventsChannel.on("player:paused", () => {
			setIsPlaying(false);
		});

		const offResumed = runtime.eventsChannel.on("player:resumed", () => {
			setIsPlaying(true);
		});

		return () => {
			offPaused();
			offResumed();
		};
	}, []);

	const handleTogglePlay = useCallback(() => {
		if (isPlaying) {
			runtime.commandsChannel.emit("player:pause", {
				visualId: visualId,
			});
			return;
		}

		runtime.commandsChannel.emit("player:resume", { visualId: visualId });
	}, [isPlaying]);

	const handleStepBackward = useCallback(() => {
		if (visualId === null) return;
		runtime.commandsChannel.emit("player:step", {
			visualId,
			backwards: true,
		});
	}, [visualId]);

	const handleStepForward = useCallback(() => {
		if (visualId === null) return;
		runtime.commandsChannel.emit("player:step", {
			visualId,
			backwards: false,
		});
	}, [visualId]);

	const handleDestroy = useCallback(() => {
		if (visualId === null) {
			return;
		}

		runtime.commandsChannel.emit("visuals:destroy", { visualId });
	}, [visualId]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Delete") {
				return;
			}

			handleDestroy();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleDestroy]);

	return (
		<div className="pointer-events-auto fixed left-4 bottom-4 z-[1000] w-70 space-y-3">
			<StructureControlsCard
				title="Array Controls"
				description={`Selected visual #${visualId}`}
				actionLabel="Destroy"
				actionTitle="Destroy Array (or press Delete key)"
				onAction={handleDestroy}
				actionVariant="destructive"
			/>

			<AlgorithmsListCard
				algorithms={SORTING_ALGORITHMS}
				selectedAlgorithmId={selectedAlgorithmId}
				onSelectAlgorithm={setSelectedAlgorithmId}
			/>

			<SystemRegistryCard visualId={visualId} />

			<PlayerControlsCard
				title="Array Algorithm Playback"
				isPlaying={isPlaying}
				onTogglePlay={handleTogglePlay}
				onStepBackward={handleStepBackward}
				onStepForward={handleStepForward}
			/>
		</div>
	);
}
