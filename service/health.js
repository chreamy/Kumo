require("dotenv/config");
const { client } = require("../util/client");
const { EmbedBuilder } = require("discord.js");
const Guild = require("../schemas/guild");

const {
  API_URL = "https://api.flashnet.xyz/v1/ping",
  CHECK_INTERVAL_MS = "1000",
  REQUIRED_CONFIRMS = "2",
} = process.env;

// State management
const state = {
  lastStatus: "enabled",
  pendingStatus: null,
  confirmCount: 0,
  lastChangeAt: null,
};

async function checkAPI(timeout = 5000) {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      signal: AbortSignal.timeout(timeout),
    });
    return {
      ok: true,
      status: response.status === 200 ? "enabled" : "disabled",
    };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

async function startHealthService() {
  const interval = parseInt(CHECK_INTERVAL_MS, 10);
  const requiredConfirms = parseInt(REQUIRED_CONFIRMS, 10);

  const tick = async () => {
    const { ok, status, error } = await checkAPI();

    if (!ok) {
      console.log("Check error:", error);
      return;
    }

    if (status !== state.lastStatus) {
      if (state.pendingStatus === status) {
        state.confirmCount++;
      } else {
        state.pendingStatus = status;
        state.confirmCount = 1;
      }

      if (state.confirmCount >= requiredConfirms) {
        state.lastStatus = status;
        state.lastChangeAt = new Date();
        await notifyChange(status);
        state.pendingStatus = null;
        state.confirmCount = 0;
      }
    } else {
      state.pendingStatus = null;
      state.confirmCount = 0;
    }
  };

  await tick();
  setInterval(tick, interval);
}

async function notifyChange(newStatus) {
  // Fetch all guilds that have a channel configured
  const guilds = await Guild.find({ channelId: { $ne: null } });

  for (const guildConfig of guilds) {
    try {
      const channel = await client.channels
        .fetch(guildConfig.channelId)
        .catch(() => null);

      if (!channel?.isTextBased()) continue;

      const embed = new EmbedBuilder()
        .setTitle("🐉 Luminex Swap Monitor")
        .setURL("https://luminex.io/spark/trade/")
        .setColor(newStatus === "enabled" ? 0x2ecc71 : 0xe74c3c)
        .setDescription(
          newStatus === "enabled"
            ? "✅ **SWAP ENABLED** — FlashNet is active."
            : "⚠️ **SWAP DISABLED** — FlashNet appears offline."
        )
        .setTimestamp();

      if (state.lastChangeAt) {
        embed.addFields({
          name: "Last Change",
          value: `<t:${Math.floor(state.lastChangeAt.getTime() / 1000)}:R>`,
        });
      }

      let content;
      let allowedMentions;
      if (
        guildConfig.pingRoleId &&
        guildConfig.pingEveryone &&
        newStatus === "enabled"
      ) {
        content = `<@&${guildConfig.pingRoleId}>`;
        allowedMentions = { roles: [guildConfig.pingRoleId] };
      } else if (guildConfig.pingEveryone && newStatus === "enabled") {
        content = "@everyone";
        allowedMentions = { parse: ["everyone"] };
      } else {
        content = undefined;
        allowedMentions = { parse: [] };
      }

      await channel.send({ content, embeds: [embed], allowedMentions });
    } catch (error) {
      console.error(
        `Failed to send notification to guild ${guildConfig._id}:`,
        error.message
      );
    }
  }
}

module.exports = {
  state,
  checkAPI,
  startHealthService,
};
