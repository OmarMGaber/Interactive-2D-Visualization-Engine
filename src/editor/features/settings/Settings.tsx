import SettingsButton from "./button/SettingsButton";
import TickerSpeed from "./global/TickerSpeed";
import TickerController from "./global/TickerController";

export default function Settings() {
	return (
		<>
			<SettingsButton />

			<div className="editor-dock--right pointer-events-auto hidden sm:flex">
				<TickerSpeed />
				<TickerController />
			</div>
		</>
	);
}
