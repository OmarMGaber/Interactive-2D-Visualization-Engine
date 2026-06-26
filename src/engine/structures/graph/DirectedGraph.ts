import type { Graph } from "./Graph";

export class DirectedGraph<T> implements Graph<T> {
    private adj: Map<T, Map<T, number>> = new Map();

    addVertex(v: T): void {
        if (!this.adj.has(v))
            this.adj.set(v, new Map());
    }

    addEdge(u: T, v: T, weight: number = 1): void {
        this.addVertex(u); this.addVertex(v); this.adj.get(u)!.set(v, weight);
    }

    removeVertex(v: T): void {
        this.adj.delete(v);
        for (const [_, edges] of this.adj)
            edges.delete(v);
    }

    removeEdge(u: T, v: T): void {
        this.adj.get(u)?.delete(v);
    }

    hasEdge(u: T, v: T): boolean {
        return this.adj.get(u)?.has(v) ?? false;
    }

    neighbors(v: T): T[] {
        return Array.from(this.adj.get(v)?.keys() ?? []);
    }

    vertices(): T[] {
        return Array.from(this.adj.keys());
    }

    edges(): [T, T, number][] {
        const result: [T, T, number][] = [];
        for (const [u, map] of this.adj.entries())
            for (const [v, w] of map)
                result.push([u, v, w]);
        return result;
    }

    size(): number {
        return this.adj.size;
    }

    isEmpty(): boolean {
        return this.adj.size === 0;
    }

    clear(): void {
        this.adj.clear();
    }
}