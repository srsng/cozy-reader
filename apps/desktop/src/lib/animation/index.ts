import { elasticOut } from 'svelte/easing';

const APP_LAYOUT_TILT_DURATION = 800;
const APP_LAYOUT_TILT_ROTATE_DEG = -5;
const APP_LAYOUT_TILT_TRANSLATE_Y_PX = 10;
const APP_LAYOUT_TILT_SCALE = 0.98;

function getTiltTransform(progress: number): string {
    const rotate = (1 - progress) * APP_LAYOUT_TILT_ROTATE_DEG;
    const translateY = (1 - progress) * APP_LAYOUT_TILT_TRANSLATE_Y_PX;
    const scale = APP_LAYOUT_TILT_SCALE + progress * (1 - APP_LAYOUT_TILT_SCALE);

    return `rotate(${rotate}deg) translateY(${translateY}px) scale(${scale})`;
}

function createLayoutTiltTransition(progress: (t: number) => number) {
    return {
        duration: APP_LAYOUT_TILT_DURATION,
        easing: elasticOut,
        css: (t: number) => {
            return `
				transform: ${getTiltTransform(progress(t))};
				transform-origin: center bottom;
				will-change: transform;
			`;
        }
    };
}

export function tiltUp(node: HTMLElement) {
    return createLayoutTiltTransition((t) => t);
}

export function tiltDown(node: HTMLElement) {
    return createLayoutTiltTransition((t) => 1 - t);
}
