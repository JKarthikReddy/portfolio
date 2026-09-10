"use client";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { projects } from "@/data/content";
import { WorkCell } from "./WorkCell";
import { ProjectSheet } from "./ProjectSheet";

export function Work() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  return (
    <section id="work" className="mx-auto max-w-7xl overflow-x-clip px-4 py-24">
      <h2 className="mb-10 text-4xl tracking-tighter">Selected work</h2>
      <div className="grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-6 md:auto-rows-[minmax(180px,auto)]">
        {projects.map(p => (
          <WorkCell key={p.slug} project={p} onOpen={setOpenSlug} />
        ))}
      </div>
      <AnimatePresence>
        {openSlug && (
          <ProjectSheet
            project={projects.find(p => p.slug === openSlug)!}
            onClose={() => setOpenSlug(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
