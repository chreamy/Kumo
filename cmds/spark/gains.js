const { EmbedBuilder } = require("discord.js");

let desc = "Get top 24h gains tokens from Luminex";

const LUMINEX_API_URL =
  "https://api.luminex.io/spark/pulse?page=1&limit=100&filters=%7B%22token_b_pubkeys%22%3A%5B%22020202020202020202020202020202020202020202020202020202020202020202%22%5D%2C%22include_hostnames%22%3A%5B%22luminex%22%2C%22utxofun%22%5D%2C%22sort_by%22%3A%22agg_price_change_24h%22%2C%22order%22%3A%22desc%22%7D";

module.exports = async (client, message, args) => {
  // Parse limit argument (default 10, max 25)
  let limit = 10;
  if (args[0]) {
    const parsedLimit = parseInt(args[0], 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 25) {
      limit = parsedLimit;
    }
  }

  try {
    // Fetch data from Luminex API
    const response = await fetch(LUMINEX_API_URL, {
      headers: {
        Accept: "application/json",
        Referer: "https://luminex.io",
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();
    const tokens = result.data || [];

    if (tokens.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle("📊 Top Tokens")
        .setDescription("No tokens found at the moment.")
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    // Take top N tokens
    const topTokens = tokens.slice(0, limit);

    // Format token list as description string
    const tokenList = topTokens
      .map((token, index) => {
        const meta = token.tokenAMetadata || {};
        const ticker = meta.ticker || "N/A";
        const name = meta.name || "Unknown";
        const priceUsd = meta.agg_price_usd || 0;
        const marketCapUsd = meta.agg_marketcap_usd || 0;
        const volume24h = meta.agg_volume_24h_usd || 0;
        const priceChange24h = meta.agg_price_change_24h || 0;
        const holders = meta.holder_count || 0;
        const lpPublicKey = token.lpPublicKey || "";

        const buyLink = lpPublicKey
          ? `https://luminex.io/spark/trade/${lpPublicKey}`
          : null;

        const changeEmoji =
          priceChange24h > 0 ? "🟢" : priceChange24h < 0 ? "🔴" : "⚪";
        const changeText =
          priceChange24h > 0
            ? `+${priceChange24h.toFixed(1)}%`
            : `${priceChange24h.toFixed(1)}%`;

        const marketCapFormatted =
          marketCapUsd >= 1000000
            ? `${(marketCapUsd / 1000000).toFixed(1)}M`
            : marketCapUsd >= 1000
            ? `${(marketCapUsd / 1000).toFixed(1)}K`
            : `${marketCapUsd.toFixed(1)}`;
        marketCapUsdBefore24h = marketCapUsd / (1 + priceChange24h / 100);
        const marketCapBefore24hFormatted =
          marketCapUsdBefore24h >= 1000000
            ? `${(marketCapUsdBefore24h / 1000000).toFixed(1)}M`
            : marketCapUsdBefore24h >= 1000
            ? `${(marketCapUsdBefore24h / 1000).toFixed(1)}K`
            : `${marketCapUsdBefore24h.toFixed(1)}`;

        // Create token entry
        let entry = `${index + 1}. `;
        if (buyLink) {
          entry += `[**${ticker}**](${buyLink}) - ${name}`;
        } else {
          entry += `**${ticker}** - ${name}`;
        }
        entry += `\n${changeEmoji} ${changeText} **@ ${marketCapBefore24hFormatted} ➜ ${marketCapFormatted}** • 👥 ${holders.toLocaleString()}`;

        return entry;
      })
      .join("\n");

    // Create embed with description instead of fields
    const embed = new EmbedBuilder()
      .setTitle(`🚀 Top 10 Gains 24h`)
      .setColor(0x00aa00)
      .setDescription(tokenList)
      .setTimestamp()
      .setURL("https://luminex.io/spark");

    message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("[TopTokens] Error:", error);
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("❌ Error Fetching Tokens")
      .setDescription(
        `Failed to fetch top tokens from Luminex API.\n\n` +
          `**Error:** ${error.message}\n\n` +
          `Please try again later.`
      )
      .setTimestamp();
    message.channel.send({ embeds: [errorEmbed] });
  }
};

module.exports.desc = desc;
