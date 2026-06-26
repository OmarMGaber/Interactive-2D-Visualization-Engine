import ArrayControlsPanel from "@/editor/features/array/ArrayControlsPanel";
import { useSelectedVisualId } from "@/editor/hooks/useSelectedVisualId";

export default function StructureControlsHub() {
	const selectedVisualId = useSelectedVisualId();

	if (selectedVisualId === null) {
		return null;
	}

	return <ArrayControlsPanel visualId={selectedVisualId} />;
}
