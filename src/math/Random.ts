/**
 * Random number / selection utility for game engine use.
 *
 * Supports an optional deterministic seed (mulberry32 PRNG) so you can get
 * reproducible sequences for replays, testing, or daily-seeded content.
 * If no seed is set, falls back to Math.random().
 */
export default class Random {
    private static rngFn: (() => number) | null = null;

    /**
     * Seeds the RNG for deterministic output. Call with no seed (or call
     * `unseed()`) to go back to Math.random().
     */
    public static seed(seed: number): void {
        this.rngFn = this.mulberry32(seed >>> 0);
    }

    /** Reverts to using Math.random() (non-deterministic). */
    public static unseed(): void {
        this.rngFn = null;
    }

    /** Random float in [min, max), max is exclusive. */
    public static range(min: number, max: number): number {
        return this.next() * (max - min) + min;
    }

    /** Random integer in [min, max), max is exclusive. */
    public static intRange(min: number, max: number): number {
        return Math.floor(this.range(min, max));
    }

    /** Random integer in [min, max],  max is inclusive. */
    public static intRangeInclusive(min: number, max: number): number {
        return this.intRange(min, max + 1);
    }

    /** Random float in [-1, 1). */
    public static signed(): number {
        return this.range(-1, 1);
    }

    /** Randomly returns 1 or -1. */
    public static sign(): 1 | -1 {
        return this.next() < 0.5 ? 1 : -1;
    }

    /** Random angle in radians, [0, 2pi). */
    public static angle(): number {
        return this.next() * Math.PI * 2;
    }

    /**
     * Returns true with the given probability (between 0 and 1).
     * @param prob The probability of returning true. 0.5 = 50% chance.
     */
    public static probability(prob: number): boolean {
        return this.next() < prob;
    }

    /** Picks a random element from a non-empty array. */
    public static choice<T>(arr: readonly T[]): T {
        if (arr.length === 0) {
            throw new Error("Cannot choose from an empty array");
        }
        const index = this.intRange(0, arr.length);
        return arr[index];
    }

    /**
     * Picks `count` distinct elements from the array (sampling without
     * replacement). Throws if count > arr.length.
     */
    public static choiceMultiple<T>(arr: readonly T[], count: number): T[] {
        if (count > arr.length) {
            throw new Error(
                `Cannot choose ${count} unique items from an array of length ${arr.length}`
            );
        }
        return this.shuffle(arr).slice(0, count);
    }

    /**
     * Picks a random element using relative weights.
     * `weights[i]` is the relative weight for `arr[i]`. Weights need not
     * sum to 1 — they're normalized internally. All weights must be >= 0
     * and at least one must be > 0.
     */
    public static weightedChoice<T>(arr: readonly T[], weights: readonly number[]): T {
        if (arr.length === 0) {
            throw new Error("Cannot choose from an empty array");
        }
        if (arr.length !== weights.length) {
            throw new Error("arr and weights must be the same length");
        }

        const total = weights.reduce((sum, w) => sum + w, 0);
        if (total <= 0) {
            throw new Error("Total weight must be greater than 0");
        }

        let roll = this.next() * total;
        for (let i = 0; i < arr.length; i++) {
            roll -= weights[i];
            if (roll <= 0) {
                return arr[i];
            }
        }

        // Fallback in case of floating-point precision issues
        return arr[arr.length - 1];
    }

    /** Returns a new shuffled copy of the array (does not mutate input). */
    public static shuffle<T>(arr: readonly T[]): T[] {
        const shuffled = arr.slice();
        this.shuffleInPlace(shuffled);
        return shuffled;
    }

    /** Shuffles the array in place using Fisher–Yates. */
    public static shuffleInPlace<T>(arr: T[]): void {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = this.intRange(0, i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    /**
     * Mulberry32 PRNG implementation. Returns a function that generates
     * pseudo-random numbers in [0, 1) based on the given seed.
     * 
     * Implementation credit: {@link https://gist.github.com/tommyettinger/46a874533244883189143505d203312c?permalink_comment_id=4577493#gistcomment-4577493} 
     * 
     * @param seed The seed for the PRNG. Should be a 32-bit unsigned integer.
     * @returns A function that generates pseudo-random numbers in [0, 1).
     */
    private static mulberry32(seed: number): () => number {
        return function () {
            seed = (seed + 0x9e3779b9) | 0;
            let z = seed;
            z ^= z >>> 16;
            z = Math.imul(z, 0x21f0aaad);
            z ^= z >>> 15;
            z = Math.imul(z, 0x735a2d97);
            z ^= z >>> 15;
            return z;
        }
    }

    /** The single source of randomness for the whole class — [0, 1). */
    private static next(): number {
        return this.rngFn ? this.rngFn() : Math.random();
    }
}