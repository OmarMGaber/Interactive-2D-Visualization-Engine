import { useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Layers, Hash, Type, Sparkles } from "lucide-react";
import { RuntimeSession } from "@/RuntimeSession";
import { useContextMenuPosition } from "@/store/useContextMenuPosition";
import type { ModalProps } from "./props";

export default function CreateArrayModal({ isOpen, onClose }: ModalProps) {
	const [mode, setMode] = useState<"custom" | "random">("random");
	const [type, setType] = useState<"string" | "numbers">("numbers");
	const [size, setSize] = useState(10);
	const [input, setInput] = useState("");
	const [stringLength, setStringLength] = useState(4);

	const { position } = useContextMenuPosition();

	const parseInputToArray = () => {
		if (!input.trim()) return [];

		const tokens = input
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean);

		if (type === "numbers") {
			return tokens.map(Number).filter((n) => Number.isFinite(n));
		}

		return tokens;
	};

	const generateRandomArray = () => {
		return Array.from({ length: size }, () => {
			if (type === "numbers") return Math.floor(Math.random() * 100);
			return Math.random().toString(36).slice(2, 2 + stringLength);
		});
	};

	const customArray = useMemo(() => parseInputToArray(), [input, type]);
	const randomPreview = useMemo(
		() => generateRandomArray(),
		[type, size, stringLength],
	);

	const previewArray = mode === "custom" ? customArray : randomPreview;
	const canGenerate =
		mode === "custom" ? customArray.length > 0 : size > 0;

	const createAndEmitVisualArray = () => {
		const finalArray =
			mode === "custom" ? customArray : randomPreview;
		if (!finalArray.length) return;

		RuntimeSession.getAPI().commandsChannel.emit("create:visual:array", {
			x: position.x,
			y: position.y,
			items: finalArray,
		});

		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent
				className="
					bg-background/80
					border border-border
					shadow-lg
				"
				aria-describedby=""
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-foreground">
						<Layers size={18} className="text-primary" />
						Create Array
					</DialogTitle>
					<p className="text-sm text-muted-foreground">
						Build a custom array or generate one randomly.
					</p>
				</DialogHeader>

				<div className="space-y-5">
					{/* Mode */}
					<section className="space-y-2">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Mode
						</p>

						<div className="grid grid-cols-2 gap-2">
							<Button
								variant={mode === "custom" ? "default" : "outline"}
								onClick={() => setMode("custom")}
								className="w-full"
							>
								Custom
							</Button>
							<Button
								variant={mode === "random" ? "default" : "outline"}
								onClick={() => setMode("random")}
								className="w-full"
							>
								Random
							</Button>
						</div>
					</section>

					{/* Type */}
					<section className="space-y-2">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Data Type
						</p>

						<div className="grid grid-cols-2 gap-2">
							<Button
								variant={type === "numbers" ? "default" : "outline"}
								onClick={() => setType("numbers")}
								className="w-full"
							>
								<Hash className="mr-2 h-4 w-4" />
								Numbers
							</Button>
							<Button
								variant={type === "string" ? "default" : "outline"}
								onClick={() => setType("string")}
								className="w-full"
							>
								<Type className="mr-2 h-4 w-4" />
								Strings
							</Button>
						</div>
					</section>

					{/* Custom Input */}
					{mode === "custom" && (
						<section className="space-y-2">
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								Input
							</p>

							<Textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder={
									type === "numbers"
										? "1, 2, 3, 10, 42"
										: "apple, banana, cherry"
								}
								className="min-h-[100px] bg-background/50"
							/>

							<p className="text-xs text-muted-foreground">
								Separate values with commas.
							</p>
						</section>
					)}

					{/* Random Controls */}
					{mode === "random" && (
						<section className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
							<div>
								<p className="text-sm font-medium">
									Size: {size}
								</p>
								<Slider
									value={[size]}
									onValueChange={(v) => setSize(v[0])}
									min={1}
									max={100}
									step={1}
								/>
							</div>

							{type === "string" && (
								<div>
									<p className="text-sm font-medium">
										String Length: {stringLength}
									</p>
									<Slider
										value={[stringLength]}
										onValueChange={(v) =>
											setStringLength(v[0])
										}
										min={1}
										max={10}
										step={1}
									/>
								</div>
							)}
						</section>
					)}

					{/* Preview */}
					<section className="space-y-2">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Preview
						</p>

						<div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm font-mono">
							{previewArray.length > 0 ? (
								<span>
									[
									{previewArray
										.slice(0, 20)
										.map((v) => JSON.stringify(v))
										.join(", ")}
									{previewArray.length > 20 ? ", ..." : ""}]
								</span>
							) : (
								<span className="text-muted-foreground">
									No values yet.
								</span>
							)}
						</div>
					</section>

					{/* Footer */}
					<div className="flex gap-2 pt-1">
						<Button
							variant="outline"
							onClick={onClose}
							className="flex-1"
						>
							Cancel
						</Button>

						<Button
							onClick={createAndEmitVisualArray}
							className="flex-1"
							disabled={!canGenerate}
						>
							<Sparkles className="mr-2 h-4 w-4" />
							Generate
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}