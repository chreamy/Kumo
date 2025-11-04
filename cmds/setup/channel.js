const { updateGuildChannel } = require("../../util/guild");
const { EmbedBuilder } = require("discord.js");

let desc = "Set the channel for FlashNet status announcements";

module.exports = async (client, message, args) => {
  // Check if user has admin permissions
  if (!message.member.permissions.has("Administrator")) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription(
        "🔒 **Access Denied**\nYou need Administrator permission to change the announcement channel."
      )
      .setTimestamp();
    return message.channel.send({ embeds: [errorEmbed] });
  }

  // If no channel mentioned, use current channel
  let targetChannel = message.mentions.channels.first() || message.channel;

  // Check if bot has permissions in the channel
  const permissions = targetChannel.permissionsFor(client.user);
  if (!permissions.has("SendMessages") || !permissions.has("EmbedLinks")) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("❌ Permission Error")
      .setDescription(
        `I don't have the required permissions in ${targetChannel}.\n\n` +
          "**Required Permissions:**\n" +
          "• Send Messages\n" +
          "• Embed Links"
      )
      .setTimestamp();
    return message.channel.send({ embeds: [errorEmbed] });
  }

  const success = await updateGuildChannel(message.guild.id, targetChannel.id);

  if (success) {
    const successEmbed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("📺 Announcement Channel Updated")
      .setDescription(
        `FlashNet status alerts will now be sent to ${targetChannel}.\n\n` +
          "🔔 You'll receive notifications here when the swap status changes."
      )
      .setFooter({ text: `Changed by ${message.author.tag}` })
      .setTimestamp();
    message.channel.send({ embeds: [successEmbed] });
  } else {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription("❌ Failed to update channel. Please try again.")
      .setTimestamp();
    message.channel.send({ embeds: [errorEmbed] });
  }
};

module.exports.desc = desc;
