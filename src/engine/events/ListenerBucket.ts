/** Listener storage used by the event emitters. */
export class ListenerBucket<TListener> {
    private readonly listeners = new Set<TListener>();

    /** Returns an unsubscribe function that removes the listener when called. */
    add(listener: TListener): () => void {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * @returns An iterable of the current listeners.
     * @remarks This exposes the live set so emitters can iterate without allocating a copy.
     * The caller should not modify the set while iterating.
     * If the caller needs to modify the set while iterating, they should make a copy first.
     * For example: `for (const listener of [...bucket.values()]) { ... }`
    */
    values(): Iterable<TListener> {
        return this.listeners;
    }

    clear(): void {
        this.listeners.clear();
    }

    get size(): number {
        return this.listeners.size;
    }
}