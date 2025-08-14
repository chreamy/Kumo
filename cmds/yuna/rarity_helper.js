const path = require("path");
const rarityCache = require("./rarity_cache.json");

// Get rarity info for a specific Yuna
function getRarityInfo(number) {
    // Arrays are 0-based
    return rarityCache[number - 1];
}

module.exports = { getRarityInfo };
