import { Signal } from "./Signal";

/**
 * A simple wrapper around a boolean value that allows subscribing to changes and provides utility methods for toggling the state.
 * Used for managing enabled/disabled states of systems and options.
 */
export class ToggleState extends Signal<boolean> {
    constructor(
        initial: boolean = false,
    ) {
        super(initial);
    }
    
    public isEnabled(): boolean {
        return this.value;
    }

    public enable(): void {
        if (this.value) return;

        this.value = true;
    }

    public disable(): void {
        if (!this.value) return;

        this.value = false;
    }

    public toggle(): void {
        this.value ? this.disable() : this.enable();
    }
}