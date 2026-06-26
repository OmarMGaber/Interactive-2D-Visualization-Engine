/**
 * Creates a debounced version of a function.
 *
 * The function will only execute after no calls have been made
 * for the specified delay period.
 */
export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
) {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const debounced = (...args: Parameters<T>): void => {
        // Reset the timer whenever a new call arrives.
        if (timer !== null) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, delay);
    };

    /**
     * Cancels any pending execution.
     */
    debounced.cancel = (): void => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    };

    return debounced;
}