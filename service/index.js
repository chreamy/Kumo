require("dotenv/config");
const { EmbedBuilder } = require("discord.js");
const { startHealthService } = require("./health");
const { startTokenStream, stopTokenStream } = require("./tokenStream");
const { updateTokenStats } = require("./stats");
const { client } = require("../util/client");
const Guild = require("../schemas/guild");

async function startServices() {
  if (!client) {
    throw new Error("Client not initialized.");
  }

  console.log("Starting background services...");

  // Start FlashNet health monitoring
  await startHealthService();

  // Start SparkScan token streaming
  startTokenStream({
    onUpdate: async (data, channel) => {
      if (channel === "/token/network/MAINNET") {
        if (data.holders > 10) {
          return;
        }
        const embed = new EmbedBuilder()
          .setTitle(`🪙 New Token: ${data.ticker.split("#")[0]}`)
          .setColor(0x3498db)
          .addFields(
            {
              name: "📊 Supply",
              value: `\`\`\`\nMax: ${(
                data.max_supply / 1e8
              ).toLocaleString()}\nCirculating: ${(
                data.circulating_supply / 1e8
              ).toLocaleString()}\`\`\``,
              inline: true,
            },
            {
              name: "👥 Holders",
              value: `\`\`\`\n${data.holders.toLocaleString()}\`\`\``,
              inline: true,
            },
            {
              name: "💰 Price",
              value: `\`\`\`\n${
                data.price_sats ? `${data.price_sats} sats` : "N/A"
              }\`\`\``,
              inline: true,
            },
            {
              name: "🔒 Freezable",
              value: data.is_freezable ? "Yes" : "No",
              inline: true,
            },
            {
              name: "📍 Address",
              value: `\`${data.address.substring(
                0,
                20
              )}\`\n[View on SparkScan](https://sparkscan.io/token/${
                data.address
              })`,
              inline: false,
            }
          )
          .setFooter({ text: `Network: ${data.network}` })
          .setTimestamp();

        const guilds = await Guild.find({});
        for (const guild of guilds) {
          if (guild.channelId) {
            try {
              const channel = await client.channels.fetch(guild.channelId);
              if (channel) {
                await channel.send({ embeds: [embed] });
              }
            } catch (error) {
              console.error(
                `Failed to send to guild ${guild._id}:`,
                error.message
              );
            }
          }
        }
      } else {
        console.log(data);
      }
    },
    onConnect: () => {
      console.log("✓ Token streaming service connected");
    },
    onError: (error) => {
      console.error("Token stream error:", error);
    },
    onDisconnect: (code, reason) => {
      console.log(`Token stream disconnected: ${code} - ${reason}`);
    },
  });

  console.log("All services started successfully");
}

function stopServices() {
  console.log("Stopping all services...");
  stopTokenStream();
}

module.exports = {
  startServices,
  stopServices,
};
