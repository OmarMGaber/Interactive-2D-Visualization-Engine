import type { Deque } from "../deque/Deque";
import type { List } from "./List";

export class ArrayList<T> implements List<T>, Deque<T> {
    private items: T[] = [];

    get(index: number): T {
        return this.items[index];
    }

    set(index: number, value: T): void {
        this.items[index] = value;
    }

    insert(index: number, value: T): void {
        this.items.splice(index, 0, value);
    }

    remove(index: number): T {
        return this.items.splice(index, 1)[0];
    }

    swap(i: number, j: number): void {
        [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }

    size(): number {
        return this.items.length;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    clear(): void {
        this.items.length = 0;
    }

    pushFront(value: T): void {
        this.items.unshift(value);
    }
   
    pushBack(value: T): void {
        this.items.push(value);
    }
   
    popFront(): T | undefined {
        return this.items.shift();
    }
   
    popBack(): T | undefined {
        return this.items.pop();
    }
   
    peekFront(): T | undefined {
        return this.items[0];
    }

    peekBack(): T | undefined {
        return this.items[this.items.length - 1];
    }
}