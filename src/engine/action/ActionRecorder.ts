import type { VisualObject } from "../visuals/VisualObject";
import type { Action } from "./Action";

export class ActionRecorder<VisualElement extends VisualObject> {
    public isRecording: boolean = true;
    private actions: Action<VisualElement>[];

    constructor() {
        this.actions = [];
    }

    record(action: Action<VisualElement>): void {
        if (!this.isRecording) {
            console.warn(`Attempted to record an action ${action.constructor.name} from ${this.record.caller} while recording is disabled.`);
            return;
        }

        this.actions.push(action);
    }

    // Retrieves all recorded actions and clears the recorder buffer.
    collect(): Readonly<Action<VisualElement>[]> {
        const committedActions = this.actions; // transfer ownership of the actions to the caller
        this.clear();
        return committedActions;
    }

    clear(): void {
        this.actions = [];
    }
}

// Handle recording the canvas output and exporting it as a video file.
// export class VideoExporter {
//     private mediaRecorder: MediaRecorder | null = null;
//     private recordedChunks: Blob[] = [];

//     constructor(private canvas: HTMLCanvasElement) {}

//     public startRecording() { 
//     }

//     public stopRecording() {
//     }
// }