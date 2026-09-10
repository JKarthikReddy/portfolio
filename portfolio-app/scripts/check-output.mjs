// Mechanical spec-lock gate over the static export, plus the section sources
// where a source check is the honest one. Runs after `next build` via the
// `postbuild` script. Node >= 22.18 strips the .ts import natively, so this
// needs no loader and pulls nothing from the network on the build path.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { projects, certifications, roles, education } from "../src/data/content.ts";
import { stones } from "../src/data/stones.ts";

const html = readFileSync("out/index.html", "utf8");

// Next inlines its RSC payload in <script> and the vendored bits inject <style>
// blocks. Neither is rendered copy, so the taste checks below run on markup with
// both stripped, or they trip over minified vendor strings and class literals.
const markup = html
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<style[\s\S]*?<\/style>/g, "");

let failures = 0;
const assert = (ok, msg) => {
  if (!ok) {
    console.error("FAIL:", msg);
    failures++;
  }
};

// Every data array reaches the page. A dropped or broken section fails here, and
// appending to content.ts extends the check for free.
//
// These MUST test `markup`, not `html`: the RSC flight payload in <script> carries
// the content strings too (today every certification name, every school and one
// role org appear there), so asserting against the raw html would keep passing
// after the section that renders them was deleted.
// The Work section shows the six stone projects; Green Basket stays in
// content.ts (and the reduced-motion grid) but is not in the static markup.
const shown = new Set(stones.map((s) => s.slug));
for (const p of projects.filter((p) => shown.has(p.slug))) {
  assert(markup.includes(p.title), `project missing: ${p.title}`);
}
assert(markup.includes("Six stones. Six proofs of work."), "stones intro headline missing");
assert(markup.includes("gothic404"), "gauntlet CC-BY credit missing from footer");
for (const c of certifications) assert(markup.includes(c.name), `certification missing: ${c.name}`);
for (const r of roles) assert(markup.includes(r.org), `role missing: ${r.org}`);
for (const e of education) assert(markup.includes(e.school), `education missing: ${e.school}`);

assert(!/[—–]/.test(markup), "em/en-dash in rendered copy");

// Spec lock: no section is viewport-height. Out-of-flow overlays (the mobile
// menu panel, the noise canvas) legitimately fill the viewport, so only in-flow
// uses fail. `absolute` has to stay in the exemption alongside `fixed`: the noise
// canvas is `absolute h-screen` inside a `fixed inset-0` parent, and out-of-flow
// is the property this lock actually cares about — an absolutely positioned
// element cannot be the viewport-height section the rule is aimed at.
const inFlowScreen = [...markup.matchAll(/class="([^"]*\bh-screen\b[^"]*)"/g)]
  .map((m) => m[1])
  .filter((cls) => !/\b(fixed|absolute)\b/.test(cls));
assert(inFlowScreen.length === 0, `h-screen on in-flow element: ${inFlowScreen.join(" | ")}`);

// Spec lock: no eyebrows (an uppercase + letter-spaced kicker above a heading).
//
// Checked at source rather than in the output on purpose. The only uppercase +
// tracking pairs the build emits belong to PillNav's vendored nav pills, so an
// output scan counts those and never sees an eyebrow actually added to a section
// — it passes no matter what. Scanning src/components/sections and src/app keeps
// the vendored bits out of the count, and matching whole string literals (not
// just class="" attributes) catches the class consts these files also use.
// Stones.tsx is the one approved exception (spec 2026-09-06): its mono stone
// label and wide-tracked uppercase title reproduce the reference design.
const sectionSources = ["src/components/sections", "src/app"].flatMap((dir) =>
  readdirSync(dir)
    .filter((f) => f.endsWith(".tsx") && f !== "Stones.tsx")
    .map((f) => join(dir, f)),
);
const STRING_LITERAL = /"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g;
const eyebrows = sectionSources.flatMap((file) =>
  [...readFileSync(file, "utf8").matchAll(STRING_LITERAL)]
    .map((m) => m[1] ?? m[2] ?? m[3])
    .filter((s) => s.includes("uppercase") && s.includes("tracking-"))
    .map((s) => `${file}: ${s.slice(0, 60)}`),
);
assert(eyebrows.length === 0, `eyebrow in section source: ${eyebrows.join(" | ")}`);

assert(
  (markup.match(/aria-label="Technologies"/g) || []).length === 1,
  "expected exactly one marquee",
);

// Spec lock: no purple anywhere in the emitted CSS. Hex hues 250-330 and oklch
// hues 270-340 are the purple band; near-greys are skipped because hue is noise
// at low chroma. A stray Tailwind palette utility is the likeliest way purple
// sneaks in, and those emit oklch.
//
// Never write a literal utility class name in this file: Tailwind's source
// scanner reads scripts/ too and will generate the very colour we check for.
const cssDir = "out/_next/static";
const css = readdirSync(cssDir, { recursive: true })
  .filter((f) => String(f).endsWith(".css"))
  .map((f) => readFileSync(join(cssDir, String(f)), "utf8"))
  .concat(html.match(/<style[\s\S]*?<\/style>/g) || [])
  .join("");

const isPurpleHex = (hex) => {
  const raw = hex.slice(1);
  const h = raw.length === 3 ? [...raw].map((c) => c + c).join("") : raw.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (!(d / max >= 0.15)) return false; // grey (or black): hue carries no intent
  const deg =
    60 * (max === r ? (((g - b) / d) % 6) + 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4);
  return deg % 360 >= 250 && deg % 360 <= 330;
};
const purple = [
  ...new Set(
    [...css.matchAll(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map((m) => m[0]),
  ),
].filter(isPurpleHex);
const purpleOklch = [...css.matchAll(/oklch\(\s*[\d.%]+\s+([\d.]+)\s+([\d.]+)/g)]
  .filter((m) => Number(m[1]) > 0.03 && Number(m[2]) >= 270 && Number(m[2]) <= 340)
  .map((m) => m[0]);
assert(
  purple.length + purpleOklch.length === 0,
  `purple in emitted CSS: ${[...purple, ...purpleOklch].join(" ")}`,
);

if (failures) process.exit(1);
console.log("output OK");
