import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { ModalProps } from "./props";

type ComingSoonModalProps = ModalProps & {
	title: string;
	description?: string;
}

/**
 * A modal component that displays a "Coming Soon" message for features that are under development.
 */
export default function ComingSoonModal({
	isOpen,
	onClose,
	title,
	description = "This feature is currently under development and will be available soon.",
}: ComingSoonModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="bg-background/80 border border-border shadow-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-foreground">
						<Sparkles size={18} className="text-primary" />
						{title}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<div className="rounded-lg border border-dashed border-muted p-6 text-center">
						<p className="text-lg font-semibold text-muted-foreground mb-2">
							Coming Soon
						</p>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>

					<Button onClick={onClose} className="w-full">
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
