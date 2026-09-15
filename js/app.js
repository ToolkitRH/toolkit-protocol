import { CHAIN, CONTRACT, SOCIALS, PAIRS, STATS, CHECKED_ON } from "./registry.js";
import { contractGate, socialGate, deriveHandle } from "./gates.js";

function renderChain() {
  const el = document.querySelector('[data-field="chain-badge"]');
  if (!el) return;
  el.textContent = CHAIN.state === "stated"
    ? `${CHAIN.name} · chain ${CHAIN.chainIdDec}`
    : "chain unconfirmed";
}

function renderContract() {
  const pill = document.querySelector('[data-gate="ca"]');
  const valueEl = pill.querySelector('[data-field="ca-value"]');
  const copyBtn = pill.querySelector('[data-action="copy-ca"]');
  const active = contractGate(CONTRACT);

  pill.classList.toggle("is-inert", !active);
  pill.classList.toggle("is-active", active);

  if (active) {
    valueEl.textContent = CONTRACT.address;
    valueEl.title = CONTRACT.address;
    copyBtn.disabled = false;
    copyBtn.setAttribute("aria-disabled", "false");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(CONTRACT.address);
        const original = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        copyBtn.classList.add("is-confirmed");
        setTimeout(() => {
          copyBtn.textContent = original;
          copyBtn.classList.remove("is-confirmed");
        }, 1200);
      } catch {
        /* clipboard denied by browser — no fallback needed for a click-to-copy affordance */
      }
    });
  } else {
    valueEl.textContent = "Contract not yet deployed";
    copyBtn.disabled = true;
    copyBtn.setAttribute("aria-disabled", "true");
  }
}

function renderSocials() {
  document.querySelectorAll('[data-gate="social"]').forEach((el) => {
    const id = el.getAttribute("data-social-id");
    const record = SOCIALS.find((s) => s.id === id);
    const active = socialGate(record);
    el.classList.toggle("is-inert", !active);
    el.classList.toggle("is-active", active);
    if (active) {
      el.href = record.url;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      el.removeAttribute("aria-disabled");
      const handle = deriveHandle(record.url);
      el.setAttribute("aria-label", `${record.label} — ${handle}`);
      el.title = `${record.label} — ${handle}`;
    } else {
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("aria-label", `${record.label} — unconfirmed`);
      el.title = `${record.label} — unconfirmed as of ${record.checkedOn}`;
    }
  });
}

function renderStats() {
  const volumeEl = document.querySelector('[data-field="volume"]');
  const tradesEl = document.querySelector('[data-field="trades"]');
  const pairsEl = document.querySelector('[data-field="pairs-count"]');

  volumeEl.textContent = STATS.state === "stated" ? STATS.poolVolume24h : "—";
  tradesEl.textContent = STATS.state === "stated" ? STATS.poolTrades24h : "—";
  pairsEl.textContent = String(PAIRS.length); // count always derives from registry length

  document.querySelectorAll('[data-component="stats"] .stat-tile').forEach((tile) => {
    tile.classList.toggle("is-inert", STATS.state !== "stated");
  });
}

function renderPairs() {
  const tbody = document.querySelector('[data-field="pairs-tbody"]');
  tbody.innerHTML = "";

  if (PAIRS.length === 0) {
    const tr = document.createElement("tr");
    tr.className = "empty-row";
    const td = document.createElement("td");
    td.colSpan = 10;
    td.textContent = `No pairs tracked yet — waiting on ${CONTRACT.state === "stated" ? "pool data" : "a stated contract"}.`;
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  PAIRS.forEach((pair, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${pair.symbol}</td>
      <td>${pair.mcap}</td>
      <td>${pair.price}</td>
      <td>${pair.age}</td>
      <td>${pair.buys}</td>
      <td>${pair.sells}</td>
      <td>${pair.volume}</td>
      <td>${pair.change24h}</td>
      <td>${pair.liquidity}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderMeta() {
  document.querySelectorAll("[data-checked-on]").forEach((el) => {
    el.setAttribute("data-checked-on", CHECKED_ON);
  });
}

function wireDensityToggle() {
  const board = document.querySelector('[data-component="board"]');
  const buttons = document.querySelectorAll('[data-action="density"]');
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
      board.setAttribute("data-density", btn.getAttribute("data-density-value"));
    });
  });
}

function wireTimeframeToggle() {
  const buttons = document.querySelectorAll('[data-action="timeframe"]');
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");
    });
  });
}

function init() {
  renderChain();
  renderContract();
  renderSocials();
  renderStats();
  renderPairs();
  renderMeta();
  wireDensityToggle();
  wireTimeframeToggle();
}

document.addEventListener("DOMContentLoaded", init);
