import { LinkedList, type LinkedListNode } from "./LinkedList";

export class DoublyLinkedList<T> extends LinkedList<T> {
    protected length = 0;
    protected head: Node<T> | null = null;
    protected tail: Node<T> | null = null;

    public insert(index: number, value: T): void {
        const newNode = new Node(value);
        if (index === 0) {
            newNode.next = this.head;
            
            if (this.head)
                this.head.prev = newNode;
            this.head = newNode;
            
            if (!this.tail)
                this.tail = newNode;
        } else if (index === this.length) {
            newNode.prev = this.tail;
            
            if (this.tail)
                this.tail.next = newNode;
            
            this.tail = newNode;
        } else {
            const current = this.getNode(index);
            newNode.prev = current.prev;
            newNode.next = current;
            current.prev!.next = newNode;
            current.prev = newNode;
        }
        this.length++;
    }

    public remove(index: number): T {
        const node = this.getNode(index);
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        if (node === this.head) this.head = node.next;
        if (node === this.tail) this.tail = node.prev;
        this.length--;
        return node.value;
    }

    public clear(): void {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    protected override getNode(index: number): Node<T> {
        if (index < 0 || index >= this.length) throw new Error("Index out of bounds");

        let current: Node<T>;
        if (index < this.length / 2) {
            current = this.head!;
            for (let i = 0; i < index; i++) {
                current = current.next!;
            }
        } else {
            current = this.tail!;
            for (let i = this.length - 1; i > index; i--) {
                current = current.prev!;
            }
        }

        return current;
    }
}

class Node<T> implements LinkedListNode<T> {
    value: T;
    next: Node<T> | null = null;
    prev: Node<T> | null = null;

    constructor(value: T) {
        this.value = value;
    }
}
