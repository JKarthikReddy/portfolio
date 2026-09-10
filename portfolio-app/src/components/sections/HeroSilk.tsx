"use client";

import dynamic from "next/dynamic";
import WebGLBoundary from "@/components/bits/WebGLBoundary";

// Silk renders a WebGL canvas (react-three-fiber); must not run during SSR
// or the static export build.
const Silk = dynamic(() => import("@/components/bits/Silk"), { ssr: false });

export function HeroSilk() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 opacity-40"
    >
      <WebGLBoundary>
        <Silk color="#38bdf8" speed={1.2} scale={1} noiseIntensity={1} rotation={0} />
      </WebGLBoundary>
    </div>
  );
}
