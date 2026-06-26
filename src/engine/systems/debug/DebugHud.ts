import { Color } from "@/math/Color";

/**
 * A simple heads-up display (HUD) for showing debug information in a web application.
 * 
 * @description This class creates a fixed-position HTML div element that can be used to display debug information.
 * It provides methods to set the text content, toggle visibility, and attach the HUD to a specific HTML element.
 * 
 * @remark This HUD is intended for use in web applications and is not part of the Pixi.js rendering context. It is designed to be lightweight and easy to use for displaying debug information.
 */
export class DebugHud {
    private htmlEl: HTMLDivElement;

    constructor(private readonly id: string) {
        if (document.getElementById(id)) {
            throw new Error(`DebugHud with id "${id}" already exists in the document.`);
        }

        if (document.body === null) {
            throw new Error("Document body is not available to attach DebugHud.");
        }

        const hud = document.createElement("div");

        hud.id = this.id;
        this.applyStyles(hud);

        document.body.appendChild(hud);
        this.htmlEl = hud;
    }

    private applyStyles(hud: HTMLDivElement): void {
        hud.style.position = "fixed";
        hud.style.top = "12px";
        hud.style.left = "12px";
        hud.style.padding = "8px 12px";
        hud.style.borderRadius = "8px";
        hud.style.background = "rgba(0, 0, 0, 0.8)";
        hud.style.color = Color.White.toHexString();
        hud.style.fontFamily = "monospace";
        hud.style.fontSize = "13px";
        hud.style.lineHeight = "1";
        hud.style.pointerEvents = "none";
        hud.style.userSelect = "none";
        hud.style.zIndex = "2147483648";
        hud.style.boxShadow = "0 2px 10px rgba(0,0,0,0.5)";
        hud.style.display = "none";
        hud.style.whiteSpace = "pre";
    }

    setVisible(visible: boolean): void {
        this.htmlEl.style.display = visible ? "block" : "none";
    }

    isVisible(): boolean {
        return this.htmlEl.style.display !== "none";
    }

    attachToElement(element: HTMLElement): void {
        element.appendChild(this.htmlEl);
        this.htmlEl.style.position = "absolute";
    }

    setText(text: string): void {
        this.htmlEl.textContent = text;
    }

    remove(): void {
        if (!this.htmlEl) return;
        this.htmlEl.remove();
    }

    exists(): boolean {
        return !!this.htmlEl;
    }
}

