import { useCallback, useEffect, useState } from "react";
import { RuntimeSession } from "@/RuntimeSession";
import AlgorithmsListCard from "@/editor/components/cards/AlgorithmsList";
import PlayerControlsCard from "@/editor/components/cards/PlayerControlsCard";
import StructureControlsCard from "@/editor/components/cards/StructureControlsCard";
import SystemRegistryCard from "@/editor/components/cards/SystemRegistry";
import { SORTING_ALGORITHMS } from "@/engine/algorithms";

type ArrayControlsPanelProps = {
	visualId: number;
};

export default function ArrayControlsPanel({ visualId }: ArrayControlsPanelProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [selectedAlgorithmId, setSelectedAlgorithmId] = useState<string>(
		SORTING_ALGORITHMS[0].id,
	);
	const [step, setStep] = useState(0);
	const [totalSteps, setTotalSteps] = useState(0);
	const [description, setDescription] = useState<string | undefined>();

	const runtime = RuntimeSession.getAPI();

	useEffect(() => {
		setStep(0);
		setTotalSteps(0);
		setDescription(undefined);
		setIsPlaying(false);
	}, [visualId]);

	useEffect(() => {
		const offPaused = runtime.eventsChannel.on("player:paused", ({ visualId: id }) => {
			if (id !== visualId) return;
			setIsPlaying(false);
		});

		const offResumed = runtime.eventsChannel.on("player:resumed", ({ visualId: id }) => {
			if (id !== visualId) return;
			setIsPlaying(true);
		});

		const offReady = runtime.eventsChannel.on("player:ready", ({ visualId: id, totalSteps: total }) => {
			if (id !== visualId) return;
			setTotalSteps(total);
			setStep(0);
			setDescription(undefined);
		});

		const offProgress = runtime.eventsChannel.on(
			"player:progress",
			({ visualId: id, step: nextStep, total, description: nextDescription }) => {
				if (id !== visualId) return;
				setStep(nextStep);
				setTotalSteps(total);
				setDescription(nextDescription);
			},
		);

		const offFinished = runtime.eventsChannel.on("player:finished", ({ visualId: id }) => {
			if (id !== visualId) return;
			setIsPlaying(false);
		});

		return () => {
			offPaused();
			offResumed();
			offReady();
			offProgress();
			offFinished();
		};
	}, [runtime, visualId]);

	const handleRunAlgorithm = useCallback(() => {
		runtime.commandsChannel.emit("player:run", {
			visualId,
			algorithmId: selectedAlgorithmId,
		});
	}, [runtime, visualId, selectedAlgorithmId]);

	const handleTogglePlay = useCallback(() => {
		if (isPlaying) {
			runtime.commandsChannel.emit("player:pause", { visualId });
			return;
		}

		runtime.commandsChannel.emit("player:resume", { visualId });
	}, [isPlaying, runtime, visualId]);

	const handleStepBackward = useCallback(() => {
		runtime.commandsChannel.emit("player:step", {
			visualId,
			backwards: true,
		});
	}, [runtime, visualId]);

	const handleStepForward = useCallback(() => {
		runtime.commandsChannel.emit("player:step", {
			visualId,
			backwards: false,
		});
	}, [runtime, visualId]);

	const handleReset = useCallback(() => {
		runtime.commandsChannel.emit("player:reset", { visualId });
	}, [runtime, visualId]);

	const handleDestroy = useCallback(() => {
		runtime.commandsChannel.emit("visuals:destroy", { visualId });
	}, [runtime, visualId]);

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
		<div className="editor-dock--left pointer-events-auto">
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

			<PlayerControlsCard
				title="Algorithm Playback"
				isPlaying={isPlaying}
				step={step}
				totalSteps={totalSteps}
				description={description}
				onTogglePlay={handleTogglePlay}
				onStepBackward={handleStepBackward}
				onStepForward={handleStepForward}
				onReset={handleReset}
				onRun={handleRunAlgorithm}
				runLabel="Run Selected Algorithm"
			/>

			<SystemRegistryCard visualId={visualId} />
		</div>
	);
}
