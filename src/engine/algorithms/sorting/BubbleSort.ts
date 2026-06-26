import type { VisualArray } from "../../visuals/structures/VisualArray";
import type { SortingAlgorithm } from "./SortingAlgorithm";

export const BubbleSort: SortingAlgorithm = {
    name: "Bubble Sort",

    async run<ItemType>(arr: VisualArray<ItemType>, compare: (a: ItemType, b: ItemType) => number): Promise<void> {
        return new Promise<void>(resolve => {
            const n = arr.size();
            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - i - 1; j++) {
                    if (arr.compare(j, j + 1, compare) > 0) {
                        arr.swap(j, j + 1);
                    }
                }
            }
            resolve();
        });
    }
};