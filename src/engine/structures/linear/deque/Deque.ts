import type { LinearStructure } from "../LinearStructure";

export interface Deque<T> extends LinearStructure<T> {
    pushFront(value: T): void;
    pushBack(value: T): void;

    popFront(): T | undefined;
    popBack(): T | undefined;

    peekFront(): T | undefined;
    peekBack(): T | undefined;
}