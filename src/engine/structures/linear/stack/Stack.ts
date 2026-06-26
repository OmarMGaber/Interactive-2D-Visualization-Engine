import type { List } from "../list/List";
import type { IStack } from "./IStack";

export class Stack<T> implements IStack<T> {
    private items: List<T>;

    constructor(items: List<T>) { this.items = items; }

    push(value: T): void {
        this.items.insert(this.items.size(), value);
    }

    pop(): T | undefined {
        return this.items.size() > 0 ? this.items.remove(this.items.size() - 1) : undefined;
    }

    peek(): T | undefined {
        return this.items.size() > 0 ? this.items.get(this.items.size() - 1) : undefined;
    }

    isEmpty(): boolean {
        return this.items.size() === 0;
    }

    size(): number {
        return this.items.size();
    }

    clear(): void {
        while (!this.isEmpty()) this.pop();
    }
}