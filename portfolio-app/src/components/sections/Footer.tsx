import ShinyText from "@/components/bits/ShinyText";
import { profile } from "@/data/content";

const link = "underline underline-offset-2 hover:text-ink";

export function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 py-10 text-sm text-ink-dim">
      <ShinyText text={profile.name} speed={3} color="#a1a1aa" shineColor="#38bdf8" />
      <p className="mt-1">{profile.role}</p>
      <p className="mt-4 text-xs">
        Gauntlet model:{" "}
        <a href="https://sketchfab.com/3d-models/manopla-infinito-3d-model-6b5999434cfa497a98b17cae569f56ad" className={link}>
          Manopla Infinito
        </a>{" "}
        by{" "}
        <a href="https://sketchfab.com/gothic404" className={link}>
          gothic404
        </a>
        ,{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" className={link}>
          CC BY 4.0
        </a>
        .
      </p>
    </footer>
  );
}
