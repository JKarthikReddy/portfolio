"use client";
import { BASE } from "@/lib/base";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { stones, STOPS, type Stone } from "@/data/stones";
import { span01 } from "@/lib/motion";

/**
 * One dimmed backdrop per stone, crossfading with scroll. Every layer always
 * carries a radial gradient in the stone colour; the <video> sits on top of it
 * and only exists at `md` and up, so phones get the gradient (and no decode
 * cost). A clip that fails to load falls back to the gradient via onError. Only
 * the active clip and its successor play; the rest are paused.
 */
export function StoneVideo({ progress }: { progress: MotionValue<number> }) {
  // -2 means the section is off-screen (p at 0 or 1): nothing plays or preloads.
  const [active, setActive] = useState(-2);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Stone i owns stop i + 1, so the intro (stop 0) maps to -1: only the first
  // clip warms up. scrollYProgress clamps to exactly 0 and 1 outside the track.
  useMotionValueEvent(progress, "change", (p) => {
    const i = p <= 0 || p >= 1 ? -2 : Math.min(stones.length - 1, Math.floor(p * STOPS) - 1);
    setActive((a) => (a === i ? a : i));
  });

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {stones.map((stone, i) => (
        <Layer
          key={stone.id}
          stone={stone}
          index={i}
          progress={progress}
          showVideo={wide}
          playing={wide && (i === active || i === active + 1)}
        />
      ))}
    </div>
  );
}

function Layer({
  stone,
  index,
  progress,
  showVideo,
  playing,
}: {
  stone: Stone;
  index: number;
  progress: MotionValue<number>;
  showVideo: boolean;
  playing: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [broken, setBroken] = useState(false);

  // Fade in over the last 40% of the previous stop, hold through this stop,
  // fade out over the first 40% of the next one.
  const start = (index + 1) / STOPS;
  const end = (index + 2) / STOPS;
  const fade = 0.4 / STOPS;
  // The last stone holds to the end; WAAPI rejects offsets above 1.
  const last = end + fade > 1;
  const opacity = useTransform(
    progress,
    ...span01(
      last ? [start - fade, start, 1] : [start - fade, start, end, end + fade],
      last ? [0, 1, 1] : [0, 1, 1, 0],
    ),
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 62% 50%, ${stone.hex}40 0%, transparent 62%)` }}
      />
      {showVideo && !broken && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={`${BASE}/media/stones/${stone.id}.jpg`}
          src={`${BASE}/media/stones/${stone.id}.mp4`}
          onError={() => setBroken(true)}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
      )}
    </motion.div>
  );
}
