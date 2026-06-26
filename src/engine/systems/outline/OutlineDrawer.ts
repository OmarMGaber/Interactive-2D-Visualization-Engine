import { Container, Graphics } from "pixi.js";
import { Color } from "@/math/Color";
import { ColorUtils } from "@/math/ColorUtils";

/**
 * Defines the interface for an outline drawer that can add and remove outlines from Pixi.js containers.
 * 
 * @description This interface provides methods for adding and removing outlines from objects of type `Container`. Implementations of this interface can define how outlines are drawn and managed.
 * @remark This is a mutating interface, meaning that the methods can modify the state of the objects they operate on.
 */
export interface OutlineDrawer {
    /**
     * Adds an outline to the specified Pixi.js container object.
     * 
     * @remarks This is a mutating operation that would add child(ren) to the specified container to represent the outline. 
     * The implementation may vary based on how outlines are drawn (e.g., using Graphics, filters, etc.).
     * 
     * @param obj - The Pixi.js container object to which the outline should be added.
     */
    addOutline(obj: Container): void;

    /**
     * Removes the outline from the specified Pixi.js container object.
     * 
     * @remarks This is a mutating operation that would remove child(ren) or effects from the specified container that represent the outline.
     * 
     * @param obj - The Pixi.js container object from which the outline should be removed. 
     */
    removeOutline(obj: Container): void;
}

/**
 * A basic implementation of the `OutlineDrawer` interface that adds and removes outlines from Pixi.js container objects.
 * 
 * @description This implementation uses a `Graphics` object to draw a simple outline around the specified container. 
 * The outline is added as a child of the container and can be toggled visible or invisible.
 */
class BasicOutlineDrawer implements OutlineDrawer {
    private static readonly OUTLINE_LABEL = "OutlineDrawer_outlineLabel";

    public addOutline(obj: Container): void {
        let outlineChild = obj.getChildByLabel(BasicOutlineDrawer.OUTLINE_LABEL);
        if (outlineChild) {
            if (outlineChild.visible) return;
            outlineChild.visible = true;
            return;
        }

        const width = Math.max(1, obj.width);
        const height = Math.max(1, obj.height);
        const scaleX = obj.worldTransform.a || 1;

        outlineChild = new Graphics()
            .rect(0, 0, width, height)
            .fill({
                color: ColorUtils.lerp(Color.Gray, Color.White, 0.5).toHex(),
                alpha: 0.5,
            })
            .stroke({
                width: (2 / scaleX) * obj.scale._x,
                color: 0xffffff,
            });

        outlineChild.label = BasicOutlineDrawer.OUTLINE_LABEL;

        obj.addChild(outlineChild);
        obj.setChildIndex(outlineChild, 0);
    }

    public removeOutline(obj: Container): void {
        const outline = obj.getChildByLabel(BasicOutlineDrawer.OUTLINE_LABEL);
        if (outline) {
            outline.visible = false;
        }
    }
}

// Export a singleton instance of the BasicOutlineDrawer for use throughout the application.
export const basicOutlineDrawer: OutlineDrawer = new BasicOutlineDrawer();