import type { Deque } from "../deque/Deque";
import type { List } from "./List";

export interface LinkedListNode<T> {
    value: T;
    next: LinkedListNode<T> | null;
}

export abstract class LinkedList<T> implements List<T>, Deque<T> {
    protected length = 0;
    protected head: LinkedListNode<T> | null = null;

    public abstract insert(index: number, value: T): void;

    public abstract remove(index: number): T;

    public abstract clear(): void;

    public get(index: number): T {
        return this.getNode(index).value;
    }

    public set(index: number, value: T): void {
        this.getNode(index).value = value;
    }

    public swap(i: number, j: number): void {
        const nodeI = this.getNode(i);
        const nodeJ = this.getNode(j);
        [nodeI.value, nodeJ.value] = [nodeJ.value, nodeI.value];
    }

    public size(): number { return this.length; }

    public isEmpty(): boolean {
        return this.length === 0;
    }

    // Deque methods
    public pushFront(value: T): void {
        this.insert(0, value);
    }

    public pushBack(value: T): void {
        this.insert(this.length, value);
    }

    public popFront(): T | undefined {
        return this.isEmpty() ? undefined : this.remove(0);
    }

    public popBack(): T | undefined {
        return this.isEmpty() ? undefined : this.remove(this.length - 1);
    }

    public peekFront(): T | undefined {
        return this.getNode(0)?.value;
    }

    public peekBack(): T | undefined {
        return this.getNode(this.length - 1)?.value;
    }

    protected getNode(index: number): LinkedListNode<T> {
        if (index < 0 || index >= this.length) throw new Error("Index out of bounds");
        let current = this.head!;
        for (let i = 0; i < index; i++) current = current.next!;
        return current;
    }
}