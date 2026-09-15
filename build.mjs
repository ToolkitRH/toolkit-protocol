import { rmSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");

// Deployable surface only — brand/, reference/, gates/, node_modules/ never ship.
const INCLUDE = [
  { src: "index.html", type: "file" },
  { src: "css", type: "dir" },
  { src: "js", type: "dir" },
  { src: "assets", type: "dir" },
];

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

for (const item of INCLUDE) {
  const srcPath = join(ROOT, item.src);
  if (!existsSync(srcPath)) {
    throw new Error(`build: expected ${item.src} to exist`);
  }
  const destPath = join(DIST, item.src);
  if (item.type === "dir") mkdirSync(destPath, { recursive: true });
  cpSync(srcPath, destPath, { recursive: item.type === "dir" });
  console.log(`copied ${item.src}`);
}

console.log(`\nbuild output: ${DIST}`);
