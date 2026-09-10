"use client";

import type { ReactNode, RefObject } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

/**
 * Section handover for pinned "pages". A pinned track keeps its viewport stuck
 * for HANDOVER_VH more of scroll after its own choreography ends; during that
 * zone the viewport shrinks and dims while the next section, pulled up by the
 * track's negative bottom margin, slides over it with a rounded leading edge.
 * The same viewport also rounds its own leading edge while it slides in over
 * whatever came before, so every page edge reads as a card riding over the last.
 */
export const HANDOVER_VH = 100;
const EDGE_RADIUS = 28;

/** Split a track's raw scroll progress into the section's own progress and the handover. */
export function useHandover(scrollYProgress: MotionValue<number>, baseVh: number) {
  const k = baseVh / (baseVh + HANDOVER_VH);
  const progress = useTransform(scrollYProgress, [0, k], [0, 1]);
  const handover = useTransform(scrollYProgress, [k, 1], [0, 1]);
  return { progress, handover };
}

export function StackViewport({
  sectionRef,
  handover,
  children,
  className = "",
}: {
  sectionRef: RefObject<HTMLElement | null>;
  handover: MotionValue<number>;
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  // motion waits for a pending ref, so the section ref can be passed before it attaches.
  const { scrollYProgress: entry } = useScroll({
    target: sectionRef,
    offset: ["start end", "start start"],
  });
  const scale = useTransform(handover, [0, 1], [1, 0.94]);
  const dim = useTransform(handover, [0, 1], [0, 0.6]);
  const radius = useTransform([entry, handover], ([e, h]: number[]) => `${Math.max(EDGE_RADIUS * (1 - e), EDGE_RADIUS * h)}px`);

  return (
    <motion.div
      style={reduced ? undefined : { scale, borderRadius: radius }}
      className={`sticky top-0 h-[100dvh] overflow-hidden bg-surface shadow-[0_-30px_80px_rgba(0,0,0,0.55)] ${className}`}
    >
      {children}
      <motion.div
        aria-hidden="true"
        style={{ opacity: reduced ? 0 : dim }}
        className="pointer-events-none absolute inset-0 bg-surface"
      />
    </motion.div>
  );
}
