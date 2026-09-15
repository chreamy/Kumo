const fetch = require("node-fetch");

const OPENSEA_API_BASE = "https://api.opensea.io/api/v2";

function getOpenSeaHeaders() {
  const apiKey = process.env.OPENSEA_API_KEY || process.env.OS_API_KEY || "";
  const headers = { Accept: "application/json" };
  if (apiKey) {
    headers["X-API-KEY"] = apiKey;
  }
  return headers;
}

/**
 * Count NFTs from `collectionSlug` for `address` on `chain`.
 * Stops early once `stopAt` is reached (count may be higher when `reachedStopAt` is true).
 */
async function countCollectionNfts(
  chain,
  address,
  collectionSlug,
  stopAt = Infinity
) {
  const headers = getOpenSeaHeaders();
  if (!headers["X-API-KEY"]) {
    const err = new Error("OPENSEA_API_KEY is not configured");
    err.code = "MISSING_OPENSEA_KEY";
    throw err;
  }

  const normalized = address.toLowerCase();
  let next = null;
  let count = 0;
  let sample = null;
  let reachedStopAt = false;

  do {
    const url = new URL(
      `${OPENSEA_API_BASE}/chain/${chain}/account/${normalized}/nfts`
    );
    url.searchParams.set("collection", collectionSlug);
    url.searchParams.set("limit", "50");
    if (next) {
      url.searchParams.set("next", next);
    }

    const response = await fetch(url.toString(), { headers });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg =
        body.errors?.join(", ") ||
        body.message ||
        `OpenSea API HTTP ${response.status}`;
      const err = new Error(msg);
      err.status = response.status;
      throw err;
    }

    const nfts = body.nfts || [];
    if (!sample && nfts[0]) sample = nfts[0];
    count += nfts.length;

    if (Number.isFinite(stopAt) && count >= stopAt) {
      reachedStopAt = true;
      break;
    }

    next = body.next || null;
  } while (next);

  return {
    owns: count > 0,
    count,
    sample,
    reachedStopAt,
  };
}

async function ownsCollectionNft(chain, address, collectionSlug) {
  return countCollectionNfts(chain, address, collectionSlug, 1);
}

function normalizeAccountPayload(body) {
  if (!body || typeof body !== "object") return body;
  if (body.account && typeof body.account === "object") {
    return body.account;
  }
  return body;
}

async function fetchOpenSeaAccountOnce(usernameOrAddress) {
  const headers = getOpenSeaHeaders();
  if (!headers["X-API-KEY"]) {
    const err = new Error("OPENSEA_API_KEY is not configured");
    err.code = "MISSING_OPENSEA_KEY";
    throw err;
  }

  const id = encodeURIComponent(usernameOrAddress.trim());
  const response = await fetch(`${OPENSEA_API_BASE}/accounts/${id}`, {
    headers,
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      body.errors?.join(", ") ||
      body.message ||
      `OpenSea API HTTP ${response.status}`;
    const err = new Error(msg);
    err.status = response.status;
    throw err;
  }

  return normalizeAccountPayload(body);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** OpenSea profile fields can lag; re-fetch by username then wallet when bio looks empty. */
async function fetchOpenSeaAccount(usernameOrAddress) {
  const trimmed = usernameOrAddress.trim();
  let account = await fetchOpenSeaAccountOnce(trimmed);

  const attempts = [
    () => fetchOpenSeaAccountOnce(trimmed),
    () =>
      account.address
        ? fetchOpenSeaAccountOnce(account.address)
        : Promise.resolve(account),
    () => sleep(2500).then(() => fetchOpenSeaAccountOnce(trimmed)),
    () =>
      account.address
        ? sleep(2500).then(() => fetchOpenSeaAccountOnce(account.address))
        : Promise.resolve(account),
  ];

  for (const attempt of attempts) {
    if (account.bio && String(account.bio).trim()) {
      break;
    }
    account = await attempt();
  }

  return account;
}

module.exports = {
  ownsCollectionNft,
  countCollectionNfts,
  fetchOpenSeaAccount,
  fetchOpenSeaAccountOnce,
  getOpenSeaHeaders,
};
