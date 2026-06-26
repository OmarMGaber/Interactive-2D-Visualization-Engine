import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import BackgroundColorSetting from "./components/BackgroundColorSetting";
import ThemeSetting from "./components/ThemeSetting";
import NotificationToggle from "./components/NotificationToggle";
import SystemsSettings from "./components/ToggleSettingsList";
import ProjectInfoSectionDropMenu from "./components/ProjectInfo";
import { RuntimeSession } from "@/RuntimeSession";

function createHiddenScrollbarStyle() {
	return {
		scrollbarWidth: "none",
		"-ms-overflow-style": "none",
	} as React.CSSProperties;
}

export default function SettingsModal({ isOpen, onClose }: any) {
	const handleReset = () => {
		RuntimeSession.getAPI().commandsChannel.emit("settings:reset");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] overflow-hidden">
				<DialogHeader className="w-fit sticky z-10 bg-background/80 backdrop-blur-md">
					<DialogTitle>Settings</DialogTitle>
				</DialogHeader>

				<div className="max-h-[calc(90vh)] overflow-y-auto px-1 gap-4 flex flex-col"
				 	style={createHiddenScrollbarStyle()}
				>
					<BackgroundColorSetting />

					<div>
						<span className="block text-sm font-semibold text-foreground/80 mb-2">UI Settings</span>
						<div className="flex flex-col gap-4">
							<ThemeSetting />				
							<NotificationToggle />
						</div>
					</div>
					
					<div className="mt-2">
						<span className="block text-sm font-semibold text-foreground/80 mb-2">Engine Settings</span>
						<div className="mx-auto w-19/20 max-w-md">
							<SystemsSettings />
						</div>
					</div>

					<div className="flex w-full gap-2 mt-4">
						<Button className="flex-1" variant="outline" onClick={handleReset}>
							Reset
						</Button>
						<Button className="flex-1 hover:opacity-80" onClick={onClose}>
							Done
						</Button>
					</div>

					<ProjectInfoSectionDropMenu />
				</div>
			</DialogContent>
		</Dialog>
	);
}
