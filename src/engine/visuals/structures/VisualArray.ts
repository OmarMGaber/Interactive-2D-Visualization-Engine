import type { Action } from "../../action/Action";
import { ActionRecorder } from "../../action/ActionRecorder";
import { VisualObject } from "../VisualObject";
import { Animations } from "../../animations/Animations";
import { Rectangle } from "../primitive/Rectangle";
import { Color } from "../../../math/Color";
import type { AnimationResult } from "../../animations/AnimationResult";
import { TextStyle, Text } from "pixi.js";

export class VisualArray<T> extends VisualObject {
    static DEFAULT_VISUAL_HEIGHT = 100;
    static DEFAULT_VISUAL_WIDTH = 100;

    private static readonly INDEX_TEXT_STYLE = new TextStyle({
        fill: Color.Black.toHexString(),
    });

    // The visual items that are manpulated for visualization by actions.
    // (The source of truth for animations)
    #visualItems: [T, Readonly<VisualObject>][] = [];
    private recorder: ActionRecorder<VisualArray<T>>;

    // This snapshot is used to keep track of the current values in the array for comparison operations, 
    // since the visual objects themselves only store the visual representation and not the actual value.
    // (The source of truth for algorithm logic)
    #valuesSnapshot: T[] = [];

    constructor(items: T[]) {
        super({});

        this._label.text = `Visual Array (id: ${this.uid}) (size: ${items.length})`;
        this._label.visible = false;

        this.recorder = new ActionRecorder<VisualArray<T>>();

        this.#valuesSnapshot = [...items];
        this.#visualItems = new Array(items.length);

        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            const visual = this.createVisualObjectForItem(item, index);
            this.createIndexVisual(index);
            this.#visualItems[index] = [item, visual] as [T, Readonly<VisualObject>];
        }
    }

    private createIndexVisual(index: number): void {
        const label = new Text({
            text: String(index),
            style: VisualArray.INDEX_TEXT_STYLE,
        });

        label.anchor.set(0.5);
        label.position.set(index * (VisualArray.DEFAULT_VISUAL_WIDTH + 30) + VisualArray.DEFAULT_VISUAL_WIDTH / 2, VisualArray.DEFAULT_VISUAL_HEIGHT + 20);
        this.addChild(label);

    }

    private createVisualObjectForItem(item: T, index: number): Readonly<VisualObject> {
        const visual = new Rectangle(VisualArray.DEFAULT_VISUAL_WIDTH, VisualArray.DEFAULT_VISUAL_HEIGHT);
        this.addChild(visual);
        visual.color = Color.Black;
        visual.textLabel = String(item);

        // make the label centered in the rectangle
        visual.textLabel.anchor.set(0.5);
        visual.textLabel.position.set(VisualArray.DEFAULT_VISUAL_WIDTH / 2, VisualArray.DEFAULT_VISUAL_HEIGHT / 2);

        visual.textLabel.style.fill = visual.color.complement().toHexString();
        visual.position.set(
            index * (VisualArray.DEFAULT_VISUAL_WIDTH + 30),
            0
        );
        return visual;
    }

    public draw(): void {
        for (let i = 0; i < this.#visualItems.length; ++i) {
            this.#visualItems[i][1].draw();
        }
    }

    get(index: number): void {
        if (this.recorder.isRecording) {
            this.recorder.record(new VisualArray.AnimationOperations.Select(index));
        }
    }

    set(index: number, value: T): void {
        this.#visualItems[index][0] = value;
        this.#valuesSnapshot[index] = value;
    }

    size(): number {
        return this.#visualItems.length;
    }

    swap(i: number, j: number): void {
        [this.#valuesSnapshot[i], this.#valuesSnapshot[j]] = [this.#valuesSnapshot[j], this.#valuesSnapshot[i]];

        if (this.recorder.isRecording) {
            this.recorder.record(new VisualArray.AnimationOperations.Swap(i, j));
        }
    }

    // Collects the recorded actions and returns them, which can then be played back by an ActionPlayer to visualize the algorithm.
    // This also clears the recorder for the next algorithm to be visualized.
    collectActions(): Readonly<Action<VisualArray<T>>[]> {
        return this.recorder.collect();
    }

    compare(i: number, j: number, compareFn: (a: T, b: T) => number): number {
        if (this.recorder.isRecording) {
            this.recorder.record(new VisualArray.AnimationOperations.Compare(i, j, compareFn));
        }
        
        return compareFn(this.#valuesSnapshot[i], this.#valuesSnapshot[j]);
    }


    // The operations that can be performed on the visual array, which also define the animations to be played for each operation.
    static AnimationOperations = class {
        static Swap = class <T> implements Action<VisualArray<T>> {
            constructor(public index1: number, public index2: number) { }

            async apply(targetArray: VisualArray<T>): Promise<void> {
                const A = targetArray.#visualItems[this.index1][1];
                const B = targetArray.#visualItems[this.index2][1];

                const bounceA = A.animations.register(Animations.Bounce, { bounceHeight: VisualArray.DEFAULT_VISUAL_HEIGHT, yoyo: false, repeat: 0 });
                const bounceB = B.animations.register(Animations.Bounce, { bounceHeight: VisualArray.DEFAULT_VISUAL_HEIGHT, yoyo: false, repeat: 0 });

                const moveA = A.animations.register(Animations.TransitionTo, { x: B.x, y: B.y, repeat: 0 });
                const moveB = B.animations.register(Animations.TransitionTo, { x: A.x, y: A.y, repeat: 0 });

                await Promise.all([bounceA.play(), bounceB.play()]);
                await moveA.play();
                await moveB.play();

                [targetArray.#visualItems[this.index1], targetArray.#visualItems[this.index2]] = [targetArray.#visualItems[this.index2], targetArray.#visualItems[this.index1]];
            }

            async reverse?(targetArray: VisualArray<T>): Promise<void> {
                await this.apply(targetArray);
            }

            getDescription?(): string {
                return `Swapping indices ${this.index1} and ${this.index2}`;
            }
        };

        static Select = class <T> implements Action<VisualArray<T>> {
            constructor(public index: number) { }

            async apply(targetArray: VisualArray<T>): Promise<void> {
                const visual = targetArray.#visualItems[this.index][1];

                await visual.animations.register(Animations.Pulse, { pulseScale: 1.2, repeat: 1 }).play();
            }

            async reverse?(targetArray: VisualArray<T>): Promise<void> {
                await this.apply(targetArray);
            }

            getDescription?(): string {
                return `Selecting index ${this.index}`;
            }
        };

        static Compare = class <T> implements Action<VisualArray<T>> {
            constructor(public index1: number, public index2: number, public compareFn: (a: T, b: T) => number) {
            }

            async apply(targetArray: VisualArray<T>): Promise<void> {
                const A = targetArray.#visualItems[this.index1][1];
                const B = targetArray.#visualItems[this.index2][1];

                let bounceA = A.animations.register(Animations.Bounce, { bounceHeight: VisualArray.DEFAULT_VISUAL_HEIGHT, yoyo: false, repeat: 0 });
                let bounceB = B.animations.register(Animations.Bounce, { bounceHeight: VisualArray.DEFAULT_VISUAL_HEIGHT, yoyo: false, repeat: 0 });

                await Promise.all([bounceA.play(), bounceB.play()]);

                let anim: AnimationResult | null = null;

                let res = this.compareFn(targetArray.#visualItems[this.index1][0], targetArray.#visualItems[this.index2][0]);

                if (res > 0) {
                    anim = A.animations.register(Animations.Pulse, { pulseScale: 1.2, repeat: 1 });
                } else if (res < 0) {
                    anim = B.animations.register(Animations.Pulse, { pulseScale: 1.2, repeat: 1 });
                }

                if (anim) {
                    await anim.play();
                }

                bounceA = A.animations.register(Animations.Bounce, { bounceHeight: -VisualArray.DEFAULT_VISUAL_HEIGHT, yoyo: false, repeat: 0 });
                bounceB = B.animations.register(Animations.Bounce, { bounceHeight: -VisualArray.DEFAULT_VISUAL_HEIGHT, yoyo: false, repeat: 0 });

                await Promise.all([bounceA.play(), bounceB.play()]);
            }

            getDescription?(): string {
                return `Comparing indices ${this.index1} and ${this.index2}`;
            }
        }
    };
}