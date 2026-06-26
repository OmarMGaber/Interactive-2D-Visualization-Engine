import { BaseEventEmitter } from "./BaseEventEmitter";

/**
 * Simple untyped event bus (string-based events).
 */
export class EventEmitter extends BaseEventEmitter<
    Record<string, (payload: unknown) => void>
> {
    public static readonly Shared = new EventEmitter();

    public on<TPayload>(
        type: string,
        fn: (payload: TPayload) => void
    ): () => void {
        return super.on(type, fn as (payload: unknown) => void);
    }

    public emit(type: string, payload?: unknown): void {
        const args = payload === undefined ? [] : [payload];
        this.dispatch(type, args);
    }
}