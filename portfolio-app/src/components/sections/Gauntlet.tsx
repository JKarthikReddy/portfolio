"use client";
import { BASE } from "@/lib/base";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import {
  BufferAttribute,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NoColorSpace,
  PointLight,
  Quaternion,
  RepeatWrapping,
  SphereGeometry,
  SpotLight,
  SRGBColorSpace,
  type Texture,
  Vector3,
} from "three";
import { useMotionValueEvent, type MotionValue } from "motion/react";
import { stones, STOPS } from "@/data/stones";

const MODEL = `${BASE}/models/gauntlet.glb`;

// Pose constants. Tuned by eye in the browser; keep them all here.
const GROUP_POS = new Vector3(0.7, -0.15, 0); // fist sits centre-right of the viewport
const ENTER_FROM_Y = -2.6; // intro: gauntlet rises from below
const ROT_X_START = -0.9; // knuckles tilted toward the viewer, fist low
const ROT_Y_SWEEP = 1.3; // turn across the whole section, ending with the thumb toward the viewer
const TUMBLE = 0.03; // idle wobble amplitude, radians
// Stone offset at full lift, in world space (the camera looks down -z from +z):
// -x toward the text, +z toward the viewer. Converted into the gem frame per
// frame so the pose of the fist never changes where a stone floats.
const LIFT = new Vector3(-0.55, -0.02, 0.35);
const LIFT_SCALE = 2.1;
const BOB = 0.02;
// Emissive is HDR: bloom only catches values above the threshold of 1, so the
// gold body never glows while a lifted stone does.
const EMISSIVE_DIM = 0.6;
const EMISSIVE_CLAIMED = 1.5;
const EMISSIVE_LIFT = 2.0;
const RIM_IDLE = new Color("#ffffff");
// The model is 1.77 units long along its up axis with the cuff at 0.
const MODEL_CENTRE_Y = -0.88;
// Gems are cabochons: a sphere squashed along the socket normal, dome centred a
// hair above the painted surface so the dark cap underneath stays hidden at rest.
const GEM_FLATTEN = 0.55;
const GEM_SEAT = 0.03;
// Bezel cup around each socket: lip radius and depth as fractions of the gem radius.
const CUP_RADIUS = 1.22;
const CUP_DEPTH = 0.3;
// Irregular cabochon: fraction of the radius the seeded displacement may push.
const STONE_WOBBLE = 0.12;
// Prong setting: count, lean toward the stone (radians), and residual energy in an emptied cup.
const PRONGS = 6;
const PRONG_TILT = 0.95;
const CUP_GLOW_REST = 0.15;
const CUP_GLOW_EMPTY = 1.1;
const PRONG_AXIS = new Vector3();
// Lift the cup floor off the painted surface so it covers the paint instead of z-fighting it.
const CUP_FLOOR = 0.05;
const MODEL_SCALE = 1.3;
const UP = new Vector3(0, 1, 0);
// Idle redraw rate. Scrolling invalidates immediately; between scrolls only the slow
// tumble and bob move, and 24 fps is plenty for them while costing a fraction of 60.
const IDLE_FPS = 24;

const scratchQ = new Quaternion();
const liftLocal = new Vector3();
const gemWorld = new Vector3();
// A lifted stone lights the gold around it; emissive alone never does.
const GLOW_INTENSITY = 10;
// Bump relief for the engraving, in world units.
const BUMP_SCALE = 0.004;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
/** Lift for local stop progress t: rise 0 to 0.25, hold to 0.75, return to 1. */
const liftOf = (t: number) => (t < 0.25 ? smooth(t / 0.25) : t < 0.75 ? 1 : smooth((1 - t) / 0.25));

export function Gauntlet({ progress }: { progress: MotionValue<number> }) {
  // Desktop gets dpr up to 1.5, MSAA through the composer and bloom; phones get
  // dpr 1 and the plain renderer. Safe to read window here: WebGLBoundary
  // defers this component to the client, so it never renders on the server.
  const [wide] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  return (
    <Canvas
      frameloop="demand"
      shadows="percentage"
      dpr={wide ? [1, 1.25] : 1}
      camera={{ position: [0, 0.1, 3.4], fov: 35 }}
      gl={{ antialias: !wide, alpha: true, powerPreference: "low-power" }}
      className="h-full w-full"
    >
      <Suspense fallback={null}>
        <Studio />
        <Rig progress={progress} />
      </Suspense>
      {wide && (
        <EffectComposer multisampling={2}>
          <Bloom luminanceThreshold={1} luminanceSmoothing={0.25} intensity={0.7} radius={0.5} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

/** Owned studio environment: no CDN fetch, one warm key, cool fill, bounce, rim. */
function Studio() {
  return (
    <>
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={4} color="#ffe2b8" position={[-3, 3, 3]} scale={[4, 3, 1]} target={[0, 0, 0]} />
        <Lightformer intensity={1.2} color="#a9c8ff" position={[4, 0.5, 2]} scale={[2, 4, 1]} target={[0, 0, 0]} />
        <Lightformer intensity={0.5} color="#ffd1a0" position={[0, -3, 2]} scale={[6, 2, 1]} target={[0, 0, 0]} />
        <Lightformer intensity={2} color="#ffffff" position={[1, 2, -4]} scale={[3, 3, 1]} target={[0, 0, 0]} />
      </Environment>
      <ambientLight intensity={0.15} />
      {/* Warm key, soft-shadowed so fingers and knuckles shade each other. */}
      <directionalLight
        position={[-3, 4, 4]}
        intensity={2.2}
        color="#ffe9c9"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-2.2}
        shadow-camera-right={2.2}
        shadow-camera-top={2.6}
        shadow-camera-bottom={-2.6}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
    </>
  );
}

type Placement = { rest: Vector3; orient: Quaternion; color: Color };

/**
 * A stone is never a perfect ellipsoid. Push each sphere vertex along its own
 * direction by a few seeded low-frequency waves so every gem has its own pebble
 * silhouette; duplicated seam and pole vertices share a direction, so they move
 * together and the surface stays closed.
 */
function makeStoneGeometry(radius: number, seed: number): SphereGeometry {
  const geo = new SphereGeometry(radius, 48, 32);
  const pos = geo.attributes.position as BufferAttribute;
  const v = new Vector3();
  const n = new Vector3();
  const f = [1.7, 2.9, 4.3].map((k, i) => k + ((seed * 7 + i) % 5) * 0.13);
  const ph = [0, 1, 2].map((i) => (((seed * 31 + i * 17) % 97) / 97) * Math.PI * 2);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.copy(v).normalize();
    const w =
      0.55 * Math.sin(f[0] * n.x + ph[0]) * Math.cos(f[1] * n.y + ph[1]) +
      0.35 * Math.sin(f[2] * n.z + f[0] * n.y + ph[2]) +
      0.25 * Math.cos(f[1] * n.x * n.z * 3 + ph[0]);
    v.multiplyScalar(1 + STONE_WOBBLE * w);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/**
 * The model ships one baked colour map and no roughness or relief. Derive both
 * from it once: worn high spots (bright) polish smooth, grooves and grime (dark)
 * stay matte, with grain so the response never reads as a copy of the albedo;
 * the same luminance drives a small bump so the engraving catches grazing light.
 */
function deriveMetalMaps(map: Texture): { roughnessMap: CanvasTexture; bumpMap: CanvasTexture } | null {
  const img = map.image as ImageBitmap | HTMLImageElement | undefined;
  if (!img || !img.width) return null;
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  const src = ctx.getImageData(0, 0, size, size).data;
  const rough = ctx.createImageData(size, size);
  const bump = ctx.createImageData(size, size);
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < src.length; i += 4) {
    const lum = (0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]) / 255;
    const r = Math.min(1, Math.max(0, 0.75 - lum * 0.55 + (rnd() - 0.5) * 0.12)) * 255;
    rough.data[i] = rough.data[i + 1] = rough.data[i + 2] = r;
    rough.data[i + 3] = 255;
    const b = lum * 255;
    bump.data[i] = bump.data[i + 1] = bump.data[i + 2] = b;
    bump.data[i + 3] = 255;
  }
  const make = (data: ImageData) => {
    const cc = document.createElement("canvas");
    cc.width = cc.height = size;
    cc.getContext("2d")!.putImageData(data, 0, 0);
    const t = new CanvasTexture(cc);
    t.colorSpace = NoColorSpace;
    t.flipY = map.flipY; // glTF textures are not flipped; match the colour map's UV convention
    t.wrapS = map.wrapS;
    t.wrapT = map.wrapT;
    t.anisotropy = map.anisotropy;
    return t;
  };
  return { roughnessMap: make(rough), bumpMap: make(bump) };
}

/**
 * Grayscale stone interior shared by all six gems: a core that glows toward the
 * dome's pole (uv.y = 1, the canvas top) and darkens at the rim, with cloudy
 * inclusions and hairline veins. Multiplies both the colour and the emissive,
 * so a lifted stone reads as lit from within rather than as a flat disc.
 */
function makeGemTexture(): CanvasTexture {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const core = ctx.createLinearGradient(0, 0, 0, size);
  core.addColorStop(0, "#f2f2f2");
  core.addColorStop(0.4, "#9c9c9c");
  core.addColorStop(0.8, "#383838");
  core.addColorStop(1, "#101010");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 10 + rnd() * 80;
    const blob = ctx.createRadialGradient(x, y, 0, x, y, r);
    blob.addColorStop(0, rnd() < 0.55 ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.7)");
    blob.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = blob;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 36; i++) {
    ctx.strokeStyle = rnd() < 0.5 ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.moveTo(rnd() * size, rnd() * size);
    ctx.bezierCurveTo(rnd() * size, rnd() * size, rnd() * size, rnd() * size, rnd() * size, rnd() * size);
    ctx.stroke();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function Rig({ progress }: { progress: MotionValue<number> }) {
  const { scene } = useGLTF(MODEL);
  const group = useRef<Group>(null);
  const gemRoot = useRef<Group>(null);
  const rim = useRef<SpotLight>(null);
  const glow = useRef<PointLight>(null);
  const gems = useRef<(Mesh | null)[]>([]);
  const rimColor = useMemo(() => new Color(), []);
  const gemMap = useMemo(makeGemTexture, []);
  const stoneGeometries = useMemo(() => stones.map((s, i) => makeStoneGeometry(s.radius, i + 1)), []);
  const cupMaterials = useRef<(MeshStandardMaterial | null)[]>([]);
  // Prong placement around the collar, leaning inward over the stone.
  const prongs = useMemo(
    () =>
      Array.from({ length: PRONGS }, (_, k) => {
        const a = (k / PRONGS) * Math.PI * 2 + 0.35;
        const q = new Quaternion().setFromAxisAngle(PRONG_AXIS.set(-Math.sin(a), 0, Math.cos(a)).normalize(), -PRONG_TILT);
        return { x: Math.cos(a), z: Math.sin(a), q };
      }),
    [],
  );
  useEffect(() => () => stoneGeometries.forEach((g) => g.dispose()), [stoneGeometries]);

  // Demand rendering: a scroll change redraws at once, the idle sway ticks at
  // IDLE_FPS, and only while the canvas is actually on screen. The boundary keeps
  // the canvas mounted well past the section so scrolling back never rebuilds it.
  const invalidate = useThree((state) => state.invalidate);
  const canvas = useThree((state) => state.gl.domElement);
  useMotionValueEvent(progress, "change", () => invalidate());
  useEffect(() => {
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);
    const id = window.setInterval(() => {
      if (visible) invalidate();
    }, 1000 / IDLE_FPS);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [canvas, invalidate]);

  // Give the baked paint a real metal response: derived roughness and bump maps
  // (once; the cached scene keeps them across remounts), and shadows both ways.
  useMemo(() => {
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      const mat = m.material as MeshStandardMaterial;
      mat.metalness = 0.9;
      mat.envMapIntensity = 1;
      if (!mat.roughnessMap && mat.map) {
        const maps = deriveMetalMaps(mat.map);
        if (maps) {
          mat.roughnessMap = maps.roughnessMap;
          mat.roughness = 1; // the map carries the value
          mat.bumpMap = maps.bumpMap;
          mat.bumpScale = BUMP_SCALE;
          mat.needsUpdate = true;
        } else {
          mat.roughness = 0.5;
        }
      }
    });
  }, [scene]);

  // Gem rest positions sit proud of the painted socket along its normal; the
  // dark cap underneath reads as the empty socket once the gem lifts.
  const placements = useMemo<Placement[]>(
    () =>
      stones.map((s) => {
        const n = new Vector3(...s.normal).normalize();
        return {
          rest: new Vector3(...s.socket).addScaledVector(n, s.radius * GEM_SEAT),
          orient: new Quaternion().setFromUnitVectors(UP, n),
          color: new Color(s.hex),
        };
      }),
    [],
  );

  useFrame(({ clock }) => {
    const g = group.current;
    const root = gemRoot.current;
    if (!g || !root) return;
    const p = progress.get();
    const stop = 1 / STOPS;
    const time = clock.elapsedTime;

    // Gauntlet pose: rise in during the intro, tilt up over the first half, sweep, tumble.
    g.position.set(
      GROUP_POS.x,
      ENTER_FROM_Y + (GROUP_POS.y - ENTER_FROM_Y) * smooth(p / stop),
      GROUP_POS.z,
    );
    g.rotation.x = ROT_X_START * (1 - smooth(p / 0.5)) + Math.sin(time * 0.4) * TUMBLE;
    // Negative: the fist turns clockwise (seen from the front) as the visitor scrolls down.
    g.rotation.y = -ROT_Y_SWEEP * p + Math.cos(time * 0.3) * TUMBLE;

    // World-space LIFT expressed in the gem frame (the model's local axes).
    root.getWorldQuaternion(scratchQ).invert();
    liftLocal.copy(LIFT).applyQuaternion(scratchQ);

    let active = -1;
    let activeLift = 0;
    placements.forEach(({ rest }, i) => {
      const mesh = gems.current[i];
      if (!mesh) return;
      const start = (i + 1) * stop;
      const inStop = p > start && p < start + stop;
      const lift = inStop ? liftOf((p - start) / stop) : 0;
      const claimed = p >= start + stop;

      mesh.position.copy(rest).addScaledVector(liftLocal, lift);
      mesh.position.z -= Math.sin(time * 2 + i) * BOB * lift; // hold bob; local -z is world up
      const k = 1 + (LIFT_SCALE - 1) * lift;
      mesh.scale.set(k, k * GEM_FLATTEN, k);
      const base = claimed ? EMISSIVE_CLAIMED : EMISSIVE_DIM;
      (mesh.material as MeshPhysicalMaterial).emissiveIntensity = base + (EMISSIVE_LIFT - base) * lift;
      const cup = cupMaterials.current[i];
      if (cup) cup.emissiveIntensity = CUP_GLOW_REST + (CUP_GLOW_EMPTY - CUP_GLOW_REST) * lift;

      if (lift > activeLift) {
        activeLift = lift;
        active = i;
      }
    });

    if (rim.current) {
      rimColor.copy(RIM_IDLE);
      if (active >= 0) rimColor.lerp(placements[active].color, activeLift);
      rim.current.color.copy(rimColor);
    }
    if (glow.current) {
      const gem = active >= 0 ? gems.current[active] : null;
      if (gem) {
        gem.getWorldPosition(gemWorld);
        glow.current.position.copy(gemWorld);
        glow.current.color.copy(placements[active].color);
        glow.current.intensity = GLOW_INTENSITY * activeLift;
      } else {
        glow.current.intensity = 0;
      }
    }
  });

  return (
    <>
      <spotLight ref={rim} position={[-2.5, 2, 2.5]} intensity={60} angle={0.6} penumbra={0.8} decay={1.5} />
      <pointLight ref={glow} intensity={0} distance={2.5} decay={2} />
      <group ref={group} scale={MODEL_SCALE}>
        <group position={[0, MODEL_CENTRE_Y, 0]}>
          <primitive object={scene} />
          {/* Same +90deg X rotation as the model's root node, so socket coordinates apply as-is. */}
          <group ref={gemRoot} rotation={[Math.PI / 2, 0, 0]}>
            {stones.map((s, i) => (
              <group key={s.id}>
                {/* Bezel cup: a shallow metal dish above the paint with a lip, so the socket
                    has shading and depth once the gem leaves, plus a faint residual glow. */}
                <group position={s.socket} quaternion={placements[i].orient}>
                  <mesh
                    receiveShadow
                    position={[0, s.radius * (CUP_DEPTH + CUP_FLOOR), 0]}
                    scale={[s.radius * CUP_RADIUS, -s.radius * CUP_DEPTH, s.radius * CUP_RADIUS]}
                  >
                    <sphereGeometry args={[1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                    <meshStandardMaterial
                      ref={(m) => {
                        cupMaterials.current[i] = m;
                      }}
                      color="#1a1006"
                      metalness={0.2}
                      roughness={0.85}
                      emissive={s.hex}
                      emissiveIntensity={CUP_GLOW_REST}
                      envMapIntensity={0.4}
                      side={DoubleSide}
                    />
                  </mesh>
                  {/* Seated collar: a flattened ring resting on the paint, not at rim height. */}
                  <mesh
                    receiveShadow
                    position={[0, s.radius * 0.08, 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[s.radius * CUP_RADIUS, s.radius * CUP_RADIUS, s.radius * CUP_RADIUS * 0.45]}
                  >
                    <torusGeometry args={[1, 0.14, 12, 48]} />
                    <meshStandardMaterial color="#6b4a1c" metalness={1} roughness={0.38} envMapIntensity={1.2} />
                  </mesh>
                  {/* Inner rim at the cup mouth, brighter and thinner than the collar. */}
                  <mesh
                    position={[0, s.radius * (CUP_DEPTH + CUP_FLOOR), 0]}
                    rotation={[Math.PI / 2, 0, 0]}
                    scale={[s.radius * CUP_RADIUS * 0.98, s.radius * CUP_RADIUS * 0.98, s.radius * CUP_RADIUS * 0.5]}
                  >
                    <torusGeometry args={[1, 0.06, 10, 48]} />
                    <meshStandardMaterial color="#c9a04a" metalness={1} roughness={0.25} envMapIntensity={1.4} />
                  </mesh>
                  {/* Six tapered prongs leaning over the stone, the setting that holds it. */}
                  {prongs.map((pr, k) => (
                    <mesh
                      key={k}
                      castShadow
                      position={[pr.x * s.radius * CUP_RADIUS * 0.8, s.radius * 0.36, pr.z * s.radius * CUP_RADIUS * 0.8]}
                      quaternion={pr.q}
                    >
                      <coneGeometry args={[s.radius * 0.2, s.radius * 0.55, 8]} />
                      <meshStandardMaterial color="#b8903e" metalness={1} roughness={0.3} envMapIntensity={1.3} />
                    </mesh>
                  ))}
                </group>
                <mesh
                  ref={(el) => {
                    gems.current[i] = el;
                  }}
                  castShadow
                  position={placements[i].rest}
                  quaternion={placements[i].orient}
                  scale={[1, GEM_FLATTEN, 1]}
                  geometry={stoneGeometries[i]}
                >
                  <meshPhysicalMaterial
                    map={gemMap}
                    emissiveMap={gemMap}
                    color={s.hex}
                    emissive={s.hex}
                    emissiveIntensity={EMISSIVE_DIM}
                    roughness={0.08}
                    metalness={0}
                    clearcoat={0.8}
                    clearcoatRoughness={0.06}
                    ior={2.0}
                    specularIntensity={0.8}
                    envMapIntensity={1.0}
                  />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>
    </>
  );
}

useGLTF.preload(MODEL);
