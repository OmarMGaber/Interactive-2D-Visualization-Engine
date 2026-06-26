import Settings from "@/editor/features/settings/Settings";
import StructureControlsHub from "@/editor/features/structures/StructureControlsHub";

export default function EditorShell() {
	return (
		<>
			<div className="editor-toolbar">
				<Settings />
			</div>

			<StructureControlsHub />
		</>
	);
}
