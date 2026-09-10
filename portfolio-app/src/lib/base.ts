// Site is served from https://jkarthikreddy.github.io/portfolio/, so every
// hand-written public asset URL has to carry the basePath. next.config.ts
// injects the same value so the two never drift.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
