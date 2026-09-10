import DecryptedText from "@/components/bits/DecryptedText";
import AnimatedContent from "@/components/bits/AnimatedContent";
import { roles } from "@/data/content";

// Terminal MOTIF, not a terminal: mono type, azure index markers, a rule.
// No chrome dots, no fake prompt, no version footer.
//
// The point list uses AnimatedContent, not an animated-list widget: those are
// selectable list controls (fixed-width scroller, cursor-pointer rows) whose
// arrow-navigation effect preventDefaults window-level Tab, which would break
// keyboard nav for the whole page. AnimatedContent gives the staggered reveal
// without any of that.
const handshake = roles.find((r) => r.org === "Handshake AI");

export function Benchmarks() {
  if (!handshake) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <div className="rounded-card border border-white/10 bg-surface-2 p-8 md:p-12">
        <h2 className="font-mono text-3xl leading-tight tracking-tighter text-ink md:text-4xl">
          <DecryptedText
            text="Benchmarks for frontier coding agents"
            animateOn="view"
            sequential
            speed={26}
            useOriginalCharsOnly
            className="text-ink"
            encryptedClassName="text-accent/60"
          />
        </h2>

        <p className="mt-4 font-mono text-xs text-ink-dim md:text-sm">
          {handshake.org} / {handshake.title} / {handshake.period}
        </p>

        <hr className="mt-8 border-0 border-t border-white/10" />

        {/* Divs, not <ol>/<li>: AnimatedContent renders its own wrapper div,
            which is not valid inside a list. */}
        <div className="mt-8 space-y-6">
          {handshake.points.map((point, i) => (
            <AnimatedContent
              key={point}
              className="grid grid-cols-[2.5rem_1fr] items-baseline gap-2"
              distance={16}
              duration={0.5}
              threshold={0.15}
              delay={i * 0.08}
            >
              <span className="font-mono text-sm text-accent" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-sm leading-relaxed text-ink-dim md:text-base">
                {point}
              </span>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}
