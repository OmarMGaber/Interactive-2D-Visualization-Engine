import { useEffect, useRef, useState } from "react";
import { ExecutionThrottle } from "@/engine/common/ExecutionThrottle";
import { RuntimeSession } from "@/RuntimeSession";
import { Pipette } from "lucide-react";

const SELECTABLE_COLORS_HEXES = [
	"#303031",
	"#0f172a",
	"#111827",
	"#1f2937",
	"#ffffff",
	"#f8fafc",
	"#84cc16",
	"#65a30d",
	"#f5f5dc",
];

let changes = 0;

export default function BackgroundColorSetting() {
	const throttler = useRef(new ExecutionThrottle(20));
	const runtimeAPI = RuntimeSession.getAPI();

	const [bgColor, setBgColor] = useState<string>(
		RuntimeSession.getSettings().backgroundColor,
	);

	useEffect(() => {
		runtimeAPI.eventsChannel.on(
			"settings:backgroundColorChanged",
			({ color }) => {
				++changes;
				console.log(
					"Background color changed to:",
					color,
					`(change #${changes})`,
				);
				setBgColor(color);
			},
		);
	}, [runtimeAPI.eventsChannel]);

	const handleChange = (color: string) => {
		throttler.current.run(() => {
			runtimeAPI.commandsChannel.emit("settings:setBackgroundColor", {
				color,
			});
		});
	};

	return (
		<div className="space-y-3 rounded-lg border p-3">
			<div className="flex items-center gap-2">
				<Pipette className="h-4 w-4" />
				<p className="text-sm font-medium text-muted-foreground">
					Background Color
				</p>
			</div>

			<input
				type="color"
				value={bgColor}
				onChange={(e) => handleChange(e.target.value)}
				className="h-10 w-full hover:cursor-pointer rounded border-0 p-0"
				title="Choose background color"
				aria-label="Choose background color"
			/>

			<div className="flex gap-2 flex-wrap">
				{SELECTABLE_COLORS_HEXES.map((color) => (
					<button
						key={color}
						onClick={() =>
							runtimeAPI.commandsChannel.emit(
								"settings:setBackgroundColor",
								{ color },
							)
						}
						className="h-7 w-7 rounded border hover:ring-2 hover:ring-ring/50 transition-all"
						style={{ backgroundColor: color }}
						title={color}
					/>
				))}
			</div>
		</div>
	);
}
