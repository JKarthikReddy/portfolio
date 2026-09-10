"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { projects } from "@/data/content";
import { stones, STOPS, type Stone } from "@/data/stones";
import WebGLBoundary from "@/components/bits/WebGLBoundary";
import { HANDOVER_VH, StackViewport, useHandover } from "@/components/bits/StackViewport";
import { Z } from "@/lib/z";
import { Gauntlet } from "./Gauntlet";
import { StoneVideo } from "./StoneVideo";
import { ProjectSheet } from "./ProjectSheet";
import { Work } from "./Work";
import { span01 } from "@/lib/motion";

/**
 * Six stones, six projects. The section pins for VH_PER_STOP viewports per stop
 * (one intro stop plus one per stone). One scroll progress value owns every
 * visual: the gauntlet pose and stone lift (Gauntlet), the backdrop crossfade
 * (StoneVideo), the intro headline, the per-stone text and the rail. Reverse
 * scrolling replays everything backwards.
 *
 * Reduced motion, or a WebGL context that fails to create, renders the Work
 * grid instead; the data is identical.
 */

const VH_PER_STOP = 120;
const STOP = 1 / STOPS;

export function Stones() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [glFailed, setGlFailed] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  // The track carries a handover zone after the last stone; progress covers only the stones.
  const { progress, handover } = useHandover(scrollYProgress, STOPS * VH_PER_STOP);
  // useReducedMotion reads null on the server, so the static export always
  // contains the track. Swap to the Work grid only after hydration.
  useEffect(() => setMounted(true), []);

  if ((mounted && reduced) || glFailed) return <Work />;

  const open = projects.find((p) => p.slug === openSlug);

  // Land 40% into the stop, where the stone is fully lifted and the text is readable.
  const scrollToStop = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const trackTop = el.getBoundingClientRect().top + window.scrollY;
    const base = STOPS * VH_PER_STOP;
    const scrollable = (el.offsetHeight * base) / (base + HANDOVER_VH) - window.innerHeight;
    window.scrollTo({ top: trackTop + scrollable * ((i + 1) * STOP + STOP * 0.4), behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} id="work" aria-label="Selected work" className="relative -mb-[100dvh]" style={{ zIndex: Z.work }}>
      <div ref={trackRef} className="relative" style={{ height: `${STOPS * VH_PER_STOP + HANDOVER_VH}vh` }}>
        <StackViewport sectionRef={sectionRef} handover={handover}>
          <StoneVideo progress={progress} />
          <div className="absolute inset-0">
            <WebGLBoundary defer margin="150%" onFail={() => setGlFailed(true)} placeholderClassName="h-full w-full">
              <Gauntlet progress={progress} />
            </WebGLBoundary>
          </div>
          <Intro progress={progress} />
          {stones.map((stone, i) => (
            <StoneCard key={stone.id} stone={stone} index={i} progress={progress} onOpen={setOpenSlug} />
          ))}
          <StoneRail progress={progress} onJump={scrollToStop} />
        </StackViewport>
      </div>
      <AnimatePresence>
        {open && <ProjectSheet project={open} onClose={() => setOpenSlug(null)} />}
      </AnimatePresence>
    </section>
  );
}

function Intro({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, ...span01([0, STOP * 0.75, STOP], [1, 1, 0]));
  const y = useTransform(progress, ...span01([0, STOP], [0, -40]));
  return (
    <motion.h2
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-x-4 top-[40%] text-center text-4xl tracking-tighter md:text-6xl"
    >
      Six stones. Six proofs of work.
    </motion.h2>
  );
}

/**
 * One stone's text block plus its ghost numeral. Both rise in over the first
 * quarter of the stop, hold, and fall away over the last quarter, mirroring the
 * stone's lift in Gauntlet.tsx. Visibility follows opacity so hidden cards are
 * neither clickable nor in the tab order.
 */
function StoneCard({
  stone,
  index,
  progress,
  onOpen,
}: {
  stone: Stone;
  index: number;
  progress: MotionValue<number>;
  onOpen: (slug: string) => void;
}) {
  const project = projects.find((p) => p.slug === stone.slug)!;
  const start = (index + 1) * STOP;
  const end = start + STOP;
  const rise = start + STOP * 0.25;
  const leave = start + STOP * 0.75;

  const opacity = useTransform(progress, ...span01([start, rise, leave, end], [0, 1, 1, 0]));
  const y = useTransform(progress, ...span01([start, rise, leave, end], [48, 0, 0, -32]));
  const visibility = useTransform(opacity, (o) => (o > 0.02 ? "visible" : "hidden"));
  const numeral = `0${index + 1}`;

  return (
    <>
      <motion.div
        style={{ opacity, y, visibility }}
        className="absolute inset-y-0 left-4 flex w-[min(90vw,34rem)] flex-col justify-center md:left-12"
      >
        <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em]" style={{ color: stone.hex }}>
          <span aria-hidden="true" className="inline-block size-2" style={{ background: stone.hex }} />
          {`${numeral} / 0${stones.length} · ${stone.name} Stone`}
        </p>
        <h3 className="mt-5 text-4xl uppercase leading-[1.05] tracking-[0.18em] md:text-5xl">
          <button
            type="button"
            onClick={() => onOpen(project.slug)}
            aria-haspopup="dialog"
            className="text-left transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4"
          >
            {project.title}
          </button>
        </h3>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-dim">{project.tagline}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-ink-dim">
              {tag}
            </li>
          ))}
        </ul>
      </motion.div>
      <motion.span
        aria-hidden="true"
        style={{ opacity }}
        className="pointer-events-none absolute -bottom-[0.12em] right-2 font-mono text-[18vw] font-bold leading-none text-white/[0.06]"
      >
        {numeral}
      </motion.span>
    </>
  );
}

/**
 * Six diamonds on a dashed vertical line at the right edge. A diamond ignites
 * as its stone starts lifting (10% into the stop) and stays lit, so the rail
 * counts claimed stones. Clicking one scrolls the track to that stop.
 */
function StoneRail({ progress, onJump }: { progress: MotionValue<number>; onJump: (i: number) => void }) {
  const [claimed, setClaimed] = useState(0);
  useMotionValueEvent(progress, "change", (p) => {
    const n = Math.max(0, Math.min(stones.length, Math.floor(p * STOPS - 0.1)));
    setClaimed((c) => (c === n ? c : n));
  });

  return (
    <ol aria-label="Stones" className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-6 md:right-8">
      {stones.map((stone, i) => {
        const lit = i < claimed;
        return (
          <li key={stone.id} className="relative">
            {i > 0 && (
              <span aria-hidden="true" className="absolute -top-6 left-1/2 h-6 -translate-x-1/2 border-l border-dashed border-white/20" />
            )}
            <button
              type="button"
              aria-label={`Go to ${stone.name} Stone`}
              onClick={() => onJump(i)}
              className="block p-2 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              <span
                aria-hidden="true"
                className="block size-2.5 rotate-45 transition-[background-color,box-shadow] duration-300"
                style={{
                  background: lit ? stone.hex : "rgba(255, 255, 255, 0.2)",
                  boxShadow: lit ? `0 0 12px ${stone.hex}` : "none",
                }}
              />
            </button>
          </li>
        );
      })}
    </ol>
  );
}
