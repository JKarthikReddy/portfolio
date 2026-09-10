"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  useDragControls,
  animate,
  type PanInfo,
} from "motion/react";
import type { Project } from "@/data/content";
import { Z } from "@/lib/z";
import { project as projectMomentum } from "@/lib/motion";

const DISMISS_DISTANCE = 160;

export function ProjectSheet({ project, onClose }: { project: Project; onClose: () => void }) {
  const y = useMotionValue(0);
  const reduce = useReducedMotion();
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  // Enter/exit keyframes must be numeric: useTransform below interpolates y, and a
  // "100%" string reads as NaN, which hard-cuts the scrim instead of fading it.
  // The sheet remounts on every open, so computing this per render is fine.
  const vh = typeof window !== "undefined" ? window.innerHeight : 1000;
  // Single writer for scrim opacity: derived from y and nothing else. y starts at vh on
  // enter, so this doubles as the fade-in. Never rebind opacity via initial/animate/exit
  // — a second writer wins the first frame and kills the scrim.
  const scrimOpacity = useTransform(y, [0, vh], [1, 0]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  // a11y: move focus into the dialog on open, restore it to the trigger on close.
  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus({ preventScroll: true });
    return () => returnTo?.focus({ preventScroll: true });
  }, []);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const projected = info.offset.y + projectMomentum(info.velocity.y);
    if (projected > DISMISS_DISTANCE && info.velocity.y >= 0) {
      animate(y, vh, { type: "spring", bounce: 0, duration: 0.3, velocity: info.velocity.y }).then(onClose);
    } else {
      animate(y, 0, { type: "spring", bounce: 0.2, duration: 0.4, velocity: info.velocity.y });
    }
  }

  return (
    <motion.div role="dialog" aria-modal="true" aria-label={project.title}
      className="fixed inset-0" style={{ zIndex: Z.sheet }}>
      <motion.button aria-label="Close" onClick={onClose}
        className="absolute inset-0 bg-black/60" style={{ opacity: scrimOpacity }} />
      <motion.div
        ref={sheetRef}
        tabIndex={-1}
        drag={reduce ? false : "y"}
        dragControls={dragControls}
        dragListener={false}                        /* handle-only: see the header strip below */
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.15, bottom: 0.6 }}   /* rubber-band up, loose down */
        dragMomentum={false}                        /* our animate() owns the release */
        style={{ y }}
        onDragEnd={handleDragEnd}
        initial={reduce ? { opacity: 0 } : { y: vh }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: vh }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
        /* outline-none: this container is a programmatic focus target only
           (tabIndex -1, not interactive), so its focus is deliberately
           unstyled — the UA ring would otherwise draw around the whole sheet
           on open. Every real control inside keeps its own focus-visible ring. */
        className="absolute inset-x-0 bottom-0 top-16 flex flex-col rounded-t-[20px] border-t border-white/10 bg-surface-2/90 backdrop-blur-2xl outline-none"
      >
        {/* The handle strip is the ONLY drag surface. Motion sets touch-action and
            user-select on whatever listens for drag, and both inherit/intersect down the
            tree — so a scroller nested under a drag listener can never scroll on touch or
            select text. Isolating the listener here keeps the scroller fully native. */}
        <div
          onPointerDown={e => dragControls.start(e)}
          style={{ touchAction: "none" }}
          className="shrink-0 cursor-grab py-4 active:cursor-grabbing"
        >
          <div aria-hidden className="mx-auto h-1.5 w-12 rounded-full bg-white/20" />
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <h3 className="text-3xl tracking-tighter">{project.title}</h3>
            <p className="mt-2 text-ink-dim">{project.tagline}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {project.metrics.map(m => (
                <div key={m.label} className="rounded-card border border-white/10 p-4">
                  <div className="text-sm text-ink-dim">{m.label}</div>
                  <div className="font-mono text-xl">{m.value}</div>
                </div>
              ))}
            </div>
            {project.body.map(par => <p key={par.slice(0, 24)} className="mt-5 leading-relaxed text-ink-dim">{par}</p>)}
            <div className="mt-8 grid gap-4">
              {project.media.map(m => (
                <Image key={m.src} src={m.src} alt={m.alt} width={1200} height={800}
                  className="w-full rounded-card border border-white/10" unoptimized={m.kind === "gif"} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
