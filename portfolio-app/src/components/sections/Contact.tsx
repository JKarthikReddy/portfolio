"use client";

import dynamic from "next/dynamic";
import { GithubLogo, LinkedinLogo, EnvelopeSimple, FileArrowDown } from "@phosphor-icons/react";
import GlassIcons from "@/components/bits/GlassIcons";
import SpecularButton from "@/components/bits/SpecularButton";
import WebGLBoundary from "@/components/bits/WebGLBoundary";
import { Portrait } from "./Portrait";
import { profile } from "@/data/content";

// Beams is a WebGL (three/fiber) canvas: no SSR, no static-export prerender.
// The section is a client component anyway because the Phosphor icon package
// builds on createContext.
const Beams = dynamic(() => import("@/components/bits/Beams"), { ssr: false });

const LINKS = [
  { icon: <GithubLogo weight="bold" />, color: "#3f3f46", label: "GitHub", href: profile.github, newTab: true },
  { icon: <LinkedinLogo weight="bold" />, color: "#3f3f46", label: "LinkedIn", href: profile.linkedin, newTab: true },
  { icon: <EnvelopeSimple weight="bold" />, color: "#38bdf8", label: "Email", href: `mailto:${profile.email}` },
  { icon: <FileArrowDown weight="bold" />, color: "#38bdf8", label: "Resume", href: profile.resumePath, download: true },
];

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden px-4 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-25">
        <WebGLBoundary defer placeholderClassName="h-full w-full">
          <Beams
            beamNumber={8}
            beamWidth={2.4}
            beamHeight={18}
            lightColor="#38bdf8"
            speed={0.9}
            noiseIntensity={0.9}
            scale={0.18}
            rotation={28}
          />
        </WebGLBoundary>
      </div>

      {/* The portrait track needs a real size, not auto: Portrait is w-full and
          its content (a glyph, or ElasticMesh's zero-intrinsic-width canvas)
          cannot size a max-content track. */}
      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-[minmax(0,24rem)_1fr] md:gap-16">
        <Portrait />

        <div>
          <p className="flex flex-wrap items-baseline gap-x-3 text-ink">
            {profile.name}
            <span className="text-sm text-ink-dim">He/Him</span>
          </p>

          <h2 className="mt-3 text-4xl tracking-tighter">Get in touch</h2>

          <p className="mt-4 max-w-md leading-relaxed text-ink-dim">
            {profile.role} Based in {profile.location}.
          </p>

          <div className="pt-8">
            {/* Same pattern as the Hero CTA: SpecularButton renders a <button>,
                so the anchor carries the href and the label while the inner
                button is aria-hidden and untabbable. */}
            <a
              href={`mailto:${profile.email}`}
              aria-label="Get in touch"
              className="inline-flex"
            >
              <WebGLBoundary
                fallback={
                  <span className="inline-flex items-center rounded-full border border-accent px-6 py-3 text-ink">
                    Get in touch
                  </span>
                }
              >
                <SpecularButton
                  size="lg"
                  textColor="#fafafa"
                  tint="#38bdf8"
                  tintOpacity={0.1}
                  lineColor="#38bdf8"
                  autoAnimate
                  tabIndex={-1}
                  ariaHidden
                >
                  Get in touch
                </SpecularButton>
              </WebGLBoundary>
            </a>
          </div>

          <GlassIcons
            items={LINKS}
            className="grid-cols-4! md:grid-cols-4! gap-6! py-8! mx-0! w-fit! text-sm!"
          />
        </div>
      </div>
    </section>
  );
}
