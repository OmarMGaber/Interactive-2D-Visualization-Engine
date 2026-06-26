import React, { useState } from "react";
import { BookOpen, ExternalLink, GitBranch, Info, Tag, ChevronDown } from "lucide-react";

function LinkButton({
	href,
	icon: Icon,
	label,
}: {
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="group inline-flex items-center justify-between rounded-md border bg-background px-3 py-2 hover:bg-accent transition-colors"
		>
			<span className="inline-flex items-center gap-2">
				<Icon className="h-4 w-4 text-muted-foreground" />
				{label}
			</span>
			<ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
		</a>
	);
}

export default function ProjectInfoSectionDropMenu() {
	const [open, setOpen] = useState(false);

	return (
		<div className="rounded-lg border bg-muted/30 p-2">
			<button
				type="button"
				onClick={() => setOpen((s) => !s)}
				aria-expanded={open}
				className="flex w-full items-center justify-between text-sm hover:bg-muted/50 rounded-md px-3 py-2 transition-colors"
			>
				<span className="inline-flex items-center gap-2">
					<Info className="h-4 w-4 text-muted-foreground" />
					<span>Interactive Visualization Engine</span>
				</span>
				<ChevronDown
					className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<div className="flex flex-col gap-2 text-sm mt-3">
					<LinkButton
						href="https://github.com/OmarMGaber/DSA-Visualizer#readme"
						icon={BookOpen}
						label="README"
					/>

					<LinkButton
						href="https://github.com/OmarMGaber/DSA-Visualizer/issues"
						icon={Tag}
						label="Report an Issue"
					/>

					<LinkButton
						href="https://github.com/OmarMGaber/DSA-Visualizer/blob/main/CONTRIBUTING.md"
						icon={BookOpen}
						label="Contributing Guide"
					/>

					<LinkButton
						href="https://github.com/OmarMGaber/DSA-Visualizer/blob/main/LICENSE"
						icon={GitBranch}
						label="License"
					/>

					<LinkButton
						href="https://github.com/OmarMGaber/DSA-Visualizer"
						icon={GitBranch}
						label="GitHub Repository"
					/>

					<div className="mt-2 flex items-center justify-between rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
						<span className="inline-flex items-center gap-2">
							<Tag className="h-4 w-4 text-muted-foreground" />
							Version
						</span>
						<span>1.0.0</span>
					</div>

					<div className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
						Built with TypeScript, PixiJS, GSAP, React and Tailwind CSS.
						All simulation, rendering, and processing happens locally on your device.
					</div>
				</div>
			)}
		</div>
	);
}
