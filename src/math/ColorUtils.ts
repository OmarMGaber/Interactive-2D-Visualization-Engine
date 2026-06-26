import { Color } from "./Color";
import lerp from "./Lerp";

export class ColorUtils {
    public static isValidHexColor(hex: string): boolean {
        if (hex.startsWith("#")) {
            hex = hex.slice(1);
        }

        return /^[0-9A-Fa-f]{6}$/.test(hex);
    }

    /**
     * Converts a number (0-255) to a two-digit hexadecimal string.
     * @param x The number to convert.
     * @returns A two-digit hexadecimal string representing the number. e.g., 0 becomes "00", 255 becomes "ff", and 128 becomes "80".
     */
    public static numberToHex(x: number): string {
        return x.toString(16).padStart(2, "0");
    }

    /**
     * @static @function
     * Linearly interpolates between two colors based on the given blend ratio.
     * @param start The starting color.
     * @param end The target color.
     * @param blendRatio Interpolation factor (0.0 to 1.0). 0.0 returns the start color, 1.0 returns the end color, and values in between return a blend of the two colors.
     * @returns A new Color that is the result of interpolating between the start and end colors based on the blend ratio.
     */
    static lerp(start: Color, end: Color, blendRatio: number): Color {
        return new Color(
            lerp(start.red, end.red, blendRatio),
            lerp(start.green, end.green, blendRatio),
            lerp(start.blue, end.blue, blendRatio),
            lerp(start.opacity, end.opacity, blendRatio)
        );
    }

    public static fromHex(hex: string | number): Color {
        if (typeof hex === "number") {
            return new Color(
                (hex >> 16) & 0xFF,
                (hex >> 8) & 0xFF,
                hex & 0xFF
            );
        }

        if (!ColorUtils.isValidHexColor(hex)) {
            throw new Error("Invalid hex color format. Expected format: #RRGGBB or RRGGBB");
        }

        let startIndex = 0;
        if (hex.startsWith("#")) {
            startIndex = 1;
        }

        const r = parseInt(hex[startIndex] + hex[startIndex + 1], 16);
        const g = parseInt(hex[startIndex + 2] + hex[startIndex + 3], 16);
        const b = parseInt(hex[startIndex + 4] + hex[startIndex + 5], 16);
        return new Color(r, g, b);
    }

    public static fromRgbaString(rgba: string): Color {
        const match = rgba.match(/rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1))?\s*\)/);
        if (!match) {
            throw new Error("Invalid RGBA string format. Expected format: rgba(r, g, b, a) or rgb(r, g, b)");
        }

        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
        return new Color(r, g, b, a);
    }
}