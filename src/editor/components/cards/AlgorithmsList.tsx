import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { type AlgorithmOption } from "@/engine/algorithms";

type AlgorithmsListProps = {
	algorithms: readonly AlgorithmOption[];
	selectedAlgorithmId: string;
	onSelectAlgorithm: (algorithmId: string) => void;
	onRunAlgorithm?: (algorithmId: string) => void;
};

function AlgorithmsListComponent({
	algorithms,
	selectedAlgorithmId,
	onSelectAlgorithm,
}: AlgorithmsListProps) {
	const selected =
		algorithms.find((algorithm) => algorithm.id === selectedAlgorithmId) ??
		algorithms[0];

	return (
		<Card className="editor-panel">
			<CardContent className="space-y-3">
				<div>
					<Label>Sorting Algorithms</Label>
					<p className="editor-muted">
						Choose an algorithm, then run playback from the controls below.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{algorithms.map((algorithm) => {
						const isActive = selectedAlgorithmId === algorithm.id;

						return (
							<Button
								key={algorithm.id}
								type="button"
								variant={isActive ? "default" : "outline"}
								onClick={() => onSelectAlgorithm(algorithm.id)}
								className="h-9 px-3 text-xs sm:text-sm"
							>
								{algorithm.name}
							</Button>
						);
					})}
				</div>

				{selected ? <p className="editor-muted">{selected.description}</p> : null}
			</CardContent>
		</Card>
	);
}

const AlgorithmsListCard = memo(AlgorithmsListComponent);
export default AlgorithmsListCard;
