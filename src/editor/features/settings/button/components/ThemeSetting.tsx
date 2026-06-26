import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sun, Moon } from "lucide-react";

export default function ThemeSetting() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<div className="space-y-3 rounded-lg border p-3">
			<p className="text-sm font-medium text-muted-foreground">Theme</p>

			<ToggleGroup
				type="single"
				value={resolvedTheme ?? "light"}
				onValueChange={(v) => v && setTheme(v)}
				className="w-full rounded-md"
			>
				<ToggleGroupItem value="light" className="flex-1 hover:bg-muted/80 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
					<Sun className="mr-2 h-4 w-4" />
					Light
				</ToggleGroupItem>
				<ToggleGroupItem value="dark" className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
					<Moon className="mr-2 h-4 w-4" />
					Dark
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}
