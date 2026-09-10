import AnimatedContent from "@/components/bits/AnimatedContent";
import { education, certifications } from "@/data/content";

// Quiet section: fade only, no travel, no eyebrows. Both blocks are pure
// data maps, so adding a school or a cert means appending to the array.
export function Education() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <h2 className="mb-10 text-4xl tracking-tighter">Education</h2>

      <AnimatedContent distance={0} duration={0.6} threshold={0.15}>
        <dl className="divide-y divide-white/10 border-y border-white/10">
          {/* One <div> per entry is the only wrapper <dl> allows; the columns
              come from explicit grid placement rather than a second nested div. */}
          {education.map((e) => (
            <div
              key={e.school}
              className="grid grid-cols-1 gap-y-1 py-6 md:grid-cols-[1fr_auto] md:items-baseline md:gap-x-8"
            >
              <dt className="text-xl tracking-tight text-ink md:col-start-1 md:row-start-1">
                {e.school}
              </dt>
              <dd className="text-ink-dim md:col-start-1 md:row-start-2">{e.degree}</dd>
              <dd className="font-mono text-sm text-ink-dim md:col-start-2 md:row-start-1 md:text-right">
                {e.period} / {e.note}
              </dd>
            </div>
          ))}
        </dl>
      </AnimatedContent>

      <AnimatedContent distance={0} duration={0.6} threshold={0.15} delay={0.1}>
        <h3 className="mt-16 mb-6 text-xl tracking-tight text-ink">Certifications</h3>
        <dl className="divide-y divide-white/10 border-y border-white/10">
          {certifications.map((c) => (
            <div
              key={c.name}
              className="grid grid-cols-1 gap-y-1 py-5 md:grid-cols-[1fr_auto] md:items-baseline md:gap-x-8"
            >
              <dt className="text-ink md:col-start-1 md:row-start-1">{c.name}</dt>
              <dd className="text-sm text-ink-dim md:col-start-1 md:row-start-2">{c.issuer}</dd>
              <dd className="font-mono text-sm text-ink-dim md:col-start-2 md:row-start-1 md:text-right">
                {c.date}
              </dd>
            </div>
          ))}
        </dl>
      </AnimatedContent>
    </section>
  );
}
