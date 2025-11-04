const { state } = require("../../service/health");
const { EmbedBuilder } = require("discord.js");
require("dotenv/config");

const {
  TARGET_URL = "https://luminex.io/spark/trade/02f810caaa2b09e6fa8a739108ea0946f2970d621776272d19030a9647921d7e02",
} = process.env;

let desc = "Show current FlashNet status";

module.exports = async (client, message, args) => {
  const statusEmoji =
    state.lastStatus === "unknown"
      ? "❔"
      : state.lastStatus === "enabled"
      ? "🟢"
      : "🔴";

  const statusText =
    state.lastStatus === "unknown"
      ? "UNKNOWN"
      : state.lastStatus === "enabled"
      ? "ENABLED"
      : "DISABLED";

  const statusColor =
    state.lastStatus === "unknown"
      ? 0x95a5a6
      : state.lastStatus === "enabled"
      ? 0x2ecc71
      : 0xe74c3c;

  const statusDescription =
    state.lastStatus === "unknown"
      ? "No status data available yet. Monitoring is starting..."
      : state.lastStatus === "enabled"
      ? "FlashNet is operational. Swap functionality is available."
      : "FlashNet appears to be offline. Swap functionality may be unavailable.";

  const embed = new EmbedBuilder()

    .setTitle(`${statusEmoji} Current Swap Status`)
    .setURL(TARGET_URL)
    .setColor(statusColor)
    .setDescription(
      `**Status:** \`${statusText}\`\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        statusDescription
    )
    .setTimestamp();

  if (state.lastChangeAt) {
    embed.addFields({
      name: "📅 Last Status Change",
      value: `<t:${Math.floor(state.lastChangeAt.getTime() / 1000)}:R>`,
      inline: true,
    });
  }

  embed.setFooter({
    text: `Requested by ${message.author.tag}`,
    iconURL: message.author.displayAvatarURL(),
  });

  message.channel.send({ embeds: [embed] });
};

module.exports.desc = desc;
