/**
 * ExecutionThrottle is a utility class that ensures a function is not called more frequently than a specified delay.
 * 
 * If the function is called again before the delay has passed, it will schedule the latest call to be executed
 * immediately after the current delay period ends. This is particularly useful for scenarios like
 * window resizing, background color changes, or any other event that can trigger rapid consecutive calls,
 * where you want to limit the frequency of expensive operations.
 */
export class ExecutionThrottle {
    private _timeoutId: ReturnType<typeof setTimeout> | null = null;
    private _pendingFunc: (() => void) | null = null;

    constructor(private _delay: number) {}

    /**
     * Runs the provided function immediately if no other function is currently scheduled to run.
     * If a function is already scheduled, it stores the latest function to be run immediately after the current delay.
     * 
     * @param func - The function to be executed with throttling. 
     */
    run(func: () => void) {
        if (this._timeoutId === null) {
            func();

            this._timeoutId = setTimeout(() => {
                this._timeoutId = null;

                if (this._pendingFunc) {
                    const pending = this._pendingFunc;
                    this._pendingFunc = null;
                    this.run(pending);
                }
            }, this._delay);
        } else {
            this._pendingFunc = func; // store latest call
        }
    }

    /** Cancels any pending function execution and clears the timeout. */
    cancelAll() {
        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);
            this._timeoutId = null;
        }
        this._pendingFunc = null;
    }
}