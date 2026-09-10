"use client";

import Image from "next/image";
import BorderGlow from "@/components/bits/BorderGlow";
import HalftoneReveal from "@/components/bits/HalftoneReveal";
import WebGLBoundary from "@/components/bits/WebGLBoundary";
import TiltedCard from "@/components/bits/TiltedCard";
import type { Project } from "@/data/content";

export function WorkCell({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (slug: string) => void;
}) {
  const media = project.media[0];
  const isFeatured = project.tier === "featured";

  return (
    <button
      type="button"
      onClick={() => onOpen(project.slug)}
      aria-haspopup="dialog"
      className={`text-left transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded-card ${
        isFeatured ? "md:col-span-3 md:row-span-2" : "md:col-span-2"
      }`}
    >
      <BorderGlow
        borderRadius={20}
        glowColor="198 93 60"
        glowIntensity={0.4}
        backgroundColor="#131316"
        className="h-full w-full p-5"
      >
        <div className="flex h-full flex-col gap-4">
          {isFeatured ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px]">
              <Image
                src={media.src}
                alt={media.alt}
                width={800}
                height={600}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Decorative overlay on top of the real <Image> above it, so a
                  dead WebGL context just leaves the plain photo showing. Skipped
                  for gifs: the overlay is opaque and halftones only the first
                  frame, which would hide the animation (the better content). */}
              {media.kind !== "gif" && (
                <WebGLBoundary defer placeholderClassName="absolute inset-0">
                  <HalftoneReveal
                    src={media.src}
                    borderRadius="16px"
                    className="absolute inset-0"
                  />
                </WebGLBoundary>
              )}
            </div>
          ) : (
            <TiltedCard
              imageSrc={media.src}
              altText={media.alt}
              containerHeight="180px"
              containerWidth="100%"
              imageHeight="180px"
              imageWidth="100%"
              rotateAmplitude={6}
              showMobileWarning={false}
              showTooltip={false}
            />
          )}
          <div className="flex flex-1 flex-col gap-2">
            <h3 className="text-xl tracking-tight text-ink">{project.title}</h3>
            <p className="text-sm text-ink-dim">{project.tagline}</p>
            <p className="mt-auto text-xs text-ink-dim">{project.tags.join(", ")}</p>
          </div>
        </div>
      </BorderGlow>
    </button>
  );
}
