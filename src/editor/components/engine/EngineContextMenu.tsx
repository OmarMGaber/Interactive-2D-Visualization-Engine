import { useEffect, useCallback, useState, useRef } from "react";
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

type EngineContextMenuProps = {
	items: MenuItem[];
};

export default function EngineContextMenu({ items }: EngineContextMenuProps) {
	const isModalOpen = useModalStore((state) => state.isOpen);
	const [menu, setMenu] = useState({
		x: 0,
		y: 0,
		visible: false,
	});
	const longPressTimer = useRef<number | null>(null);

	const { updatePosition } = useContextMenuPosition();

	const openMenuAt = useCallback(
		(clientX: number, clientY: number) => {
			const menuWidth = 220;
			const menuHeight = items.length * 44 + 16;

			const x =
				clientX + menuWidth > window.innerWidth
					? clientX - menuWidth
					: clientX;

			const y =
				clientY + menuHeight > window.innerHeight
					? clientY - menuHeight
					: clientY;

			updatePosition(x, y);

			setMenu({
				x,
				y,
				visible: true,
			});
		},
		[items.length, updatePosition],
	);

	const handleContextMenu = useCallback(
		(e: MouseEvent) => {
			if (isModalOpen) {
				setMenu((m) => (m.visible ? { ...m, visible: false } : m));
				return;
			}

			e.preventDefault();
			openMenuAt(e.clientX, e.clientY);
		},
		[isModalOpen, openMenuAt],
	);

	const closeMenu = useCallback(() => {
		setMenu((m) => ({ ...m, visible: false }));
	}, []);

	const handleTouchStart = useCallback(
		(e: TouchEvent) => {
			if (isModalOpen || e.touches.length !== 1) {
				return;
			}

			const touch = e.touches[0];
			longPressTimer.current = window.setTimeout(() => {
				openMenuAt(touch.clientX, touch.clientY);
			}, 500);
		},
		[isModalOpen, openMenuAt],
	);

	const clearLongPress = useCallback(() => {
		if (longPressTimer.current !== null) {
			window.clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
	}, []);

	useEffect(() => {
		window.addEventListener("contextmenu", handleContextMenu);
		window.addEventListener("click", closeMenu);
		window.addEventListener("touchstart", handleTouchStart, { passive: true });
		window.addEventListener("touchend", clearLongPress);
		window.addEventListener("touchmove", clearLongPress);

		return () => {
			window.removeEventListener("contextmenu", handleContextMenu);
			window.removeEventListener("click", closeMenu);
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchend", clearLongPress);
			window.removeEventListener("touchmove", clearLongPress);
			clearLongPress();
		};
	}, [handleContextMenu, closeMenu, handleTouchStart, clearLongPress]);

	if (!menu.visible) return null;

	return (
		<Card
			className="editor-context-menu"
			style={{
				top: menu.y,
				left: menu.x,
				zIndex: UI_LAYERS.CONTEXT_MENU,
				width: Math.max(...items.map((item) => item.label.length)) * 8 + 56,
			}}
		>
			<CardContent>
				<div className="flex flex-col gap-1">
					{items.map((item, index) => (
						<button
							key={index}
							type="button"
							onClick={() => {
								item.onClick();
								closeMenu();
							}}
							className="editor-context-item group"
						>
							<item.icon
								size={18}
								className={item.color ?? "text-muted-foreground group-hover:text-foreground"}
							/>
							<span className="font-medium">{item.label}</span>
						</button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
