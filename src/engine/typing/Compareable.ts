export interface Compareable<T> {
    compare(a: T, b: T): number;
}