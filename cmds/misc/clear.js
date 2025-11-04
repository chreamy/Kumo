const { EmbedBuilder, PermissionsBitField } = require("discord.js");

let desc = "Bulk delete a number of recent messages (1-100, <14 days)";

module.exports = async (client, message, args) => {
  // Require Manage Messages permission for user and bot
  const userHasPerm = message.member.permissions.has(
    PermissionsBitField.Flags.ManageMessages
  );
  const botHasPerm = message.guild.members.me?.permissions.has(
    PermissionsBitField.Flags.ManageMessages
  );

  if (!userHasPerm) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription(
        "🔒 You need the Manage Messages permission to use this command."
      )
      .setTimestamp();
    return message.channel.send({ embeds: [embed] });
  }

  if (!botHasPerm) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setDescription(
        "❌ I don't have the Manage Messages permission in this server."
      )
      .setTimestamp();
    return message.channel.send({ embeds: [embed] });
  }

  const amount = parseInt(args[0], 10);

  if (!amount || isNaN(amount)) {
    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setTitle("⚠️ Missing amount")
      .setDescription(
        "Please specify how many messages to delete.\n\n" +
          "Usage: `!clear <amount>`\n" +
          "Example: `!clear 25`"
      )
      .setTimestamp();
    return message.channel.send({ embeds: [embed] });
  }

  if (amount < 1 || amount > 100) {
    const embed = new EmbedBuilder()
      .setColor(0xf39c12)
      .setDescription("⚠️ Amount must be between 1 and 100.")
      .setTimestamp();
    return message.channel.send({ embeds: [embed] });
  }

  try {
    // Delete command message as well if possible
    await message.delete().catch(() => {});

    const deleted = await message.channel.bulkDelete(amount, true);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("🧹 Cleaned Up")
      .setDescription(
        `Deleted **${deleted.size}** message(s).` +
          (deleted.size < amount
            ? "\nNote: Messages older than 14 days cannot be deleted."
            : "")
      )
      .setTimestamp();

    const confirm = await message.channel.send({ embeds: [embed] });
    setTimeout(() => confirm.delete().catch(() => {}), 5000);
  } catch (error) {
    const embed = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle("❌ Failed to delete messages")
      .setDescription(error?.message || String(error))
      .setTimestamp();
    return message.channel.send({ embeds: [embed] });
  }
};

module.exports.desc = desc;
