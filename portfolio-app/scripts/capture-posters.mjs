// Captures the five generated posters with the system Chrome, then converts to webp.
// No new npm dependencies: headless Chrome screenshots to png, cwebp encodes.
// Usage: node scripts/capture-posters.mjs [slug ...]
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(dir, "..");
const page = path.join(root, "src/components/media/posters/index.html");
const outDir = path.join(root, "public/media");
const ALL = ["emotion", "dentalbot", "gesture", "chatapp", "greenbasket"];
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ALL;

const CHROME =
  process.env.CHROME_BIN || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(CHROME)) {
  console.error(`FAIL: no Chrome at ${CHROME}. Set CHROME_BIN.`);
  process.exit(1);
}

const have = (bin) => {
  try {
    execFileSync("which", [bin], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
};
const hasCwebp = have("cwebp");
if (!hasCwebp) console.warn("WARN: cwebp not found, shipping png. Update content.ts paths.");

mkdirSync(outDir, { recursive: true });
const tmp = mkdtempSync(path.join(tmpdir(), "posters-"));

// A full Chrome install writes the screenshot in a second or two but never exits:
// it keeps background services alive. So poll for the file, then kill the group.
async function shoot(url, png) {
  const child = spawn(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-sync",
      "--no-service-autorun",
      `--user-data-dir=${path.join(tmp, "profile")}`,
      "--window-size=1200,900",
      "--force-device-scale-factor=2",
      `--screenshot=${png}`,
      url,
    ],
    { detached: true, stdio: "ignore" },
  );
  try {
    let stable = 0;
    let last = -1;
    for (let i = 0; i < 300; i++) {
      await sleep(200);
      const size = existsSync(png) ? statSync(png).size : 0;
      if (size > 0 && size === last) stable++;
      else stable = 0;
      last = size;
      if (stable >= 2) return;
    }
    throw new Error("timed out waiting for screenshot");
  } finally {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {}
  }
}

for (const slug of slugs) {
  const png = path.join(hasCwebp ? tmp : outDir, `${slug}.png`);
  rmSync(png, { force: true });
  await shoot(`${pathToFileURL(page).href}?slug=${slug}`, png);
  if (!existsSync(png) || statSync(png).size === 0) {
    console.error(`FAIL: empty capture for ${slug}`);
    process.exit(1);
  }
  if (hasCwebp) {
    const webp = path.join(outDir, `${slug}.webp`);
    execFileSync("cwebp", ["-q", "90", "-quiet", png, "-o", webp]);
    console.log(`${slug}.webp ${statSync(webp).size} bytes`);
  } else {
    console.log(`${slug}.png ${statSync(png).size} bytes`);
  }
}

rmSync(tmp, { recursive: true, force: true });
