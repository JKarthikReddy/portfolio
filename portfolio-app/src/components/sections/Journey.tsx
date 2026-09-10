"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { roles, type Role } from "@/data/content";
import { HANDOVER_VH, StackViewport, useHandover } from "@/components/bits/StackViewport";
import { Z } from "@/lib/z";

/**
 * The warp-tunnel journey. The section pins for VH_PER_STOP viewports per role;
 * scrolling drives azure light streaks racing past the camera, a year readout,
 * and one role card per stop that materializes out of the tunnel's depth, holds,
 * then flies past. Direction-agnostic and fully scrubbed: progress owns
 * everything, so reverse scrolling replays the scene backwards.
 *
 * Reduced motion (or no JS pin support) renders the quiet stacked list instead.
 */

const VH_PER_STOP = 120; // scroll budget per role, in vh
const STREAKS = 140;

/** First 4-digit year in a role's period string; stops sort by it. */
const yearOf = (r: Role) => Number(/\d{4}/.exec(r.period)?.[0] ?? 0);
const stops = [...roles].sort((a, b) => yearOf(a) - yearOf(b));

export function Journey() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const { progress, handover } = useHandover(scrollYProgress, stops.length * VH_PER_STOP);

  if (reduced) {
    return (
      <section id="experience" className="mx-auto max-w-5xl px-4 py-24">
        <h2 className="mb-10 text-4xl tracking-tighter">Experience</h2>
        <div className="grid gap-6">
          {stops.map((role) => (
            <article
              key={role.org}
              className="rounded-card border border-white/10 bg-surface-2 p-8"
            >
              <h3 className="text-2xl tracking-tight">{role.org}</h3>
              <p className="mt-1 font-mono text-sm text-ink-dim">
                {role.title} · {role.period} · {role.location}
              </p>
              {role.points.map((p) => (
                <p key={p.slice(0, 24)} className="mt-3 leading-relaxed text-ink-dim">
                  {p}
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="experience" aria-label="Experience" className="relative -mb-[100dvh]" style={{ zIndex: Z.experience }}>
      <div
        ref={trackRef}
        className="relative"
        style={{ height: `${stops.length * VH_PER_STOP + HANDOVER_VH}vh` }}
      >
        <StackViewport sectionRef={sectionRef} handover={handover} className="flex items-center justify-center">
          <WarpTunnel progress={progress} />
          <YearReadout progress={progress} />
          {stops.map((role, i) => (
            <StopCard key={role.org} role={role} index={i} total={stops.length} progress={progress} />
          ))}
          <h2 className="pointer-events-none absolute left-4 top-24 text-4xl tracking-tighter md:left-8">
            Experience
          </h2>
        </StackViewport>
      </div>
    </section>
  );
}

/**
 * Canvas streak field. Streaks live in polar space around the viewport center
 * and translate outward; scroll velocity multiplies their speed so the tunnel
 * surges between stops and coasts while a card holds. Runs only while the
 * pinned viewport is on screen.
 */
function WarpTunnel({ progress }: { progress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(canvasRef, { margin: "100px 0px" });
  const velocityRef = useRef(0);
  const lastP = useRef(0);

  useMotionValueEvent(progress, "change", (p) => {
    velocityRef.current += Math.abs(p - lastP.current) * 400; // surge on scroll
    lastP.current = p;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const parent = canvas?.parentElement;
    if (!canvas || !ctx || !parent || !inView) return;

    let w = 0;
    let h = 0;
    // Polar streaks: angle, distance from center, per-streak speed and girth.
    const ang = new Float32Array(STREAKS);
    const dist = new Float32Array(STREAKS);
    const spd = new Float32Array(STREAKS);
    const girth = new Float32Array(STREAKS);
    for (let i = 0; i < STREAKS; i++) {
      ang[i] = Math.random() * Math.PI * 2;
      dist[i] = Math.random();
      spd[i] = 0.25 + Math.random() * 0.75;
      girth[i] = 0.6 + Math.random() * 1.6;
    }

    const resize = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    let raf = 0;
    let last = 0;
    const frame = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      // Idle drift plus the scroll surge, decaying back to drift.
      velocityRef.current *= Math.pow(0.02, dt);
      const speed = 0.12 + Math.min(velocityRef.current, 3);

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.hypot(cx, cy);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineCap = "round";
      for (let i = 0; i < STREAKS; i++) {
        dist[i] += spd[i] * speed * dt;
        if (dist[i] > 1) {
          dist[i] -= 1;
          ang[i] = Math.random() * Math.PI * 2;
        }
        // Ease outward: streaks accelerate as they approach the camera.
        const r0 = Math.pow(dist[i], 2.2) * maxR;
        const len = Math.max(6, Math.pow(dist[i], 2.2) * (34 + speed * 26));
        const r1 = r0 + len;
        const cos = Math.cos(ang[i]);
        const sin = Math.sin(ang[i]);
        ctx.globalAlpha = Math.min(0.75, 0.08 + dist[i] * 0.7);
        ctx.lineWidth = girth[i] * (0.4 + dist[i] * 1.6);
        ctx.beginPath();
        ctx.moveTo(cx + cos * r0, cy + sin * r0);
        ctx.lineTo(cx + cos * r1, cy + sin * r1);
        ctx.stroke();
      }
      // Soft core glow so the vanishing point reads as a destination.
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.28);
      glow.addColorStop(0, "rgba(56, 189, 248, 0.14)");
      glow.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

/** Big mono year that counts through the stops as the tunnel is scrubbed. */
function YearReadout({ progress }: { progress: MotionValue<number> }) {
  const [year, setYear] = useState(yearOf(stops[0]));
  useMotionValueEvent(progress, "change", (p) => {
    const i = Math.min(stops.length - 1, Math.floor(p * stops.length));
    const next = yearOf(stops[i]);
    setYear((y) => (y === next ? y : next));
  });
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-6xl font-bold tabular-nums text-ink/10 md:text-8xl"
    >
      {year}
    </div>
  );
}

/**
 * One role per stop. Within its progress window the card travels from deep in
 * the tunnel (small, dim, blurred) to presentation scale, holds, then flies
 * past the camera (grows past 1, fades). All transforms hang off the scrubbed
 * progress value, so the whole trip is reversible.
 */
function StopCard({
  role,
  index,
  total,
  progress,
}: {
  role: Role;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const span = end - start;
  // Sub-windows: approach 35%, hold 45%, exit 20%.
  const arrive = start + span * 0.35;
  const leave = start + span * 0.8;

  const scale = useTransform(progress, [start, arrive, leave, end], [0.55, 1, 1, 1.35]);
  const opacity = useTransform(progress, [start, arrive, leave, end], [0, 1, 1, 0]);
  const blur = useTransform(progress, (p) => {
    if (p <= start || p >= end) return "blur(8px)";
    if (p < arrive) return `blur(${(8 * (arrive - p)) / (arrive - start)}px)`;
    if (p > leave) return `blur(${(10 * (p - leave)) / (end - leave)}px)`;
    return "blur(0px)";
  });

  return (
    <motion.article
      style={{ scale, opacity, filter: blur }}
      className="absolute w-[min(88vw,34rem)] rounded-card border border-white/10 bg-surface-2/85 p-8 backdrop-blur-xl"
    >
      <p className="font-mono text-sm text-accent">{role.period}</p>
      <h3 className="mt-1 text-3xl tracking-tight">{role.org}</h3>
      <p className="mt-1 font-mono text-sm text-ink-dim">
        {role.title} · {role.location}
      </p>
      {role.points.map((p) => (
        <p key={p.slice(0, 24)} className="mt-4 leading-relaxed text-ink-dim">
          {p}
        </p>
      ))}
    </motion.article>
  );
}
