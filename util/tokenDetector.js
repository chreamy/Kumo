const axios = require("axios");
const { EmbedBuilder } = require("discord.js");
require("dotenv/config");

// Token identifier pattern: btkn + 65 chars + h0dl (total 73 chars)
const TOKEN_PATTERN = /btkn[a-zA-Z0-9]{55}h0dl/g;

function detectTokenIdentifiers(content) {
  const matches = content.match(TOKEN_PATTERN);
  console.log(matches);
  return matches ? [...new Set(matches)] : []; // Remove duplicates
}

async function fetchTokenDetails(identifier, network = "MAINNET") {
  try {
    const response = await axios.get(
      `https://api.sparkscan.io/v1/tokens/${identifier}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SPARK_API_KEY}`,
        },
        params: { network },
        timeout: 5000,
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch token ${identifier}:`, error.message);
    return null;
  }
}

/**
 * Creates a Discord embed for token details
 * @param {Object} tokenData - Token data from API
 * @returns {EmbedBuilder} - Discord embed
 */
function createTokenEmbed(tokenData) {
  if (!tokenData || !tokenData.metadata) {
    return new EmbedBuilder()
      .setTitle("❌ Token Not Found")
      .setColor(0xe74c3c)
      .setDescription("Could not fetch token details from SparkScan.");
  }

  const { metadata, totalSupply } = tokenData;
  const {
    name,
    ticker,
    decimals,
    isFreezable,
    holderCount,
    priceUsd,
    maxSupply,
    createdAt,
    updatedAt,
    iconUrl,
    tokenAddress,
  } = metadata;

  // Format numbers
  const formatNumber = (num) => {
    if (!num) return "N/A";
    return Number(num).toLocaleString();
  };

  const formatSupply = (supply, dec) => {
    if (!supply || !dec) return "N/A";
    const amount = supply / Math.pow(10, dec);

    if (amount >= 1e9) {
      return `${(amount / 1e9).toFixed(1)}B`;
    } else if (amount >= 1e6) {
      return `${(amount / 1e6).toFixed(1)}M`;
    } else if (amount >= 1e3) {
      return `${(amount / 1e3).toFixed(1)}K`;
    } else {
      return amount.toFixed(1);
    }
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return `$${Number(price).toFixed(8)}`;
  };

  const embed = new EmbedBuilder()
    .setTitle(`${ticker || "Unknown"} - ${name || "Unknown Token"}`)
    .setColor(0x3498db)
    .setTimestamp();

  // Add icon if available
  if (iconUrl) {
    embed.setThumbnail(iconUrl);
  }

  // Supply Information
  embed.addFields({
    name: "📊 Supply",
    value: `**Max Supply:** ${formatSupply(
      maxSupply,
      decimals
    )}\n**Circulating Supply:** ${formatSupply(
      totalSupply,
      decimals
    )}\n**Decimals:** ${decimals || "N/A"}`,
    inline: true,
  });

  // Holders & Status
  embed.addFields({
    name: "👥 Community",
    value: `**Holders:** ${formatNumber(holderCount)}\n**Freezable:** ${
      isFreezable ? "⚠️ Yes" : "✅ No"
    }`,
    inline: true,
  });

  // Token Address (truncated)
  if (tokenAddress) {
    const shortAddress = `${tokenAddress.substring(
      0,
      12
    )}...${tokenAddress.substring(tokenAddress.length - 8)}`;
    embed.addFields({
      name: "📍 Address",
      value: `\`${shortAddress}\`\n[View on SparkScan](https://sparkscan.io/token/${tokenAddress})`,
      inline: false,
    });
  }

  // Timestamps
  if (createdAt || updatedAt) {
    let timeField = "";
    if (createdAt) {
      const createdTimestamp = Math.floor(new Date(createdAt).getTime() / 1000);
      timeField += `**Created:** <t:${createdTimestamp}:R>\n`;
    }
    if (updatedAt) {
      const updatedTimestamp = Math.floor(new Date(updatedAt).getTime() / 1000);
      timeField += `**Updated:** <t:${updatedTimestamp}:R>`;
    }
    embed.addFields({
      name: "🕐 Timeline",
      value: timeField,
      inline: false,
    });
  }

  embed.setFooter({
    text: `Network: ${tokenData.network || "MAINNET"} • SparkScan`,
  });

  return embed;
}

async function processTokenMessage(message) {
  const identifiers = detectTokenIdentifiers(message.content);

  if (identifiers.length === 0) return false;

  console.log(
    `📍 Detected ${identifiers.length} token identifier(s) in message from ${message.author.tag}`
  );

  // Limit to 3 tokens per message to avoid spam
  const tokensToProcess = identifiers.slice(0, 3);

  for (const identifier of tokensToProcess) {
    try {
      const tokenData = await fetchTokenDetails(identifier);
      const embed = createTokenEmbed(tokenData);

      await message.channel.send({ embeds: [embed] });

      console.log(`✅ Sent token details for: ${identifier}`);
    } catch (error) {
      console.error(`❌ Error processing token ${identifier}:`, error.message);
    }
  }

  // Warn if more than 3 tokens detected
  if (identifiers.length > 3) {
    await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `⚠️ Detected ${identifiers.length} tokens, but only showing first 3 to avoid spam.`
          )
          .setColor(0xf39c12),
      ],
    });
  }
  return true;
}

module.exports = {
  detectTokenIdentifiers,
  fetchTokenDetails,
  createTokenEmbed,
  processTokenMessage,
  TOKEN_PATTERN,
};
