export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function intersects(r1: Rect, r2: Rect): boolean {
    return !(
        r1.x + r1.width <= r2.x ||
        r1.x >= r2.x + r2.width ||
        r1.y + r1.height <= r2.y ||
        r1.y >= r2.y + r2.height
    );
}

export function contains(r1: Rect, r2: Rect): boolean {
    return (
        r1.x <= r2.x &&
        r1.x + r1.width >= r2.x + r2.width &&
        r1.y <= r2.y &&
        r1.y + r1.height >= r2.y + r2.height
    );
}

export function toString(rect: Rect): string {
    return `Rect(x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height})`;
}

export { toString as default };