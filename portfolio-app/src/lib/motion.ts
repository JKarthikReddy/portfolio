export const SPRING_DEFAULT = { type: "spring", bounce: 0, duration: 0.4 } as const;
export const SPRING_MOMENTUM = { type: "spring", bounce: 0.2, duration: 0.35 } as const;

/** Apple momentum projection: where a flick would land. */
export function project(initialVelocity: number, decelerationRate = 0.998): number {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Pad a useTransform range so its offsets span exactly 0..1. Motion hands
 * scroll-linked transforms to the browser as native scroll-timeline keyframes,
 * and WAAPI fills a missing 0 or 1 keyframe from the element's inline style, so
 * an unpadded range drifts back toward that value outside its window.
 */
export function span01(input: number[], output: number[]): [number[], number[]] {
  const i = [...input];
  const o = [...output];
  if (i[0] > 0) {
    i.unshift(0);
    o.unshift(o[0]);
  }
  if (i[i.length - 1] < 1) {
    i.push(1);
    o.push(o[o.length - 1]);
  }
  return [i, o];
}
