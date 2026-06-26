import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/useModalStore";

export default function SettingsButton() {
	const openModal = useModalStore((s) => s.openModal);

	return (
		<Button
			variant="outline"
			className="pointer-events-auto h-11 w-11 rounded-full border shadow-lg backdrop-blur-md transition-transform hover:scale-105"
			onClick={() => openModal("SETTINGS")}
			aria-label="Settings"
			title="Settings"
		>
			<Settings className="size-5" strokeWidth={2.1} />
		</Button>
	);
}
