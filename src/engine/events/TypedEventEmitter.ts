import { BaseEventEmitter } from "./BaseEventEmitter";

export interface EventListener<T> {
    on<K extends keyof T>(
        event: K,
        listener: (payload: T[K]) => void
    ): () => void;
}

export interface EventDispatcher<T> {
    emit<K extends keyof T>(
        event: K,
        ...payload: T[K] extends void ? [] : [T[K]]
    ): void;
}

/**
 * Strongly typed event emitter with void-safe payload support.
 */
export class TypedEventEmitter<T extends Record<string, any>>
    extends BaseEventEmitter<{
        [K in keyof T]: (payload: T[K]) => void
    }>
    implements EventListener<T>, EventDispatcher<T>
{
    public on<K extends keyof T>(event: K, fn: (payload: T[K]) => void) {
        return super.on(event, fn);
    }

    public emit<K extends keyof T>(
        event: K,
        ...payload: T[K] extends void ? [] : [T[K]]
    ): void {
        super.dispatch(event, payload as any[]);
    }
}