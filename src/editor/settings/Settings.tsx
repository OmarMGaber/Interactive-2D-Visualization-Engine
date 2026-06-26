import SettingsButton from "./button/SettingsButton";
import TickerSpeed from "./global/TickerSpeed";
import TickerController from "./global/TickerController";

export default function Settings() {
	return (
		<>
			<SettingsButton />
			<div className="fixed right-4 bottom-4 z-[1000] flex flex-col gap-3 w-72 max-h-[80vh] overflow-y-auto">
				<TickerSpeed />
				<TickerController />
			</div>
		</>
	);
}
