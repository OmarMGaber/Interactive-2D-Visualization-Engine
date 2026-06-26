import type { LinearStructure } from "../LinearStructure";

export interface IStack<T> extends LinearStructure<T> {
    push(value: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
}