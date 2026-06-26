import { Spinner } from "@/components/ui/spinner";
import type { RuntimeBootstrapStatus } from "./RuntimeCanvas";
import { AlertTriangleIcon } from "lucide-react";

export default function RuntimeStartupOverlay({
    status,
    error,
}: {
    status: RuntimeBootstrapStatus;
    error: string | null;
}) {
    if (status === "running" || status === "idle") return null;

    const isError = status === "error";

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/90">
            <div className="w-[min(92vw,28rem)] rounded-3xl border bg-card px-8 py-10 text-center shadow-2xl">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {isError
                        ? <span className="text-2xl">
                            <AlertTriangleIcon className="h-8 w-8" />
                        </span>
                        : <Spinner className="size-7" />}
                </div>

                <h2 className="mt-6 text-xl font-semibold">
                    {isError ? "Runtime failed to start" : "Starting runtime"}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    {isError
                        ? (error ?? "The editor cannot mount until the runtime is running.")
                        : "Preparing the visualiser before the editor mounts."}
                </p>

                {isError && (
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Reload application
                    </button>
                )}
            </div>
        </div>
    );
}