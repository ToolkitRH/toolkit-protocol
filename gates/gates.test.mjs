import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { contractGate, socialGate, isAddressShaped } from "../js/gates.js";
import { CONTRACT, SOCIALS, PAIRS, STATS } from "../js/registry.js";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
let failures = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`ok  - ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL - ${name}`);
    console.error(`      ${err.message}`);
  }
}

// --- CA gate must be able to fail on throwaway copy, not just pass on shape ---
check("contract gate rejects a valid-shaped address when state is not stated", () => {
  const throwaway = { state: "absent", address: "0x1234567890abcdef1234567890abcdef12345678" };
  assert.equal(contractGate(throwaway), false);
});

check("contract gate rejects a malformed address even when state is stated", () => {
  const throwaway = { state: "stated", address: "0xnotarealaddress" };
  assert.equal(contractGate(throwaway), false);
});

check("contract gate rejects random 0x-shaped prose", () => {
  const throwaway = { state: "stated", address: "0x deploying soon, address 0xdeadbeef" };
  assert.equal(contractGate(throwaway), false);
});

check("contract gate passes only with stated state + well-formed address", () => {
  const good = { state: "stated", address: "0x1234567890abcdef1234567890abcdef12345678" };
  assert.equal(contractGate(good), true);
});

check("isAddressShaped alone is not treated as authorization", () => {
  assert.equal(isAddressShaped("0x1234567890abcdef1234567890abcdef12345678"), true);
  assert.equal(contractGate({ state: "unconfirmed", address: "0x1234567890abcdef1234567890abcdef12345678" }), false);
});

check("live registry CONTRACT record is currently gated closed (absent)", () => {
  assert.equal(CONTRACT.state, "absent");
  assert.equal(contractGate(CONTRACT), false);
});

// --- social gate ---
check("social gate rejects unconfirmed state even with a plausible url", () => {
  const throwaway = { state: "unconfirmed", url: "https://x.com/throwaway" };
  assert.equal(socialGate(throwaway), false);
});

check("social gate rejects non-https url", () => {
  const throwaway = { state: "stated", url: "http://x.com/notsecure" };
  assert.equal(socialGate(throwaway), false);
});

check("social gate passes with stated state + https url", () => {
  const good = { state: "stated", url: "https://x.com/toolkitmarkets" };
  assert.equal(socialGate(good), true);
});

check("live registry socials are currently gated closed (unconfirmed)", () => {
  SOCIALS.forEach((s) => {
    assert.equal(s.state, "unconfirmed");
    assert.equal(socialGate(s), false);
  });
});

// --- register pattern: counts derive from registry length ---
check("pairs-tracked stat equals PAIRS.length, not a hardcoded number", () => {
  assert.equal(STATS.pairsTracked, PAIRS.length);
});

check("index.html reads pair count from the DOM render, not a literal", () => {
  const html = readFileSync(join(ROOT, "index.html"), "utf-8");
  assert.match(html, /data-field="pairs-count">0</, "expected the static shell to show 0 until app.js renders the real count");
});

// --- palette rule: hex literals only in tokens.css ---
check("no hex color literals outside css/tokens.css", () => {
  const offenders = [];
  const skipDirs = new Set(["node_modules", ".git", "gates", "dist"]);
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      if (skipDirs.has(entry)) continue;
      const p = join(dir, entry);
      const st = statSync(p);
      if (st.isDirectory()) { walk(p); continue; }
      const ext = extname(p);
      if (![".css", ".js", ".html"].includes(ext)) continue;
      if (p === join(ROOT, "css", "tokens.css")) continue;
      if (p.includes(join("assets", "favicon.svg"))) continue;
      const text = readFileSync(p, "utf-8");
      const matches = text.match(/#[0-9a-fA-F]{3,8}\b/g);
      if (matches) offenders.push(`${p}: ${matches.join(", ")}`);
    }
  };
  walk(ROOT);
  assert.deepEqual(offenders, []);
});

// --- favicon exists and is a traced 32x32 SVG ---
check("favicon.svg exists, is 32x32, and documents its trace provenance", () => {
  const svg = readFileSync(join(ROOT, "assets", "favicon.svg"), "utf-8");
  assert.match(svg, /viewBox="0 0 32 32"/);
  assert.match(svg, /traced from/);
});

// --- social icons: no href until state is stated ---
check("index.html renders social links with no href attribute (gate inert by default)", () => {
  const html = readFileSync(join(ROOT, "index.html"), "utf-8");
  const linkBlocks = [...html.matchAll(/<a class="social-link[\s\S]*?<\/a>/g)].map((m) => m[0]);
  assert.equal(linkBlocks.length, 2, "expected exactly 2 social link elements (X, GitHub)");
  linkBlocks.forEach((block) => {
    assert.doesNotMatch(block, /href="/);
  });
});

console.log("");
if (failures > 0) {
  console.error(`${failures} gate(s) failed`);
  process.exit(1);
} else {
  console.log("all gates passed");
  process.exit(0);
}
