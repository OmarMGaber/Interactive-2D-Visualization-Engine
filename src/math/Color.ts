import { ColorUtils } from "./ColorUtils";
import lerp from "./Lerp";

export class Color {
    constructor(private _r: number = 255, private _g: number = 255, private _b: number = 255, private _a: number = 1) { }

    public get red(): number {
        return this._r;
    }

    public get blue(): number {
        return this._b;
    }

    public get green(): number {
        return this._g;
    }

    public get opacity(): number {
        return this._a;
    }

    public static readonly Red = new Color(255, 0, 0);
    public static readonly Blue = new Color(0, 0, 255);
    public static readonly Green = new Color(0, 255, 0);
    public static readonly Black = new Color(0, 0, 0);
    public static readonly White = new Color(255, 255, 255);
    public static readonly Gray = new Color(128, 128, 128);
    public static readonly Yellow = new Color(255, 255, 0);
    public static readonly Cyan = new Color(0, 255, 255);
    public static readonly Magenta = new Color(255, 0, 255);
    public static readonly Orange = new Color(255, 165, 0);
    public static readonly Brown = new Color(165, 42, 42);
    public static readonly Transparent = new Color(0, 0, 0, 0);

    /**
     * Linearly interpolates between two colors based on the given blend ratio.
     * Modifies the `out` color instance to store the result of the interpolation instead of creating a new Color instance.
     * @param out The Color instance to store the result of the interpolation.
     * @param start The starting color.
     * @param end The target color.
     * @param blendRatio The interpolation factor (0.0 to 1.0).
     */
    public static lerpInto(out: Color, start: Color, end: Color, blendRatio: number): void {
        out._r = lerp(start.red, end.red, blendRatio);
        out._g = lerp(start.green, end.green, blendRatio);
        out._b = lerp(start.blue, end.blue, blendRatio);
        out._a = lerp(start.opacity, end.opacity, blendRatio);
    }

    public toRGBAString(): string {
        return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
    }

    public toRGBString(): string {
        return `rgb(${this._r}, ${this._g}, ${this._b})`;
    }

    public toHexString(): string {
        return "#" + ColorUtils.numberToHex(this._r) + ColorUtils.numberToHex(this._g) + ColorUtils.numberToHex(this._b);
    }

    public toHex(): number {
        return (this._r << 16) | (this._g << 8) | this._b;
    }

    public toNormalizedColorArray(): Float32Array {
        return new Float32Array([
            this._r / 255,
            this._g / 255,
            this._b / 255,
            this._a
        ]);
    }

    public complement(): Color {
        return new Color(255 - this._r, 255 - this._g, 255 - this._b, this._a);
    }
}