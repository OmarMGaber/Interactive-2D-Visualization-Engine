import type { Container } from "pixi.js";

/**
 * Muatates the given PIXI Container state to enable interactive mode, allowing it to respond to user input events.
 * 
 * @remarks
 *  - This function sets the `eventMode` of the container to "static", enabling it to receive interaction events.
 *  - It also sets the `interactive` and `interactiveChildren` properties to true, allowing both the container and its children to respond to user interactions.
 *  - Use this function when you want a visual object or container to be interactive within the visualization runtime.
 * 
 * @param obj The PIXI Container to be mutated for interactive mode. 
 */
export default function enableInteractiveMode(obj: Container): void {
    obj.eventMode = "static";
    obj.interactive = true;
    obj.interactiveChildren = true;
}