import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/useModalStore";

export default function SettingsButton() {
	const openModal = useModalStore((s) => s.openModal);

	return (
		<div className="absolute top-4 right-4">
			<Button
				variant="outline"
				className="
					group h-12 w-12 rounded-full
					border border-border
				    backdrop-blur-md
					shadow-lg shadow-black/10
					transition-all duration-200
					hover:-translate-y-0.5 hover:scale-105
					hover:bg-background/80 hover:shadow-xl
                    focus-visible:ring-4 focus-visible:ring-ring/20
                    dark:border-gray-700 dark:bg-background dark:hover:bg-background/90
				"
				onClick={() => openModal("SETTINGS")}
				aria-label="Settings"
				title="Settings"
			>
				<Settings
					strokeWidth={2.1}
					className="size-[22px] transition-transform duration-200 group-hover:rotate-45"
				/>
			</Button>
		</div>
	);
}