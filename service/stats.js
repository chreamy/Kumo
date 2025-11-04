// Token statistics and tracking utilities

// Track token statistics over time
const tokenStats = new Map();

// Update token statistics
function updateTokenStats(tokenData) {
  const { address, ticker, name, price_sats, holders } = tokenData;
  const key = address || ticker || name;

  if (!tokenStats.has(key)) {
    tokenStats.set(key, {
      address,
      ticker: ticker || name,
      name,
      currentPrice: parseFloat(price_sats) || 0,
      currentHolders: holders || 0,
      priceHistory: [],
      holderHistory: [],
      homePrice: parseFloat(price_sats) || 0,
      homeHolders: holders || 0,
      lastUpdate: new Date(),
      updateCount: 0,
    });
  }

  const stats = tokenStats.get(key);
  const newPrice = parseFloat(price_sats) || 0;
  const newHolders = holders || 0;

  // Update current values
  stats.currentPrice = newPrice;
  stats.currentHolders = newHolders;
  stats.lastUpdate = new Date();
  stats.updateCount++;

  // Track price change
  if (stats.currentPrice !== stats.homePrice) {
    const priceChange =
      ((stats.currentPrice - stats.homePrice) / stats.homePrice) * 100;
    stats.priceChangePercent = priceChange;
  }

  // Track holder change
  if (stats.currentHolders !== stats.homeHolders) {
    const holderChange = stats.currentHolders - stats.homeHolders;
    stats.holderChange = holderChange;
  }

  // Keep limited history
  if (stats.priceHistory.length > 100) {
    stats.priceHistory.shift();
  }
  if (stats.holderHistory.length > 100) {
    stats.holderHistory.shift();
  }

  stats.priceHistory.push({ price: newPrice, timestamp: new Date() });
  stats.holderHistory.push({ holders: newHolders, timestamp: new Date() });

  return stats;
}

// Get token statistics
function getTokenStats(tokenAddress) {
  return tokenStats.get(tokenAddress);
}

// Get all tracked tokens
function getAllTokenStats() {
  return Array.from(tokenStats.values());
}

// Get tokens with significant changes
function getSignificantChanges(priceThreshold = 10, holderThreshold = 100) {
  const significant = [];

  for (const stats of tokenStats.values()) {
    const hasPriceChange =
      Math.abs(stats.priceChangePercent || 0) >= priceThreshold;
    const hasHolderChange =
      Math.abs(stats.holderChange || 0) >= holderThreshold;

    if (hasPriceChange || hasHolderChange) {
      significant.push(stats);
    }
  }

  return significant.sort((a, b) => {
    const aChange = Math.abs(a.priceChangePercent || 0);
    const bChange = Math.abs(b.priceChangePercent || 0);
    return bChange - aChange;
  });
}

// Reset token statistics
function resetTokenStats(tokenAddress) {
  if (tokenAddress) {
    tokenStats.delete(tokenAddress);
  } else {
    tokenStats.clear();
  }
}

module.exports = {
  updateTokenStats,
  getTokenStats,
  getAllTokenStats,
  getSignificantChanges,
  resetTokenStats,
};
