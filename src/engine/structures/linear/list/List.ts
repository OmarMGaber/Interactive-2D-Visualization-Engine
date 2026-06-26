import type { LinearStructure } from "../LinearStructure";

export interface List<T> extends LinearStructure<T> {
    get(index: number): T;
    set(index: number, value: T): void;
    insert(index: number, value: T): void;
    remove(index: number): T;
    swap(i: number, j: number): void;
}