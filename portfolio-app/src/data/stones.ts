export type StoneId = "mind" | "soul" | "reality" | "space" | "power" | "time";

export interface Stone {
  id: StoneId;
  name: string;
  /** Display colour. Reaches the page only through inline styles. */
  hex: string;
  /**
   * Socket centre in the gauntlet mesh's local frame (metres; the model is
   * 1.77 long along -z, back of hand is +y, thumb is +x). Sampled from the
   * vertices whose texture colour matches the painted stone.
   */
  socket: [number, number, number];
  /** Outward surface normal at the socket, same frame. */
  normal: [number, number, number];
  /** Gem radius in the same units. */
  radius: number;
  slug: string;
}

/** Canonical order from the reference recording. */
export const stones: Stone[] = [
  { id: "mind", name: "Mind", hex: "#FFD700", socket: [-0.022, 0.271, -1.112], normal: [-0.007, 0.999, -0.047], radius: 0.09, slug: "kneevision-x" },
  { id: "soul", name: "Soul", hex: "#FF7A1A", socket: [-0.235, 0.185, -1.305], normal: [-0.603, 0.784, -0.151], radius: 0.052, slug: "agriintel-ai" },
  { id: "reality", name: "Reality", hex: "#FF2D2D", socket: [-0.101, 0.234, -1.338], normal: [-0.168, 0.951, -0.258], radius: 0.052, slug: "netflix-content-analysis" },
  { id: "space", name: "Space", hex: "#2D7CFF", socket: [0.062, 0.231, -1.312], normal: [0.301, 0.952, -0.05], radius: 0.052, slug: "intelligent-lecture-companion" },
  { id: "power", name: "Power", hex: "#A234FF", socket: [0.191, 0.194, -1.314], normal: [0.5, 0.859, -0.11], radius: 0.052, slug: "airbnb-booking-analysis" },
  { id: "time", name: "Time", hex: "#22E07A", socket: [0.286, -0.112, -0.917], normal: [0.501, -0.351, 0.791], radius: 0.052, slug: "ai-travel-agent" },
];

/** One intro stop plus one stop per stone. */
export const STOPS = stones.length + 1;

/** Veo prompts that produced public/media/stones/<id>.mp4 (smooth cabochons, not faceted). */
export const veoPrompts: Record<StoneId, string> = {
  mind: "Photorealistic macro shot of a smooth oval golden yellow cabochon gemstone floating in black void, slow internal light pulsing like neural activity, fine dust motes drifting, shallow depth of field, no camera movement, seamless loop, cinematic lighting, 8 seconds.",
  soul: "Photorealistic macro shot of a smooth oval deep orange cabochon gemstone hovering over a dark still lake, faint amber mist rising, slow warm glow breathing, black background, no camera movement, seamless loop, cinematic, 8 seconds.",
  reality: "Photorealistic macro shot of a smooth oval crimson red cabochon gemstone in black void, liquid red energy slowly warping the air around it like heat haze, fine red particles, no camera movement, seamless loop, cinematic, 8 seconds.",
  space: "Photorealistic macro shot of a smooth oval sapphire blue cabochon gemstone in black void, thin blue lightning threads crawling across its surface, cold blue volumetric glow, star-like dust, no camera movement, seamless loop, cinematic, 8 seconds.",
  power: "Photorealistic macro shot of a smooth oval violet purple cabochon gemstone in black void, dense purple energy arcs crackling outward and fading, heavy glow, floating debris, no camera movement, seamless loop, cinematic, 8 seconds.",
  time: "Photorealistic macro shot of a smooth oval emerald green cabochon gemstone in black void, slow rotating rings of green light orbiting it, faint clock-like ticking glow, fine green dust, no camera movement, seamless loop, cinematic, 8 seconds.",
};
