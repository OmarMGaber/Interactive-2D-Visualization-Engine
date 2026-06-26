import type { VisualArray } from "../../visuals/structures/VisualArray";
import type { SortingAlgorithm } from "./SortingAlgorithm";

export const InsertionSort: SortingAlgorithm = {
    name: "Insertion Sort",

    async run<ItemType>(arr: VisualArray<ItemType>, compare: (a: ItemType, b: ItemType) => number): Promise<void>   {
        return new Promise<void>(resolve => {
            const n = arr.size();
            for (let i = 1; i < n; i++) {
                let j = i;
                while (j > 0 && arr.compare(j - 1, j, compare) > 0) {
                    arr.swap(j - 1, j);
                    j--;
                }
            }
            resolve();
        });
    }
};