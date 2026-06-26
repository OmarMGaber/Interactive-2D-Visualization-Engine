export type AlgorithmOption = {
	id: string;
	name: string;
	description: string;
};

export const SORTING_ALGORITHMS: readonly AlgorithmOption[] = [
	{
		id: "bubble-sort",
		name: "Bubble Sort",
		description: "Simple adjacent-swap algorithm, easy to visualize.",
	},
	{
		id: "insertion-sort",
		name: "Insertion Sort",
		description: "Builds a sorted prefix by inserting each element.",
	},
	{
		id: "selection-sort",
		name: "Selection Sort",
		description: "Selects the minimum and places it at the front.",
	},
] as const;