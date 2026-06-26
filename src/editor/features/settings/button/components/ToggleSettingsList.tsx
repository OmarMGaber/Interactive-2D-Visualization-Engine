import { useSystemsStore } from "@/store/useSystemsStore";
import ToggleSettingItem from "./ToggleSettingItem";
import { useEffect } from "react";
import { RuntimeSession } from "@/RuntimeSession";

export default function SystemsSettings() {
	const systems = useSystemsStore((state) => state.systems);
	const runtimeAPI = RuntimeSession.getAPI();

	useEffect(() => {
		const rtSys = runtimeAPI.getSystemsInfo();
		useSystemsStore.setState({ systems: rtSys });
	}, []);

	return (
		<div className="flex flex-col gap-3">
			<span className="block text-sm font-semibold text-foreground/80">Systems</span>
			{systems.map((system) => (
				<ToggleSettingItem
					key={system.id}
					label={system.name}
					description={`Toggle the ${system.name} system on or off.`}
					enabled={system.enabled}
					onToggle={() => {
						const updatedSystems = systems.map((s) =>
							s.id === system.id ? { ...s, enabled: !s.enabled } : s
						);
						useSystemsStore.setState({ systems: updatedSystems });
						runtimeAPI.commandsChannel.emit("systems:setEnabled", {
							systemId: system.id,
							enabled: !system.enabled
						});
					}}
					children={system.options && system.options.map((option) => ({
						label: option.name,
						description: option.description,
						enabled: option.enabled,
						onToggle: () => {
							const updatedSystems = systems.map((s) => {
								if (s.id === system.id) {
									return {
										...s,
										options: s.options?.map((o) =>
											o.name === option.name ? { ...o, enabled: !o.enabled } : o
										)
									};
								}
								return s;
							});
							useSystemsStore.setState({ systems: updatedSystems });
							runtimeAPI.commandsChannel.emit("systems:setOptionEnabled", {
								systemId: system.id,
								optionId: option.id,
								enabled: !option.enabled
							});
						}
					}))
				}
				/>
			))}
		</div>
	);
}
