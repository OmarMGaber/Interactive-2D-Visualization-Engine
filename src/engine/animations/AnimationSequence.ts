import type { AnimationResult } from './AnimationResult';

export class AnimationSequence {
    private steps: AnimationResult[] = [];

    add(step: AnimationResult): this {
        this.steps.push(step);
        return this;
    }

    async runSequential() {
        for (const step of this.steps) {
            await step.play();
        }
    }

    async runParallel() {
        await Promise.all(this.steps.map(step => step.play()));
    }

    static parallel(...steps: AnimationResult[]): AnimationSequence {
        const sequence = new AnimationSequence();
        for (const step of steps) {
            sequence.add(step);
        }
        return sequence;
    }
}
