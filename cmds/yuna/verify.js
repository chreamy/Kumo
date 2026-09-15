const {
  isVerifyChannel,
  buildHelpEmbed,
  ensureVerifyPanel,
} = require("../../util/yunaVerify");

let desc =
  "Yuna holder verification panel (OpenSea bio + modal)";

module.exports = async (client, message, args) => {
  if (!isVerifyChannel(message.guild?.id, message.channel.id)) {
    return;
  }

  if ((args[0] || "").toLowerCase() === "setup") {
    await ensureVerifyPanel(client, { forceNew: true });
    return message.channel.send("Posted a new verification panel.");
  }

  return message.channel.send({
    embeds: [buildHelpEmbed(message.author)],
  });
};

module.exports.desc = desc;
