import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RuntimeSession } from "@/RuntimeSession";
import { useEffect, useState } from "react";

export default function TickerSpeed() {
	const runtimeAPI = RuntimeSession.getAPI();

	const [speed, setSpeed] = useState<number>(
		RuntimeSession.getSettings().tickerSpeed,
	);

	useEffect(() => {
		runtimeAPI.eventsChannel.on(
			"settings:tickerSpeedChanged",
			({ speed }) => {
				setSpeed(speed);
			},
		);
	}, []);

	const handleSpeedChange = (value: number) => {
		runtimeAPI.commandsChannel.emit("settings:setTickerSpeed", {
			speed: value,
		});
	};

	return (
		<Card className="editor-panel">
			<CardContent>
				<div className="mb-2 flex items-start justify-between">
					<div>
						<Label htmlFor="runtime-ticker-speed-slider">
							Simulation Speed
						</Label>
						<p className="editor-muted">Global runtime ticker speed</p>
					</div>
					<span className="text-sm font-medium">
						{speed.toFixed(2)}x
					</span>
				</div>

				<Slider
					id="runtime-ticker-speed-slider"
					min={0.5}
					max={10}
					step={0.5}
					value={[speed]}
					onValueChange={([value]) => handleSpeedChange(value)}
				/>
			</CardContent>
		</Card>
	);
}
