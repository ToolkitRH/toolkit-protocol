// REGISTER PATTERN: every external fact is one record with an explicit state.
// state: "stated" | "absent" | "unconfirmed"
// Absent/unconfirmed records render inert and carry the date they were checked.

export const CHECKED_ON = "2026-09-02";

export const CHAIN = {
  state: "stated",
  name: "Robinhood Chain",
  chainIdHex: "0x1237",
  chainIdDec: 4663,
  rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
  source: "client statement, batch-level, 2026-09-02",
  checkedOn: CHECKED_ON,
};

export const CONTRACT = {
  state: "absent",
  address: null,
  source: null,
  checkedOn: CHECKED_ON,
};

export const SOCIALS = [
  {
    id: "x",
    state: "unconfirmed",
    label: "X",
    url: null,
    checkedOn: CHECKED_ON,
  },
  {
    id: "github",
    state: "unconfirmed",
    label: "GitHub",
    url: null,
    checkedOn: CHECKED_ON,
  },
];

// Market data has no source until CONTRACT is stated — kept empty, never fabricated.
export const PAIRS = [];

export const STATS = {
  state: "absent",
  poolVolume24h: null,
  poolTrades24h: null,
  pairsTracked: PAIRS.length,
  checkedOn: CHECKED_ON,
};
