import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  type AlgorithmOption,
} from "@/engine/algorithms";

type AlgorithmsListProps = {
  algorithms: readonly AlgorithmOption[];
  selectedAlgorithmId: string;
  onSelectAlgorithm: (algorithmId: string) => void;
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
    <Card className="bg-background/85 backdrop-blur border shadow-lg">
      <CardContent className="space-y-3">
        <div>
          <Label>Sorting Algorithms</Label>
          <p className="text-xs opacity-70">Choose how selected array will be processed.</p>
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
                className="h-8 px-3"
              >
                {algorithm.name}
              </Button>
            );
          })}
        </div>

        {selected ? (
          <p className="text-xs opacity-70">{selected.description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

const AlgorithmsListCard = memo(AlgorithmsListComponent);
export default AlgorithmsListCard;
