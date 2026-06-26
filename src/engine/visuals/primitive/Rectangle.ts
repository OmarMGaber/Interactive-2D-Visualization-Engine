import { VisualObject } from "../VisualObject";

/**
 * A primitive visual object representing a rectangle shape.
 */
export class Rectangle extends VisualObject {
    private _width: number = 0;
    private _height: number = 0;

    constructor(width: number, height: number) {
        super({});

        this._width = width;
        this._height = height;
    }

    public draw(): void {
        const g = this._graphics;
        
        g.clear();
        g.rect(0, 0, this._width, this._height);
        g.fill({ color: this._color.toHex() });
    }

    public setWidth(width: number) {
        if (this._width === width) return;

        this._width = width;
        this.markDirty();
    }

    public setHeight(height: number) {
        if (this._height === height) return;

        this._height = height;
        this.markDirty();
    }
}