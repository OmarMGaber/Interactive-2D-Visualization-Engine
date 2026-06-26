import ArrayControlsPanel from "./array/ArrayControlsPanel";
import { useSelectedVisualId } from "./shared/hooks/useSelectedVisualId";

export default function StructureControlsHub() {
	const selectedVisualId = useSelectedVisualId();

	if (selectedVisualId === null) {
		return null;
	}

	return <ArrayControlsPanel visualId={selectedVisualId} />;
}
