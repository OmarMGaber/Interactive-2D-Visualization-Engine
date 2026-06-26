import type { VisualArray } from "../../visuals/structures/VisualArray";
import type { SortingAlgorithm } from "./SortingAlgorithm";

export const SelectionSort: SortingAlgorithm = {
    name: "Selection Sort",

    async run<ItemType>(arr: VisualArray<ItemType>, compare: (a: ItemType, b: ItemType) => number): Promise<void> {
        return new Promise<void>(resolve => {
            const n = arr.size();
            for (let i = 0; i < n - 1; i++) {
                let minIndex = i;
                for (let j = i + 1; j < n; j++) {
                    if (arr.compare(j, minIndex, compare) < 0) {
                        minIndex = j;
                    }
                }
                if (minIndex !== i) {
                    arr.swap(i, minIndex);
                }
            }
            resolve();
        });
    }
};