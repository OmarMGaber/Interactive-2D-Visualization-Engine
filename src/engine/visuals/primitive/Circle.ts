import { Bounds } from 'pixi.js';
import { VisualObject } from '../VisualObject';

/**
 * A primitive visual object representing a circle shape.
 */
export class Circle extends VisualObject {
    private _radius: number;

    constructor(radius: number) {
        super({});
        this._radius = radius;
    }

    public draw(): void {
        const g = this._graphics;

        g.clear();  

        g.circle(0, 0, this._radius);
        g.fill({ color: this._color.toHex() });
    }

    public set radius(radius: number) {
        if (this._radius === radius) return;

        this._radius = radius;
        this.markDirty();
    }

    public getBaseBounds(): Bounds {
        return new Bounds(
            -this._radius,
            -this._radius,
            this._radius * 2,
            this._radius * 2
        );
    }

    get radius(): number {
        return this._radius;
    }
}