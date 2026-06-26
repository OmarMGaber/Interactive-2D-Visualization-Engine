import type { SystemInfo } from "@/engine/systems/System";
import { RuntimeSession } from "@/RuntimeSession";
import { memo, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface SystemRegistryProps {
	visualId: number | null;
}

function SystemRegistryComponent({ visualId }: SystemRegistryProps) {
	const [systems, setSystems] = useState<SystemInfo[]>([]);

	useEffect(() => {
		const runtimeAPI = RuntimeSession.getAPI();

		const refreshSystems = () => {
			setSystems(runtimeAPI.getSystemsInfo());
		};

		refreshSystems();

		const offEnabled = runtimeAPI.eventsChannel.on(
			"systems:enabled",
			refreshSystems,
		);
		const offDisabled = runtimeAPI.eventsChannel.on(
			"systems:disabled",
			refreshSystems,
		);
		const offAdded = runtimeAPI.eventsChannel.on(
			"systems:addedVisual",
			refreshSystems,
		);
		const offRemoved = runtimeAPI.eventsChannel.on(
			"systems:removedVisual",
			refreshSystems,
		);

		return () => {
			offEnabled();
			offDisabled();
			offAdded();
			offRemoved();
		};
	}, [visualId]);

	const handleToggle = (systemId: number, checked: boolean) => {
		if (visualId === null) {
			return;
		}

		const runtimeAPI = RuntimeSession.getAPI();
		runtimeAPI.commandsChannel.emit(
			checked ? "systems:addVisual" : "systems:removeVisual",
			{
				visualId,
				systemId,
			},
		);

		setSystems((prev) =>
			prev.map((system) => {
				if (system.id !== systemId) {
					return system;
				}

				const registeredVisualIds = system.registeredVisualIds ?? [];
				const nextRegisteredVisualIds = checked
					? Array.from(
							new Set([...registeredVisualIds, visualId]),
						).sort((a, b) => a - b)
					: registeredVisualIds.filter((id) => id !== visualId);

				return {
					...system,
					registeredVisualIds: nextRegisteredVisualIds,
				};
			}),
		);
	};

	const registrySystems = systems.filter((system) => system.isRegistrySystem);

	return (
		<Card className="editor-panel">
			<CardContent className="space-y-3">
				<div>
					<Label>Systems Registry</Label>
					<p className="editor-muted">
						Register the selected visual with systems that support
						object registries.
					</p>
				</div>

				{registrySystems.length === 0 ? (
					<p className="text-xs opacity-60">
						No registry systems available.
					</p>
				) : (
					<div className="space-y-2">
						{registrySystems.map((system) => {
							const isChecked =
								visualId !== null &&
								(system.registeredVisualIds ?? []).includes(
									visualId,
								);

							return (
								<label
									key={system.id}
									className="flex items-start gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm hover:bg-muted/50"
								>
									<input
										type="checkbox"
										className="h-4 w-4 accent-foreground"
										checked={isChecked}
										disabled={visualId === null}
										onChange={(event) =>
											handleToggle(
												system.id,
												event.target.checked,
											)
										}
										aria-label={`Toggle ${system.name} for visual ${visualId ?? "none"}`}
									/>
									<span className="min-w-0 flex flex-col leading-tight">
										<span className="truncate font-medium">
											{system.name}
										</span>
										{!system.enabled ? (
											<span className="text-xs text-red-500">
												System current state is disabled. 
											</span>
										) : null}
									</span>
								</label>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

const SystemRegistryCard = memo(SystemRegistryComponent);
export default SystemRegistryCard;