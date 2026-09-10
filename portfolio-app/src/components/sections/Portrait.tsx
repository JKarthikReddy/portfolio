"use client";
import { BASE } from "@/lib/base";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import WebGLBoundary from "@/components/bits/WebGLBoundary";
import { profile } from "@/data/content";

// ElasticMesh is a WebGL (ogl) canvas; it must not run during SSR or the
// static export build.
const ElasticMesh = dynamic(() => import("@/components/bits/ElasticMesh"), { ssr: false });

const SRC = `${BASE}/media/portrait.webp`;

// Stands in for the mesh both before the image loads and if WebGL is unavailable.
const MONOGRAM = (
  <div
    aria-hidden="true"
    className="flex h-full w-full items-center justify-center text-7xl tracking-tighter text-ink-dim md:text-8xl"
  >
    KR
  </div>
);

/**
 * The portrait file may not exist yet. fs checks are not available client side,
 * so probe the URL and only mount the mesh once the image actually decodes.
 * Until then (and forever, if it 404s) the monogram tile stands in, which also
 * means the monogram is what the exported HTML ships: no broken-image flash.
 */
export function Portrait() {
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHasImage(true);
    img.onerror = () => setHasImage(false);
    img.src = SRC;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  return (
    <div
      role="img"
      // The fallback is a monogram, not a photo: announcing it as a portrait
      // would claim content that is not there until portrait.webp ships.
      aria-label={hasImage ? `Portrait of ${profile.name}` : "KR monogram"}
      className="aspect-square w-full max-w-sm overflow-hidden rounded-card border border-white/10 bg-surface-2"
    >
      {hasImage ? (
        <WebGLBoundary defer fallback={MONOGRAM} placeholderClassName="h-full w-full">
          <ElasticMesh
            image={SRC}
            borderRadius={20}
            showGrid={false}
            highlight="#38bdf8"
            shading={0.45}
            tilt={10}
          />
        </WebGLBoundary>
      ) : (
        MONOGRAM
      )}
    </div>
  );
}
