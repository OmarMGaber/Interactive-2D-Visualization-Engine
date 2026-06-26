import type { LinearStructure } from "../LinearStructure";

export interface IQueue<T> extends LinearStructure<T> {
    enqueue(value: T): void;
    dequeue(): T | undefined;
    peek(): T | undefined;
    isEmpty(): boolean;
}