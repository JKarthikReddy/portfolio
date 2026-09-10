"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import ScrollVelocity from "@/components/bits/ScrollVelocity";
import { skills } from "@/data/content";

const ROW = skills.join(" · ");
const TYPE =
  "font-sans text-4xl font-bold tracking-[-0.02em] text-accent/20 md:text-[5rem] md:leading-[5rem]";

/**
 * The only marquee on the page. The strip is decorative, so it is hidden from
 * assistive tech and the same list is exposed as plain text below it. Under
 * reduced motion the ScrollVelocity subtree is not mounted at all, which stops
 * its requestAnimationFrame loop rather than just zeroing the speed. The same
 * unmount trick drives the offscreen case: the strip only exists while the
 * section is near the viewport, so its rAF loop is not billed for the whole
 * visit.
 */
export function TechMarquee() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "200px 0px" });

  return (
    <section ref={ref} aria-label="Technologies" className="overflow-hidden py-12">
      <div aria-hidden="true">
        {reduced || !inView ? (
          <p className={`${TYPE} whitespace-nowrap`}>{ROW}</p>
        ) : (
          <ScrollVelocity
            // Trailing separator, so the copies join as "... Git · Python ..."
            // instead of gluing the loop seam. The reduced-motion <p> keeps the
            // bare ROW so it does not end on a dangling dot.
            texts={[`${ROW} · `]}
            velocity={40}
            numCopies={3}
            // axe: color-contrast - decorative strip, sr-only equivalent below.
            className="text-accent/20"
            // Vendored component interpolates these straight into a template
            // string, so leaving them unset ships a literal "undefined" class.
            parallaxClassName=""
            scrollerClassName=""
          />
        )}
      </div>
      <ul className="sr-only">
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}
