import { memo } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type PlayerControlsCardProps = {
	title?: string;
	isPlaying: boolean;
	onTogglePlay: () => void;
	onStepBackward: () => void;
	onStepForward: () => void;
};

function PlayerControlsCardComponent({
	title = "Player Controls",
	isPlaying,
	onTogglePlay,
	onStepBackward,
	onStepForward,
}: PlayerControlsCardProps) {
	const hasStepBackward = typeof onStepBackward === "function";
	const hasStepForward = typeof onStepForward === "function";

	return (
		<Card className="bg-background/85 backdrop-blur border shadow-lg">
			<CardContent>
				<div className="mb-2 flex items-center justify-between">
					<Label>{title}</Label>
					<span className="text-xs opacity-70">
						{isPlaying ? "Running" : "Paused"}
					</span>
				</div>

				<div className="flex items-center justify-between gap-2">
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={onStepBackward}
						disabled={!hasStepBackward}
						aria-label="Step backward"
					>
						<SkipBack className="h-4 w-4" />
					</Button>

					<Button
						type="button"
						variant="default"
						size="icon"
						onClick={onTogglePlay}
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
						disabled={!hasStepForward}
						aria-label="Step forward"
					>
						<SkipForward className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

const PlayerControlsCard = memo(PlayerControlsCardComponent);

export default PlayerControlsCard;
