import { VisualArray } from "../visuals/structures/VisualArray";

/**
 * Type-safe registry of all supported visual types.
 * Add new visual types here to make them available for creation.
 */
export type SupportedVisualTypes = {
    array: typeof VisualArray;
};

/**
 * Factory for creating visuals with strict type checking.
 * Enforces that only registered visual types can be instantiated.
 */
export class VisualFactory {
    /**
     * Registry mapping visual type names to their constructors.
     * This is the single source of truth for what visuals are available.
     */
    private static readonly REGISTRY: SupportedVisualTypes = {
        array: VisualArray,
    };

    /**
     * Get all available visual type names.
     */
    static getAvailableTypes(): (keyof SupportedVisualTypes)[] {
        return Object.keys(this.REGISTRY) as (keyof SupportedVisualTypes)[];
    }

    // Add to VisualFactory:
    static getTypeForConstructor(ctor: Function): keyof SupportedVisualTypes | undefined {
        return this.getAvailableTypes().find(
            (type) => this.REGISTRY[type] === ctor
        );
    }

    /**
     * Create a visual by type name with type-safe arguments.
     *
     * @param type - The visual type to create (must be a registered type)
     * @param args - Constructor arguments for the visual
     * @returns The created visual instance
     * @throws If the visual type is not registered
     */
    static create<K extends keyof SupportedVisualTypes>(
        type: K,
        ...args: ConstructorParameters<SupportedVisualTypes[K]>
    ): InstanceType<SupportedVisualTypes[K]> {
        const constructor = this.REGISTRY[type];
        if (!constructor) {
            throw new Error(
                `Unknown visual type: "${String(type)}". Available types: ${this.getAvailableTypes().join(", ")}`
            );
        }

        return new (constructor as any)(...(args as any[])) as InstanceType<SupportedVisualTypes[K]>;
    }

    /**
     * Check if a visual type is registered.
     */
    static isRegistered(type: unknown): type is keyof SupportedVisualTypes {
        return typeof type === "string" && type in this.REGISTRY;
    }
}
