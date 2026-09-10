import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { Metrics } from "@/components/sections/Metrics";
import { Stones } from "@/components/sections/Stones";
import { Journey } from "@/components/sections/Journey";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { Capabilities } from "@/components/sections/Capabilities";
import { Benchmarks } from "@/components/sections/Benchmarks";
import { Education } from "@/components/sections/Education";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Z } from "@/lib/z";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Metrics />
        <Stones />
        <Journey />
        {/* The tail rides over the Experience handover as one rounded page. */}
        <div className="relative rounded-t-[28px] bg-surface shadow-[0_-30px_80px_rgba(0,0,0,0.55)]" style={{ zIndex: Z.tail }}>
          <TechMarquee />
          <Capabilities />
          <Benchmarks />
          <Education />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
