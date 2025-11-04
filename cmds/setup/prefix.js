const { updateGuildPrefix } = require("../../util/guild");
const { EmbedBuilder } = require("discord.js");

let desc = "Change the bot command prefix for this server";

module.exports = async (client, message, args) => {
  // Check if user has admin permissions
  if (!message.member.permissions.has("Administrator")) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription(
        "🔒 **Access Denied**\nYou need Administrator permission to change the prefix."
      )
      .setTimestamp();
    return message.channel.send({ embeds: [errorEmbed] });
  }

  if (!args[0]) {
    const usageEmbed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle("⚠️ Missing Argument")
      .setDescription(
        "Please provide a new prefix.\n\n**Usage:** `!prefix <new_prefix>`\n**Example:** `!prefix ?`"
      )
      .setTimestamp();
    return message.channel.send({ embeds: [usageEmbed] });
  }

  const newPrefix = args[0];

  if (newPrefix.length > 5) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription("❌ Prefix must be 5 characters or less.")
      .setTimestamp();
    return message.channel.send({ embeds: [errorEmbed] });
  }

  const success = await updateGuildPrefix(message.guild.id, newPrefix);

  if (success) {
    const successEmbed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("✅ Prefix Updated")
      .setDescription(
        `**New prefix:** \`${newPrefix}\`\n\n` +
          `All commands now use this prefix.\n` +
          `Example: \`${newPrefix}status\``
      )
      .setFooter({ text: `Changed by ${message.author.tag}` })
      .setTimestamp();
    message.channel.send({ embeds: [successEmbed] });
  } else {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription("❌ Failed to update prefix. Please try again.")
      .setTimestamp();
    message.channel.send({ embeds: [errorEmbed] });
  }
};

module.exports.desc = desc;
