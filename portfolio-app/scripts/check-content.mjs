import { readFileSync } from "node:fs";
import { projects, certifications, education, roles, stats, capabilities } from "../src/data/content.ts";
import { stones, STOPS } from "../src/data/stones.ts";
// Run by `npm run check`; assertions below are the acceptance contract. Counts
// are floors, not fixtures: appending to content.ts must never fail the gate.
const assert = (c, msg) => { if (!c) { console.error("FAIL:", msg); process.exit(1); } };
assert(projects.length >= 6, "at least 6 projects");
assert(projects.filter(p => p.tier === "featured").length === 2, "2 featured");
assert(new Set(projects.map(p => p.slug)).size === projects.length, "unique slugs");
assert(roles.length >= 3, "at least 3 roles");
assert(certifications.length >= 2, "at least 2 certifications");
assert(education.length >= 1, "at least 1 education entry");
assert(capabilities.length === 4, "4 capability clusters");
assert(stats.length >= 4, "at least 4 stats");
for (const p of projects) {
  assert(p.media.length >= 1, `${p.slug}: needs at least one media item`);
  assert(p.body.length <= 3 && p.body.length >= 1, `${p.slug}: 1-3 body paragraphs`);
}

// Six stones, six stops plus the intro. Each stone names a real project and a
// socket that lies inside the gauntlet mesh, whose bounds are read from the
// POSITION accessor's min/max (present even with Draco compression). The GLB
// is read as raw bytes: a .glb is a 12-byte header, then a JSON chunk whose
// length sits at byte 12 and whose payload starts at byte 20.
assert(stones.length === 6, "6 stones");
assert(STOPS === stones.length + 1, "STOPS is stones + intro");
assert(new Set(stones.map(s => s.socket.join(","))).size === stones.length, "unique stone sockets");
const glb = readFileSync("public/models/gauntlet.glb");
const gltf = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString("utf8"));
const posAccessor = gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION];
assert(posAccessor?.min && posAccessor?.max, "gauntlet.glb POSITION accessor has bounds");
for (const s of stones) {
  assert(projects.some(p => p.slug === s.slug), `stone ${s.id}: no project ${s.slug}`);
  s.socket.forEach((v, k) => {
    assert(v >= posAccessor.min[k] - 0.05 && v <= posAccessor.max[k] + 0.05, `stone ${s.id}: socket ${k} outside the mesh`);
  });
  assert(Math.abs(Math.hypot(...s.normal) - 1) < 0.02, `stone ${s.id}: normal is not unit length`);
  assert(s.radius > 0.02 && s.radius < 0.2, `stone ${s.id}: implausible radius`);
  assert(/^#[0-9A-Fa-f]{6}$/.test(s.hex), `stone ${s.id}: bad hex`);
}

const banned = /[—–]/;
const scan = (o, path) => {
  if (typeof o === "string") assert(!banned.test(o), `em/en-dash in ${path}: ${o}`);
  else if (Array.isArray(o)) o.forEach((v, i) => scan(v, `${path}[${i}]`));
  else if (o && typeof o === "object") Object.entries(o).forEach(([k, v]) => scan(v, `${path}.${k}`));
};
scan({ projects, certifications, education, roles, stats, capabilities, stones }, "content");
console.log("content OK");
