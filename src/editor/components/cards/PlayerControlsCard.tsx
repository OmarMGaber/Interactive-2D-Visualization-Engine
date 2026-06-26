import { memo } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type PlayerControlsCardProps = {
	title?: string;
	isPlaying: boolean;
	step: number;
	totalSteps: number;
	description?: string;
	onTogglePlay: () => void;
	onStepBackward: () => void;
	onStepForward: () => void;
	onReset: () => void;
	onRun?: () => void;
	runLabel?: string;
	isRunDisabled?: boolean;
};

function PlayerControlsCardComponent({
	title = "Player Controls",
	isPlaying,
	step,
	totalSteps,
	description,
	onTogglePlay,
	onStepBackward,
	onStepForward,
	onReset,
	onRun,
	runLabel = "Run Algorithm",
	isRunDisabled = false,
}: PlayerControlsCardProps) {
	const progressLabel =
		totalSteps > 0 ? `${step} / ${totalSteps}` : "No steps recorded";

	return (
		<Card className="editor-panel">
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between gap-2">
					<Label>{title}</Label>
					<span className="editor-muted">{isPlaying ? "Running" : "Paused"}</span>
				</div>

				<div className="flex items-center justify-between gap-2">
					<span className="editor-muted">{progressLabel}</span>
					{description ? (
						<span className="editor-muted truncate max-w-[55%] text-right">
							{description}
						</span>
					) : null}
				</div>

				{onRun ? (
					<Button
						type="button"
						className="w-full"
						onClick={onRun}
						disabled={isRunDisabled}
					>
						{runLabel}
					</Button>
				) : null}

				<div className="flex items-center justify-between gap-2">
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={onStepBackward}
						disabled={step <= 0}
						aria-label="Step backward"
					>
						<SkipBack className="h-4 w-4" />
					</Button>

					<Button
						type="button"
						variant="default"
						size="icon"
						onClick={onTogglePlay}
						disabled={totalSteps === 0}
						aria-label={isPlaying ? "Pause" : "Play"}
					>
						{isPlaying ? (
							<Pause className="h-4 w-4" />
						) : (
							<Play className="h-4 w-4" />
						)}
					</Button>

					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={onStepForward}
						disabled={step >= totalSteps}
						aria-label="Step forward"
					>
						<SkipForward className="h-4 w-4" />
					</Button>

					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={onReset}
						disabled={totalSteps === 0 && step === 0}
						aria-label="Reset playback"
					>
						<RotateCcw className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

const PlayerControlsCard = memo(PlayerControlsCardComponent);

export default PlayerControlsCard;
