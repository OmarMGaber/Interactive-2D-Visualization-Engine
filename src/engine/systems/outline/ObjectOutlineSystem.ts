import { Container } from "pixi.js";
import { System } from "../System";
import type { OutlineDrawer } from "./OutlineDrawer";
import type { RuntimeContext } from "@/engine/RuntimeContext";

/**
 * A system that manages and draws outlines around objects in the scene based on user interaction (hovering and selection).
 * 
 * @description This system listens to the interaction manager's hover and select events to determine which objects should have outlines drawn around them. It uses an `OutlineDrawer` to handle the actual drawing of outlines.
 * 
 * @remark This system is designed to work with Pixi.js containers and assumes that the objects being outlined are instances of `Container`.
 */
export class ObjectOutlineSystem extends System {
    private currentHovered: Container | null = null;
    private currentSelected: Container | null = null;
    static readonly OUTLINE_LABEL = "ObjectOutlineSystem_outlineLabel";

    constructor(runtimeCtx: RuntimeContext, private outlineDrawer: OutlineDrawer) {
        super(runtimeCtx);

        this.runtimeCtx.interactionManagerState.onHover(this.onHoverChange);
        this.runtimeCtx.interactionManagerState.onSelect(this.onSelectChange);

        this.onEnableHook = () => {
            this.onHoverChange(this.runtimeCtx.interactionManagerState.getHovered());
            this.onSelectChange(this.runtimeCtx.interactionManagerState.getSelected());
        };

        this.onDisableHook = () => {
            if (this.currentHovered) {
                this.outlineDrawer.removeOutline(this.currentHovered);
            }
            if (this.currentSelected) {
                this.outlineDrawer.removeOutline(this.currentSelected);
            }
        };
    }

    private onHoverChange = (obj: Container | null): void => {
        if (!this.state.isEnabled()) return;

        if (obj && this.currentSelected === obj) return;

        if (this.currentHovered && this.currentHovered !== this.currentSelected) {
            this.outlineDrawer.removeOutline(this.currentHovered);
        }

        this.currentHovered = obj;

        if (this.currentHovered && this.currentHovered !== this.currentSelected) {
            this.outlineDrawer.addOutline(this.currentHovered);
        }
    }

    private onSelectChange = (obj: Container | null): void => {
        if (!this.state.isEnabled()) return;

        // remove old selected outline
        if (this.currentSelected && this.currentSelected !== obj) {
            this.outlineDrawer.removeOutline(this.currentSelected);
        }

        this.currentSelected = obj;

        if (this.currentHovered && this.currentHovered !== this.currentSelected) {
            this.outlineDrawer.removeOutline(this.currentHovered);
        }

        this.currentHovered = null;

        if (obj) {
            this.outlineDrawer.addOutline(obj);
        }
    }
}