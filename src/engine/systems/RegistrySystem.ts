import type { Container } from "pixi.js";
import { System } from "./System";
import type { VisualObject } from "../visuals/VisualObject";

/**
 * Abstract base class that extends {@link System} that manages a collection of objects of type `T` (which extends {@link Container} e.g., {@link VisualObject}).
 * 
 * This class provides methods to register and unregister objects, as well as hooks for custom behavior during these operations.
 * It also integrates with the `OptionManager` to manage options related to the registered objects.
 */
export abstract class RegistrySystem<T extends Container> extends System {
    protected objects: Set<T> = new Set();

    /** The callback function to be invoked when an object is registered with the system. */
    private _onRegisterHook?: (obj: T) => void;
    private _onUnregisterHook?: (obj: T) => void;

    /** 
     * Sets the callback function to be invoked when an object is registered with the system.
     * @param callback - The callback function to set.
     */
    public set onRegisterHook(callback: (obj: T) => void) {
        if (this._onRegisterHook) {
            console.warn(`Overriding existing onRegisterHook in system with id ${this.id}`);
        }

        this._onRegisterHook = callback;
    }

    /**
     * Sets the callback function to be invoked when an object is unregistered from the system.
     * @param callback - The callback function to set.
     */
    public set onUnregisterHook(callback: (obj: T) => void) {
        if (this._onUnregisterHook) {
            console.warn(`Overriding existing onUnregisterHook in system with id ${this.id}`);
        }

        this._onUnregisterHook = callback;
    }

    /**
     * Template method for registering an object. 
     * - Checks if the object is already registered to prevent duplicates.
     * - Calls the option manager's onObjectRegister to update any relevant options.
     * - Executes the onRegisterHook for any additional custom behavior defined by subclasses or instances.
     * 
     * @param obj The object to register with the system. Must extend Container. 
     */
    public registerObject(obj: T): void {
        if (this.objects.has(obj)) return;

        this._optionManager.onObjectRegister(obj);
        this._onRegisterHook?.(obj);
        
        this.objects.add(obj);
    }

    /**
     * Template method for unregistering an object.
     * - Checks if the object is currently registered before attempting to unregister.
     * - Calls the option manager's onObjectUnregister to update any relevant options.
     * - Executes the onUnregisterHook for any additional custom behavior defined by subclasses or instances.
     * 
     * @param obj  
     */
    public unregisterObject(obj: T): void {
        if (!this.objects.has(obj)) return;

        this._optionManager.onObjectUnregister(obj);
        this._onUnregisterHook?.(obj);

        this.objects.delete(obj);
    }

    /**
     * Returns an array of unique identifiers (UIDs) for all registered visual objects in the system.
     * - The UIDs are sorted in ascending order.
     * 
     * @returns An array of numbers representing the UIDs of registered visual objects.
     */
    public getRegisteredVisualIds(): number[] {
        return Array.from(this.objects)
            .map((obj) => obj.uid)
            .sort((a, b) => a - b);
    }
}