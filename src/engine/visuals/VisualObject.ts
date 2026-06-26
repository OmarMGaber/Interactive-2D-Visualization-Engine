import { Text, Container, Graphics, TextStyle, type DestroyOptions } from 'pixi.js';
import { AnimationController } from '../animations/AnimationController';
import { Color } from '../../math/Color';

/**
 * Abstract base class for all visual objects in the visualization runtime.
 * Provides common functionality for rendering, labeling, and animation management.
 * 
 * @remarks
 * Visual objects are the building blocks of the visualization runtime. They encapsulate
 * graphical representations, labels, and animations, allowing for consistent rendering
 * and interaction across different types of visual elements.
 */
export abstract class VisualObject extends Container {
    /** The animation controller for managing animations. */
    public readonly animations: AnimationController;

    /** The zoom factor for the visual object. */
    public zoomFactor: number = 1;

    /** The graphics object for rendering the visual. */
    protected _graphics: Graphics;
    /** The text object for displaying labels. */
    protected _label: Text;

    /** Indicates whether the visual object needs to be redrawn. */
    protected dirty: boolean = true;
    /** The color of the visual object. */
    protected _color: Color = Color.Black;

    constructor({
        color,
        labelText = '',
    }: {
        color?: Color;
        labelText?: string;
    }) {
        super();
    
        this._graphics = new Graphics();
        this.addChild(this._graphics);

        this._label = new Text({
            text: labelText,
            style: new TextStyle({
                fill: '#ffffff',
            }),
        });

        this.addChild(this._label);

        this.animations = new AnimationController(this);
        this._color = color ?? this._color;

        this.markDirty();
    }

    /** Marks the visual object as dirty, indicating it needs to be redrawn. */
    public markDirty() {
        this.dirty = true;
    }

    /** Updates the visual object, redrawing it if necessary. */
    public update() {
        if (this.dirty) {
            this.draw();

            this.setChildIndex(this._label, this.children.length - 1);

            this.dirty = false;
        }
    }

    /**
     * Abstract method that must be implemented by subclasses to define how the visual object is drawn.
     * Subclasses should use the `_graphics` property to perform drawing operations.
     * This method is called during the `update()` process if the object is marked as dirty.
     * 
     * @remarks
     * Implementing this method allows subclasses to define their specific rendering logic,
     * ensuring that each visual object can be drawn according to its unique characteristics.
     */
    public abstract draw(): void;

    /** 
     * Gets the text label associated with the visual object.
     * 
     * @remarks
     *  - The text label can be used to display information about the visual object, such as its value or identifier.
     *  - This is different than the `label` property of the `Container` class, which is used for internal identification and debugging purposes.
     *  - The text label is rendered as part of the visual object and can be styled and positioned as needed.
     *  - The text label is automatically updated when the visual object is redrawn, ensuring that it remains consistent with the visual representation.
     */
    public get textLabel(): Readonly<Text> {
        return this._label;
    }

    /** 
     * Sets the text label associated with the visual object.
     * It invokes `markDirty()` to ensure the visual object is redrawn with the updated label.
     */
    public set textLabel(text: string | Text) {
        if (typeof text === 'string') {
            if (text === this._label.text) return;
            this._label.text = text;
        } else {
            if (text === this._label) return;
            this._label = text;
        }

        this.markDirty();
    }
    
    public get graphics(): Graphics {
        return this._graphics;
    }

    public get color(): Color {
        return this._color;
    }

    /** 
     * Sets the color of the visual object.
     * It invokes `markDirty()` to ensure the visual object is redrawn with the updated color.
     */
    public set color(color: Color) {
        if (this._color.toHex() === color.toHex()) return;

        this._color = color;

        this.markDirty();
    }

    public override destroy(options?: DestroyOptions) {
        this.animations.clear();

        // options = Object.assign({}, options, { children: true });

        super.destroy(options);
    }
}