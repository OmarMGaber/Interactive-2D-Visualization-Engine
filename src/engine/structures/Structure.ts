export interface Structure<_> {
    size(): number;
    isEmpty(): boolean;
    clear(): void;

    // forEach(callback: (value: T) => void): void;
}