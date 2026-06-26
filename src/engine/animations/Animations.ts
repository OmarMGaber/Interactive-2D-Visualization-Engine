import gsap from 'gsap';

import { VisualObject } from '../visuals/VisualObject';
import type { AnimationResult } from './AnimationResult';
import type { AnimationEffect } from './AnimationEffect';
import type { AnimationConfig } from './AnimationConfig';

export class Animation {

    constructor(effect: AnimationEffect) {
        this._effect = effect;
    }

    public apply(target: VisualObject, config?: AnimationConfig): AnimationResult {
        return this._effect(target, config);
    }

    public static Pulse = new Animation((target, config) => {
        const centerX = target.x + target.width / 2;
        const centerY = target.y + target.height / 2;

        return gsap.to(target, {
            ...getBaseConfig(config),
            duration: getDuration(config ?? {}, 100),
            x: (centerX - (target.width * 1.2) / 2),
            y: (centerY - (target.height * 1.1) / 2),
            width: target.width * 1.2,
            height: target.height * 1.1,
            yoyo: true,
            ease: "sine.inOut",
            repeat: 1,
        });
    });

    public static Bounce = new Animation((target, config) =>
        gsap.to(target.position, {
            ...getBaseConfig(config),
            duration: getDuration(config ?? {}, 0.5),
            y: "-=" + (config?.bounceHeight ?? 20),
            ease: "power1.inOut",
            yoyo: true,
        })
    );

    public static TransitionTo = new Animation((target, config) =>
        gsap.to(target.position, {
            ...getBaseConfig(config),
            x: config?.x,
            y: config?.y,
            ease: "power1.inOut",
        })
    );

    public static FadeInOut = new Animation((target, config) =>
        gsap.to(target.graphics, {
            ...getBaseConfig(config),
            duration: getDuration(config ?? {}, 0.8),
            alpha: config?.alpha ?? 0,
            repeat: config?.repeat ?? -1,
            ease: "sine.inOut",
            yoyo: config?.yoyo ?? true,
        })
    );

    public static Spin = new Animation((target, config) =>
        gsap.to(target.graphics, {
            ...getBaseConfig(config),
            rotation: Math.PI * 2 * (config?.rotations ?? 1),
            ease: "none",
        })
    );

    public static ScaleUp = new Animation((target, config) =>
        gsap.to(target.graphics.scale, {
            ...getBaseConfig(config),
            x: "*=" + (config?.xScaleAmount ?? 1.3),
            y: "*=" + (config?.yScaleAmount ?? 1.3),
            ease: "power1.out",
            repeat: 0,
        })
    );

    public static ScaleDown = new Animation((target, config) =>
        gsap.to(target.graphics.scale, {
            ...getBaseConfig(config),
            x: "/=" + (config?.xScaleAmount ?? 1.3),
            y: "/=" + (config?.yScaleAmount ?? 1.3),
            ease: "power1.in",
            repeat: 0,
        })
    );

    public static PopOut = new Animation((target, config) =>
        gsap.to(target.graphics, {
            ...getBaseConfig(config),
            duration: getDuration(config ?? {}, 0.3),
            x: "*=" + (config?.xScaleAmount ?? 1.5),
            y: "*=" + (config?.yScaleAmount ?? 1.5),
            alpha: 0,
            ease: "power1.in",
        })
    );

    public static Appear = new Animation((target, config) =>
        gsap.from(target, {
            ...getBaseConfig(config),
            duration: getDuration(config ?? {}, 0.3),
            alpha: 0,
            ease: "power1.out",
        })
    );

    public static Highlight = new Animation((target, config) =>
        gsap.to(target.graphics, {
            ...getBaseConfig(config),
            duration: getDuration(config ?? {}, 0.5),
            alpha: config?.alpha ?? 0.5,
            ease: "sine.inOut",
        })
    );

    public static Select = new Animation((target, config) => {
        const scaleUp = gsap.to(target.graphics.scale, {
            ...getBaseConfig(config),
            duration: getDuration(config ?? {}, 0.2),
            x: "*=" + (config?.xScaleAmount ?? 2),
            y: "*=" + (config?.yScaleAmount ?? 2),
            ease: "power1.out",
        });

        const scaleDown = gsap.to(target.graphics.scale, {
            ...getBaseConfig(config),
            duration: getDuration(config ?? {}, 0.2),
            x: "/=" + (config?.xScaleAmount ?? 1.2),
            y: "/=" + (config?.yScaleAmount ?? 1.2),
            ease: "power1.in",
        });

        return gsap.timeline({ paused: true })
            .add(scaleUp)
            .add(scaleDown);
    });

    private _effect: AnimationEffect;
}

function getDuration(config: AnimationConfig, defaultDuration: number = 1): number {
    if (config.speed !== undefined) {
        if (config.duration !== undefined) {
            return Number(config.duration) / Number(config.speed);
        } else {
            return defaultDuration / Number(config.speed);
        }
    }

    return Number(config.duration ?? 1.0);
}

/**
 * Internal helper to handle repeating logic and speed calculations 
 * shared across all animations.
 */
const getBaseConfig = (config?: AnimationConfig) => ({
    duration: getDuration(config ?? {}),
    repeat: config?.repeat ?? 0, // Default to infinite repeat
    paused: true, // Make the animation paused by default. The caller can choose when to play it.
});
