import { stats } from "@/data/content";
import { StatValue } from "./StatValue";

// Grid column count is hardcoded to the current 5-stat data set; revisit if
// stats.length ever changes (Tailwind needs a static class name to compile it).
export function Metrics() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <dl className="grid grid-cols-2 gap-8 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-sm text-ink-dim">{s.label}</dt>
            <dd className="font-mono text-3xl text-ink">
              <StatValue value={s.value} decimals={s.decimals} suffix={s.suffix} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
