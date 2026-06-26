import { useEffect, useState } from "react";
import { Info, XCircle, CheckCircle, X } from "lucide-react";
import { subscribeToEventNotifications } from "@/editor/notifications/EventToNotificationAdapter";
import { useUiSettingsStore } from "@/store/useUiSettingsStore";
import { UI_LAYERS } from "@/editor/constants/uiLayers";

type ToastType = "info" | "error" | "success";

interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

const typeColors: Record<ToastType, string> = {
	info: "border-primary-500 bg-primary dark:text-black",
	error: "border-red-500 bg-red-800/90",
	success: "border-green-500 bg-green-800/90",
};

const typeIcons: Record<ToastType, React.ReactNode> = {
	info: <Info className="w-4 h-4" />,
	error: <XCircle className="w-4 h-4" />,
	success: <CheckCircle className="w-4 h-4" />,
};

export default function ToastLog() {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const enableToasts = useUiSettingsStore(
		(s) => s.enableToast,
	);

	const removeToast = (id: number) => {
		setToasts((prev) => prev.filter((n) => n.id !== id));
	};

	useEffect(() => {
		if (!enableToasts) {
			setToasts([]);
			return;
		}

		const unsubscribe = subscribeToEventNotifications(
			({ message, type }) => {
				const id = Date.now();
				setToasts((prev) => [...prev, { id, message, type }]);

				setTimeout(() => {
					removeToast(id);
				}, 5000);
			},
		);

		return unsubscribe;
	}, [enableToasts]);

	if (!enableToasts || toasts.length === 0) return null;

	return (
		<div
			className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
			style={{ zIndex: UI_LAYERS.TOASTS }}
		>
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={`pointer-events-auto text-white rounded-md px-4 py-2 flex items-center gap-3 ${
						typeColors[toast.type]
					}`}
				>
					<span className="shrink-0 flex-none">
						{typeIcons[toast.type]}
					</span>
					<span className="flex-1 leading-snug">
						{toast.message}
					</span>
					<button
						onClick={() => removeToast(toast.id)}
						className="shrink-0 flex-none text-white/60 hover:text-white transition-colors p-1"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			))}
		</div>
	);
}
