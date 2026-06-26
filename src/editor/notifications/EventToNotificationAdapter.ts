import { RuntimeSession } from "@/RuntimeSession";

export type ToastMessage = {
    message: string;
    type: "info" | "error" | "success";
};

type ToastCallback = (notification: ToastMessage) => void;

/**
 * Maps runtime events to toast notifications.
 */
export function subscribeToEventNotifications(onNotification: ToastCallback): () => void {
    const unsubscribes: Array<() => void> = [];
    const runtime = RuntimeSession.getAPI();

    unsubscribes.push(
        runtime.eventsChannel.on("visual:created", ({ visualId, visualType }) => {
            onNotification({
                message: `${visualType} created with visual_id #${visualId}`,
                type: "success",
            });
        })
    );

    unsubscribes.push(
        runtime.eventsChannel.on("visual:destroyed", ({ visualId, visualType }) => {
            onNotification({
                message: `Destroyed visual with visual_id #${visualId} of type ${visualType}`,
                type: "info",
            });
        })
    );

    unsubscribes.push(
        runtime.eventsChannel.on("runtime:paused", () => {
            onNotification({
                message: "Ticker system is paused. Visuals updates are halted.",
                type: "info",
            });
        })
    );

    unsubscribes.push(
        runtime.eventsChannel.on("runtime:resumed", () => {
            onNotification({
                message: "Ticker system resumed. Visuals updates are active.",
                type: "info",
            });
        })
    );

    unsubscribes.push(
        runtime.eventsChannel.on("runtime:error", ({ message }) => {
            onNotification({
                message: `Runtime error: ${message}`,
                type: "error",
            });
        })
    );

    return () => {
        unsubscribes.forEach((fn) => fn());
    };
}
