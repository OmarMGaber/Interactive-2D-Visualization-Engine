import { useEffect, useCallback, useState } from "react";
import { type LucideIcon } from "lucide-react";
import { useContextMenuPosition } from "@/store/useContextMenuPosition";
import { Card, CardContent } from "@/components/ui/card";
import { useModalStore } from "@/store/useModalStore";
import { UI_LAYERS } from "@/editor/constants/uiLayers";

export type MenuItem = {
	label: string;
	icon: LucideIcon;
	onClick: () => void;
	color?: string;
};

/**
 * Renders a context menu for the engine canvas, allowing users to create new visual objects.
 * The menu appears at the mouse position when the user right-clicks on the canvas.
 * It automatically closes when the user clicks outside of it or opens a modal.
 *
 * @param items An array of menu items to display in the context menu. 
 */
export default function EngineContextMenu({ items }: { items: MenuItem[] }) {
	const isModalOpen = useModalStore((state) => state.isOpen);
	const [menu, setMenu] = useState({
		x: 0,
		y: 0,
		visible: false,
	});

	const { updatePosition } = useContextMenuPosition();

	const handleContextMenu = useCallback(
		(e: MouseEvent) => {
			if (isModalOpen) {
				setMenu((m) => (m.visible ? { ...m, visible: false } : m));
				return;
			}

			e.preventDefault();

			const menuWidth = 220;
			const menuHeight = items.length * 40 + 16;

			const x =
				e.clientX + menuWidth > window.innerWidth
					? e.clientX - menuWidth
					: e.clientX;

			const y =
				e.clientY + menuHeight > window.innerHeight
					? e.clientY - menuHeight
					: e.clientY;

			updatePosition(x, y);

			setMenu({
				x,
				y,
				visible: true,
			});
		},
		[isModalOpen, items.length, updatePosition],
	);

	const closeMenu = useCallback(() => {
		setMenu((m) => ({ ...m, visible: false }));
	}, []);

	useEffect(() => {
		window.addEventListener("contextmenu", handleContextMenu);
		window.addEventListener("click", closeMenu);

		return () => {
			window.removeEventListener("contextmenu", handleContextMenu);
			window.removeEventListener("click", closeMenu);
		};
	}, [handleContextMenu, closeMenu]);

	if (!menu.visible) return null;

	return (
		<Card
			className="fixed bg-background/80 backdrop-blur-md"
			style={{
				top: menu.y,
				left: menu.x,
				zIndex: UI_LAYERS.CONTEXT_MENU,
				width: Math.max(...items.map(item => item.label.length)) * 8 + 56,
			}}
		>
			<CardContent>
				<div className="flex flex-col gap-1">
					{items.map((item, index) => (
						<button
							key={index}
							onClick={() => {
								item.onClick();
								closeMenu();
							}}
							className="
									group flex w-full items-center gap-3
									rounded-md px-2 py-2 text-sm
									text-foreground transition-all duration-150

									hover:bg-muted hover:shadow-sm
									hover:text-foreground

									focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50
									active:scale-[0.99]
								"
						>
							<item.icon
								size={18}
								className={`
									${item.color || "text-muted-foreground"}
									transition-all duration-150
									group-hover:text-foreground
									group-hover:scale-120
								`}
							/>
							<span className="font-medium">{item.label}</span>
						</button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
