/**
 * @function
 * @description Linearly interpolates between two values based on an amount
 * @param {number} start Start Value
 * @param {number} end Target Value
 * @param {number} blendRatio Interpolation factor (0.0 to 1.0)
 * @returns {number} Interpolated value between start and end
 */
export default function lerp(start: number, end: number, blendRatio: number): number {
    return start + (end - start) * blendRatio;
}