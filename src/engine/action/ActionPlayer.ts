import type { VisualObject } from "../visuals/VisualObject";
import type { Action } from "./Action";

export class ActionPlayer<VisualElement extends VisualObject> {
    private actions: Readonly<Action<VisualElement>[]>;
    private activeStepIndex: number;
    private isPlaying: boolean = false;

    constructor(
        private target: VisualElement,
        actions: Readonly<Action<VisualElement>[]>
    ) {
        this.actions = actions;
        this.activeStepIndex = 0;
    }

    public hasNext(): boolean {
        return this.activeStepIndex < this.actions.length;
    }

    public hasPrevious(): boolean {
        return this.activeStepIndex > 0;
    }

    public async next(): Promise<void> {
        if (this.hasNext()) {
            const action = this.actions[this.activeStepIndex];
            await action.apply(this.target);
            this.activeStepIndex++;
        }
    }

    public async previous(): Promise<void> {
        if (this.hasPrevious()) {
            this.activeStepIndex--;
            const action = this.actions[this.activeStepIndex];
            if (action.reverse) {
                await action.reverse(this.target);
            }
        }
    }

    public async play(): Promise<void> {
        console.log("Starting playback...");
        if (this.isPlaying) return;
        console.log(`Total actions to play: ${this.actions.length}`);
        this.isPlaying = true;

        while (this.hasNext() && this.isPlaying) {
            console.log(`Playing action ${this.activeStepIndex + 1}/${this.actions.length}`);
            await this.next();
        }

        this.isPlaying = false;
    }

    public pause(): void {
        this.isPlaying = false;
    }

    public async reset(): Promise<void> {
        if (this.isPlaying) return;

        this.isPlaying = true;

        while (this.hasPrevious() && this.isPlaying) {
            await this.previous();
        }

        this.isPlaying = false;
    }

    public async playTo(index: number): Promise<void> {
        if (this.isPlaying) return;

        if (index < 0 || index > this.actions.length) {
            throw new RangeError(`Index out of bounds: ${index}, Actions length: ${this.actions.length}`);
        }

        this.isPlaying = true;
        
        while (this.activeStepIndex < index) {
            await this.next();
        }
        while (this.activeStepIndex > index) {
            await this.previous();
        }

        this.isPlaying = false;
    }
}