/**
 * Represents a read-only collection of objects of type `T`. This interface provides methods to check for the presence of an object and to iterate over the collection.
 * 
 * @template T - The type of objects contained in the collection.
 */
export default interface ReadonlyObjectCollection<T> {
    has(obj: T): boolean;
    [Symbol.iterator](): Iterator<T>;
}