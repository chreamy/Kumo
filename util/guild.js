const Guild = require("../schemas/guild");
const { isDbReady, defaultGuildSettings } = require("./db");

// Get guild settings from database
async function getGuildSettings(guildId) {
  if (!isDbReady()) {
    return defaultGuildSettings(guildId);
  }
  try {
    let guild = await Guild.findById(guildId);
    if (!guild) {
      guild = await Guild.create({
        _id: guildId,
        prefix: "!",
        pingEveryone: false,
        channelId: null,
      });
    }
    return guild;
  } catch (error) {
    console.error("Error fetching guild settings:", error);
    return null;
  }
}

// Update guild prefix
async function updateGuildPrefix(guildId, newPrefix) {
  if (!isDbReady()) return false;
  try {
    await Guild.findByIdAndUpdate(
      guildId,
      { prefix: newPrefix },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error("Error updating guild prefix:", error);
    return false;
  }
}

// Update guild pingEveryone setting
async function updateGuildPingEveryone(guildId, enabled) {
  if (!isDbReady()) return false;
  try {
    await Guild.findByIdAndUpdate(
      guildId,
      { pingEveryone: enabled, ...(enabled ? { pingRoleId: null } : {}) },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error("Error updating guild pingEveryone:", error);
    return false;
  }
}

// Update guild announcement channel
async function updateGuildChannel(guildId, channelId) {
  if (!isDbReady()) return false;
  try {
    await Guild.findByIdAndUpdate(
      guildId,
      { channelId: channelId },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error("Error updating guild channel:", error);
    return false;
  }
}

// Set or clear ping role id
async function updateGuildPingRole(guildId, roleId) {
  if (!isDbReady()) return false;
  try {
    await Guild.findByIdAndUpdate(
      guildId,
      {
        pingRoleId: roleId || null,
        ...(roleId ? { pingEveryone: false } : {}),
      },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error("Error updating guild pingRoleId:", error);
    return false;
  }
}

module.exports = {
  getGuildSettings,
  updateGuildPrefix,
  updateGuildPingEveryone,
  updateGuildChannel,
  updateGuildPingRole,
};
