import type { VisualObject } from "../visuals/VisualObject";
import type { AnimationConfig } from "./AnimationConfig";
import type { AnimationResult } from "./AnimationResult";
import { Animation } from "./Animations";

export class AnimationController {
    constructor(target: VisualObject) {
        this._target = target;
    }

    public has(animation: Animation): boolean {
        return this._animations.some(anim => anim.vars === animation);
    }

    public register(animation: Animation, config?: AnimationConfig): Readonly<AnimationResult> {
        if (this.has(animation)) {
            this.terminate(animation);
        }
        
        const result = animation.apply(this._target, config).pause();
    
        result.eventCallback("onComplete", () => {
            this._remove(result);
        });

        this._animations.push(result);
        return result;
    }

    // Terminates the animation associated with the given algoVisualizer.animations.Animation instance
    // Used when the user doesn't hold a reference to the AnimationResult.
    // example: obj.animations.terminate(algoVisualizer.animations.Animation.Pulse);
    public terminate(animation: Animation): void {
        const anim = this._animations.find(anim => anim.vars === animation);
        if (anim) {
            anim.kill();
            this._remove(anim);
        }
    }

    public clear(): void {
        this._animations.forEach(anim => anim.kill());
        this._animations.length = 0;
    }

    private _remove(animation: AnimationResult): void {
        const index = this._animations.indexOf(animation);
        if (index !== -1) {
            this._animations.splice(index, 1);
        }
    }


    private readonly _target: VisualObject;
    private readonly _animations: AnimationResult[] = [];
}