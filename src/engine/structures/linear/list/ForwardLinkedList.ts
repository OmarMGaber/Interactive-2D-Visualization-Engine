import { LinkedList, type LinkedListNode } from "./LinkedList";

export class ForwardLinkedList<T> extends LinkedList<T> {
    protected head: LinkedListNode<T> | null = null;
    protected length = 0;

    public insert(index: number, value: T): void {
        const newNode = new Node(value);
        if (index === 0) {
            newNode.next = this.head;
            this.head = newNode;
        } else {
            const prev = this.getNode(index - 1);
            newNode.next = prev.next;
            prev.next = newNode;
        }
        this.length++;
    }

    public remove(index: number): T {
        if (index === 0) {
            const value = this.head!.value;
            this.head = this.head!.next;
            this.length--;
            return value;
        } else {
            const prev = this.getNode(index - 1);
            const value = prev.next!.value;
            prev.next = prev.next!.next;
            this.length--;
            return value;
        }
    }

    public clear(): void {
        this.head = null;
        this.length = 0;
    }
}

class Node<T> implements LinkedListNode<T> {
    value: T;
    next: Node<T> | null = null;

    constructor(value: T) {
        this.value = value;
    }
}
