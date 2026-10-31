export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (a, b, t) => a + (b - a) * t;
export const randomBetween = (min, max) => min + Math.random() * (max - min);
export const distance = (a, b) => Math.abs(a - b);
