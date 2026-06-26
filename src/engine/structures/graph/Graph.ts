import type { Structure } from "../Structure";

export interface Graph<T> extends Structure<T> {
    addVertex(v: T): void;
    addEdge(u: T, v: T, weight?: number): void;
    removeVertex(v: T): void;
    removeEdge(u: T, v: T): void;
    hasEdge(u: T, v: T): boolean;
    neighbors(v: T): T[];
    vertices(): T[];
    edges(): [T, T, number?][];
}