import { Color } from "@/math/Color";
import { Container, Text } from "pixi.js";

/**
 * Defines the interface for a debug text handler that can display and hide debug information for Pixi.js containers.
 * 
 * @description This interface provides methods for showing and hiding debug information from objects of type `Container`. Implementations of this interface can define how debug information is displayed and managed.
 * @remark This is a mutating interface, meaning that the methods can modify the state of the objects they operate on.
 */
export interface DebugTextHandler {
    /**
     * Displays debug information for the specified Pixi.js container object.
     * 
     * @remarks This is a mutating operation that would add child(ren) to the specified container to represent the debug information. 
     * The implementation may vary based on how debug information is displayed (e.g., using Text, Graphics, etc.).
     * 
     * @param obj - The Pixi.js container object for which the debug information should be displayed.
     * @param labelText - Optional text to display as the debug information. If not provided, a default label will be used.
     */
    showDebug(obj: Container, labelText?: string): void;

    /**
     * Hides the debug information for the specified Pixi.js container object.
     * 
     * @remarks This is a mutating operation that would remove child(ren) or effects from the specified container that represent the debug information.
     * 
     * @param obj - The Pixi.js container object for which the debug information should be hidden.
     */
    hideDebug(obj: Container): void;
}

/**
 * A basic implementation of the `DebugTextHandler` interface that adds and removes debug information from Pixi.js container objects.
 * 
 * @description This implementation uses a `Text` object to display debug information above the specified container. 
 * The debug information is added as a child of the container and can be toggled visible or invisible.
 */
class BasicDebugTextHandler implements DebugTextHandler {
    private static readonly DEBUG_LABEL = "__debug_info__";

    public showDebug(obj: Container, labelText?: string): void {
        let debugContainer = obj.getChildByLabel?.(
            BasicDebugTextHandler.DEBUG_LABEL,
        ) as Container | undefined;

        if (debugContainer) {
            if (debugContainer.visible) return;

            debugContainer.visible = true;
            return;
        }

        const label =
            labelText ??
            (obj as any).label ??
            `object: ${obj.constructor.name}`;

        const debugLabel = new Text({
            text: "[DEBUG]",
            style: {
                fill: Color.Red.toHexString(),
                fontSize: 16,
                fontWeight: "bold",
            },
        });

        debugLabel.position.set(0, -20);

        const debugText = new Text({
            text: `${label}, id: (${(obj as any).uid})`,
            style: {
                fill: Color.Black.toHexString(),
                fontSize: 16,
                fontWeight: "bold",
            },
        });

        debugText.position.set(debugLabel.width + 5, -20);

        debugContainer = new Container();
        debugContainer.label = BasicDebugTextHandler.DEBUG_LABEL;

        debugContainer.addChild(debugLabel);
        debugContainer.addChild(debugText);

        obj.addChild(debugContainer);
    }

    public hideDebug(obj: Container): void {
        const debugContainer = obj.getChildByLabel?.(
            BasicDebugTextHandler.DEBUG_LABEL,
        );

        if (!debugContainer) return;

        debugContainer.visible = false;
    }
}

/** Singleton instance of the BasicDebugTextHandler for use throughout the application. */
export const basicDebugTextHandler: DebugTextHandler = new BasicDebugTextHandler();