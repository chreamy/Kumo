const { EmbedBuilder } = require("discord.js");
const {
  getTokenStats,
  getAllTokenStats,
  getSignificantChanges,
} = require("../../service/stats");

let desc =
  "Get current token statistics (all tokens or specific token by address/ticker)";

module.exports = async (client, message, args) => {
  // If no argument, show all tracked tokens summary
  if (!args[0]) {
    const allStats = getAllTokenStats();

    if (allStats.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle("📊 Token Statistics")
        .setDescription(
          "No tokens tracked yet.\n\n" +
            "The bot is waiting for token updates from the SparkScan stream.\n" +
            "Once tokens start streaming, use `!tokenstats <ticker>` to view specific token data."
        )
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    // Show summary of all tokens
    const tokenList = allStats
      .slice(0, 20) // Limit to 20 tokens to avoid embed limits
      .map((stats, index) => {
        const priceChange = stats.priceChangePercent || 0;
        const priceEmoji =
          priceChange > 0 ? "📈" : priceChange < 0 ? "📉" : "➡️";
        const priceChangeText =
          priceChange > 0
            ? `+${priceChange.toFixed(2)}%`
            : `${priceChange.toFixed(2)}%`;

        return (
          `${index + 1}. **${stats.ticker || stats.name || "Unknown"}**\n` +
          `   ${priceEmoji} Price: ${stats.currentPrice.toFixed(
            2
          )} sats (${priceChangeText})\n` +
          `   👥 Holders: ${stats.currentHolders.toLocaleString()}\n` +
          `   📊 Updates: ${stats.updateCount}`
        );
      })
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Spark Token Statistics",
        iconURL: "https://i.imgur.com/AfFp7pu.png",
      })
      .setTitle("📊 Tracked Tokens Summary")
      .setColor(0x3498db)
      .setDescription(
        `**Total Tokens Tracked:** ${allStats.length}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          (allStats.length > 20
            ? `${tokenList}\n\n*Showing first 20 tokens. Use \`!tokenstats <ticker>\` for specific token.*`
            : tokenList)
      )
      .setFooter({
        text: `Use !tokenstats <ticker|address> for detailed info • ${allStats.length} total`,
      })
      .setTimestamp();

    return message.channel.send({ embeds: [embed] });
  }

  // Search for specific token
  const searchQuery = args.join(" ").toLowerCase();
  const allStats = getAllTokenStats();

  // Try to find by address, ticker, or name
  const token = allStats.find(
    (stats) =>
      stats.address?.toLowerCase() === searchQuery ||
      stats.ticker?.toLowerCase() === searchQuery ||
      stats.name?.toLowerCase() === searchQuery ||
      stats.address?.toLowerCase().includes(searchQuery) ||
      stats.ticker?.toLowerCase().includes(searchQuery) ||
      stats.name?.toLowerCase().includes(searchQuery)
  );

  if (!token) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("❌ Token Not Found")
      .setDescription(
        `No token found matching: \`${args.join(" ")}\`\n\n` +
          "**Usage:** `!tokenstats [ticker|address|name]`\n" +
          "**Example:** `!tokenstats FSPKS` or `!tokenstats` for all tokens"
      )
      .setTimestamp();
    return message.channel.send({ embeds: [embed] });
  }

  // Format price change
  const priceChange = token.priceChangePercent || 0;
  const priceChangeColor =
    priceChange > 0 ? 0x2ecc71 : priceChange < 0 ? 0xe74c3c : 0x95a5a6;
  const priceEmoji = priceChange > 0 ? "📈" : priceChange < 0 ? "📉" : "➡️";
  const priceChangeText =
    priceChange > 0
      ? `+${priceChange.toFixed(2)}%`
      : `${priceChange.toFixed(2)}%`;

  // Format holder change
  const holderChange = token.holderChange || 0;
  const holderChangeText =
    holderChange > 0
      ? `+${holderChange.toLocaleString()}`
      : `${holderChange.toLocaleString()}`;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: "Spark Token Statistics",
      iconURL: "https://i.imgur.com/AfFp7pu.png",
    })
    .setTitle(`📊 ${token.ticker || token.name || "Unknown Token"}`)
    .setColor(priceChangeColor)
    .setDescription(
      `**Name:** ${token.name || "N/A"}\n` +
        `**Ticker:** ${token.ticker || "N/A"}\n` +
        (token.address
          ? `**Address:** \`${token.address.slice(0, 20)}...\``
          : "")
    )
    .addFields(
      {
        name: `${priceEmoji} Price`,
        value:
          `**${token.currentPrice.toFixed(8)} sats**\n` +
          `Change: ${priceChangeText}\n` +
          `Home: ${token.homePrice.toFixed(8)} sats`,
        inline: true,
      },
      {
        name: "👥 Holders",
        value:
          `**${token.currentHolders.toLocaleString()}**\n` +
          `Change: ${holderChangeText}\n` +
          `Home: ${token.homeHolders.toLocaleString()}`,
        inline: true,
      },
      {
        name: "📊 Statistics",
        value:
          `Updates: ${token.updateCount}\n` +
          `History: ${token.priceHistory.length} points\n` +
          `Last Update: <t:${Math.floor(token.lastUpdate.getTime() / 1000)}:R>`,
        inline: false,
      }
    )
    .setFooter({
      text: `Requested by ${message.author.tag}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
};

module.exports.desc = desc;
