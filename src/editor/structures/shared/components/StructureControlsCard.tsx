import { type ReactNode, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type StructureControlsCardProps = {
	title: string;
	description?: string;
	actionLabel?: string;
	actionTitle?: string;
	onAction?: () => void;
	actionVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
	children?: ReactNode;
};

function StructureControlsCardComponent({
	title,
	description,
	actionLabel,
	actionTitle,
	onAction,
	actionVariant = "destructive",
	children,
}: StructureControlsCardProps) {
	return (
		<Card className="bg-background/85 backdrop-blur border shadow-lg">
			<CardContent>
				<div className="flex items-center justify-between gap-3">
					<div className="">
						<Label>{title}</Label>
						{description ? (
							<p className="text-xs opacity-70">{description}</p>
						) : null}
					</div>

					{actionLabel && onAction ? (
						<Button
							type="button"
							variant={actionVariant}
							size="sm"
							title={actionTitle}
							onClick={onAction}
						>
							{actionLabel}
						</Button>
					) : null}
				</div>

				{children ? <div>{children}</div> : null}
			</CardContent>
		</Card>
	);
}

const StructureControlsCard = memo(StructureControlsCardComponent);

export default StructureControlsCard;