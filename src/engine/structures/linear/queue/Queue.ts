import type { List } from "../list/List";
import type { IQueue } from "./IQueue";

export class Queue<T> implements IQueue<T> {
    private items: List<T>;

    constructor(items: List<T>) { this.items = items; }

    enqueue(value: T): void {
        this.items.insert(this.items.size(), value);
    }
    
    dequeue(): T | undefined {
        return this.isEmpty() ? undefined : this.items.remove(0);
    }
    
    peek(): T | undefined {
        return this.isEmpty() ? undefined : this.items.get(0);
    }
    
    isEmpty(): boolean {
        return this.items.size() === 0;
    }
    
    size(): number {
        return this.items.size();
    }

    clear(): void {
        while (!this.isEmpty()) this.dequeue();
    }
}