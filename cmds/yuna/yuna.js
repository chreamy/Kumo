let desc = "Show a specific Yuna NFT by number (1-3333)";

module.exports = async (client, message, args) => {
  if (!args[0]) {
    return message.reply(
      "Please provide a number! Usage: !yuna <number> (1-3333)"
    );
  }

  const number = parseInt(args[0], 10);

  if (isNaN(number) || number < 1 || number > 3333) {
    return message.reply(
      "Please provide a valid number between 1 and 3333!"
    );
  }

  return message.channel.send(`https://cdn.yuzo.xyz/${number}`);
};

module.exports.desc = desc;
