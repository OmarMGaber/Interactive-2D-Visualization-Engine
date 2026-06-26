import { Logger } from "@/lib/logger";
import { ListenerBucket } from "./ListenerBucket";

/**
 * Core event storage + dispatch system.
 * Keeps runtime simple and avoids TS inference traps.
 */
export abstract class BaseEventEmitter<
    TMap extends Record<PropertyKey, (...args: any[]) => void>
> {
    private readonly listeners = new Map<keyof TMap, ListenerBucket<any>>();
    private readonly logger: Logger;
    
    constructor() {
        this.logger = Logger.getOrCreateLogger(this.constructor.name);
    }

    protected getListeners<K extends keyof TMap>(key: K): ListenerBucket<TMap[K]> {
        let bucket = this.listeners.get(key) as ListenerBucket<TMap[K]> | undefined;

        if (!bucket) {
            bucket = new ListenerBucket<TMap[K]>();
            this.listeners.set(key, bucket as ListenerBucket<any>);
        }

        return bucket;
    }

    public on<K extends keyof TMap>(key: K, fn: TMap[K]): () => void {
        const bucket = this.getListeners(key);
        const unsubscribe = bucket.add(fn as any);

        return () => {
            unsubscribe();

            if (bucket.size === 0 && this.listeners.get(key) === bucket) {
                this.listeners.delete(key);
            }
        };
    }

    protected dispatch<K extends keyof TMap>(key: K, args: any[]): void {
        const bucket = this.listeners.get(key) as ListenerBucket<TMap[K]> | undefined;
        if (!bucket) {
            this.logger.warn(`No listeners found for event: ${key.toString()}`);
            return;
        }

        for (const fn of bucket.values()) {
            (fn as any)(...args);
        }
    }
}