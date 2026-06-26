import type { VisualObject } from '../visuals/VisualObject';
import type { AnimationConfig } from './AnimationConfig';
import type { AnimationResult } from './AnimationResult';

export type AnimationEffect = (target: VisualObject, config?: AnimationConfig) => AnimationResult;