export interface Arr<ItemType> {
    swap(index1: number, index2: number): void;
    compare(index1: number, index2: number, compare: (a: ItemType, b: ItemType) => number, anim?: boolean): number;
    size(): number;
}

export interface SortingAlgorithm extends Algorithm {
    run<ItemType>(arr: Arr<ItemType>, compare: (a: ItemType, b: ItemType) => number): Promise<void>;
}