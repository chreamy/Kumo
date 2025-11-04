const { updateGuildPingEveryone } = require("../../util/guild");
const { EmbedBuilder } = require("discord.js");

let desc = "Enable/disable @everyone pings for FlashNet status alerts";

module.exports = async (client, message, args) => {
  // Check if user has admin permissions
  if (!message.member.permissions.has("Administrator")) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription(
        "🔒 **Access Denied**\nYou need Administrator permission to change ping settings."
      )
      .setTimestamp();
    return message.channel.send({ embeds: [errorEmbed] });
  }

  if (!args[0]) {
    const usageEmbed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle("⚠️ Missing Argument")
      .setDescription(
        "Please specify `on`, `off`, or `role @Role`.\n\n" +
          "**Usage:** `!setping <on|off|role @Role>`\n" +
          "**Examples:**\n" +
          "• `!setping on` - Enable @everyone mentions\n" +
          "• `!setping off` - Disable mentions\n" +
          "• `!setping role @mods` - Mention a specific role"
      )
      .setTimestamp();
    return message.channel.send({ embeds: [usageEmbed] });
  }

  const setting = args[0].toLowerCase();

  if (setting === "role") {
    const role =
      message.mentions.roles.first() ||
      (args[1] && message.guild.roles.cache.get(args[1]));
    if (!role) {
      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle("⚠️ Missing Role")
        .setDescription(
          "Please mention a role or provide a role ID.\n\n" +
            "Example: `!setping role @Moderators`"
        )
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    const { updateGuildPingRole } = require("../../util/guild");
    const ok = await updateGuildPingRole(message.guild.id, role.id);
    if (!ok) {
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setDescription("❌ Failed to set ping role. Please try again.")
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    const success = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("🔔 Role Ping Enabled")
      .setDescription(
        `Members with the role ${role} will be mentioned on status changes.\n\n` +
          "Note: @everyone mentions are now disabled."
      )
      .setFooter({ text: `Changed by ${message.author.tag}` })
      .setTimestamp();
    return message.channel.send({ embeds: [success] });
  }

  let enabled;
  if (setting === "on" || setting === "true" || setting === "enable") {
    enabled = true;
  } else if (
    setting === "off" ||
    setting === "false" ||
    setting === "disable"
  ) {
    enabled = false;
  } else {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setDescription(
        "⚠️ Please use `on`, `off`, or `role @Role`.\n\n**Usage:** `!setping <on|off|role @Role>`"
      )
      .setTimestamp();
    return message.channel.send({ embeds: [errorEmbed] });
  }

  const successToggle = await updateGuildPingEveryone(
    message.guild.id,
    enabled
  );

  if (successToggle) {
    const statusIcon = enabled ? "🔔" : "🔕";
    const statusText = enabled ? "enabled" : "disabled";

    const successEmbed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle(`${statusIcon} Ping Settings Updated`)
      .setDescription(
        (enabled
          ? "@everyone mentions are now enabled."
          : "Mentions are now disabled.") +
          "\n\nTip: Use `!setping role @Role` to mention a specific role instead."
      )
      .setFooter({ text: `Changed by ${message.author.tag}` })
      .setTimestamp();
    message.channel.send({ embeds: [successEmbed] });
  } else {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription("❌ Failed to update ping setting. Please try again.")
      .setTimestamp();
    message.channel.send({ embeds: [errorEmbed] });
  }
};

module.exports.desc = desc;
