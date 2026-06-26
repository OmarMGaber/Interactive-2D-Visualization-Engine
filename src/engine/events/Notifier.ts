import { ListenerBucket } from "./ListenerBucket";

export type Listener<T> = (value: T) => void;

/** Minimal observable used for local state changes inside the engine. */
export class Notifier<T> {
    private readonly listeners = new ListenerBucket<Listener<T>>();

    subscribe(listener: Listener<T>): () => void {
        return this.listeners.add(listener);
    }

    notify(value: T): void {
        for (const listener of this.listeners.values()) {
            listener(value);
        }
    }

    clear(): void {
        this.listeners.clear();
    }
}
