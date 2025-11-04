const { getGuildSettings } = require("../../util/guild");
const { EmbedBuilder } = require("discord.js");

let desc = "View current server settings";

module.exports = async (client, message, args) => {
  const guildSettings = await getGuildSettings(message.guild.id);

  if (!guildSettings) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription("❌ Failed to fetch server settings.")
      .setTimestamp();
    return message.channel.send({ embeds: [errorEmbed] });
  }

  const pingStatus = guildSettings.pingEveryone ? "🔔 Enabled" : "🔕 Disabled";
  const channelStatus = guildSettings.channelId
    ? `<#${guildSettings.channelId}>`
    : "⚠️ Not configured";

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${message.guild.name} Configuration`,
      iconURL: message.guild.iconURL() || client.user.displayAvatarURL(),
    })
    .setTitle("⚙️ Server Settings")
    .setColor(0x3498db)
    .setDescription(
      "**Current bot configuration for this server**\n" +
        "━━━━━━━━━━━━━━━━━━━━━━"
    )
    .addFields(
      {
        name: "🔤 Command Prefix",
        value: `\`\`\`${guildSettings.prefix}\`\`\``,
        inline: true,
      },
      {
        name: "📢 @everyone Pings",
        value: pingStatus,
        inline: true,
      },
      {
        name: "📺 Announcement Channel",
        value: channelStatus,
        inline: false,
      }
    )
    .setFooter({
      text: `Requested by ${message.author.tag} • Use !prefix, !setping, !setchannel to modify`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
};

module.exports.desc = desc;
