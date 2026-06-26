import { Notifier } from "../events/Notifier";

/**
 * A simple reactive signal class that holds a value and allows subscribers to be notified when the value changes.
 */
export class Signal<Type> {
    private _value: Type;
    #notifier = new Notifier<Type>();

    constructor(initial: Type) { this._value = initial; }

    get value(): Type {
        return this._value;
    }

    set value(next: Type) {
        // if the value is the same as the current value, do not notify
        if (Object.is(this._value, next)) return;

        this._value = next;
        this.#notifier.notify(this._value);
    }

    subscribe(fn: (v: Type) => void): () => void {
        return this.#notifier.subscribe(fn);
    }
}