let desc = "Simple command to check if the bot is alive";
module.exports = (client, message, args) => {
  message.channel.send(
    `Latency is **${Date.now() - message.createdTimestamp}** ms. `
  );
};
module.exports.desc = desc;
