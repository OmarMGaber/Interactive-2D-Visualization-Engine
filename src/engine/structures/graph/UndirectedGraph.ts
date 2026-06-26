import { DirectedGraph } from "./DirectedGraph";

export class UndirectedGraph<T> extends DirectedGraph<T> {
    addEdge(u: T, v: T, weight: number = 1): void {
        super.addEdge(u, v, weight);
        super.addEdge(v, u, weight);
    }
    removeEdge(u: T, v: T): void {
        super.removeEdge(u, v);
        super.removeEdge(v, u);
    }
}
