export type AnimationResult = gsap.core.Tween | gsap.core.Timeline;

export function playAsync(animation: AnimationResult): Promise<void> {
    return new Promise((resolve) => {
        animation.eventCallback("onComplete", resolve);
        animation.eventCallback("onInterrupt", resolve);
        animation.play();
    });
}

export function playWithTimeout(animation: AnimationResult, timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
        playAsync(animation).then(resolve);

        setTimeout(() => {
            animation.kill();
            resolve();
        }, timeoutMs);
    });
}