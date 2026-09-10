import SpotlightCard from "@/components/bits/SpotlightCard";
import { capabilities } from "@/data/content";

// One 5-column grid, spans 3/2 then 2/3, so the two rows break asymmetrically.
// Static strings so Tailwind can see the class names.
const SPANS = [
  "md:col-span-3",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-3",
];

// SpotlightCard hardcodes neutral-900 / neutral-800 / rounded-3xl ahead of our
// className, and Tailwind resolves conflicts by stylesheet order, not attribute
// order. The ! suffix is the cheap deterministic override.
const SKIN = "rounded-card! border-white/10! bg-surface-2!";

export function Capabilities() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      <h2 className="mb-10 text-4xl tracking-tighter">Capabilities</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
        {capabilities.map((cluster, i) => (
          <SpotlightCard
            key={cluster.title}
            spotlightColor="rgba(56, 189, 248, 0.14)"
            className={`${SPANS[i % SPANS.length]} ${SKIN}`}
          >
            <h3 className="text-xl tracking-tight">{cluster.title}</h3>
            <ul className="mt-5 space-y-2 leading-relaxed text-ink-dim">
              {cluster.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
