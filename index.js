const mongoose = require("mongoose");
const { Client, Events, GatewayIntentBits } = require("discord.js");
require("dotenv/config");
const config = require("./config.json");
const { command } = require("./command");
const guildSchema = require("./schemas/guild-schema");
let defaultPrefix = "!";

//+------------------------------------------+
//         event list
const { msgevents } = require("./events/msgevents");
const { joinguild } = require("./events/guildevents/joinguild");
//         end event list
//+------------------------------------------+
//         cmd list
let cmdlist = {
  // fun: {
  //   spam: "spam",
  // },
  misc: {
    // gpt: "gpt",
    // ping: "ping",
    echo: ["echo", "e"],
    help: ["help", "h"],
    // servers: ["servers", "server"]
  },
  yuna: {
    genyuna: "genyuna",
    yuna: ["yuna", "y"]
  },
  // user: {
  //   avatar: ["avatar", "ava"],
  //   userinfo: ["userinfo", "ui", "info", "getuser", "gu"],
  //   messagecount: ["messagecount", "mc"],
  // },
  // util: {
  //   changeprefix: ["changeprefix", "prefix"],
  // },
};
exports.cmdlist = cmdlist;

// Importing command handlers
const ping = require("./cmds/misc/ping");
const gpt = require("./cmds/misc/gpt");
const echo = require("./cmds/misc/echo");
const help = require("./cmds/misc/help");
const avatar = require("./cmds/user/avatar");
const servers = require("./cmds/misc/servers");
const userinfo = require("./cmds/user/userinfo");
const spam = require("./cmds/fun/spam");
const generate = require("./cmds/image/generate");
const genyuna = require("./cmds/yuna/genyuna");
const yuna = require("./cmds/yuna/yuna");

const changeprefix = require("./cmds/util/changeprefix");
const messagecount = require("./cmds/user/messagecountcmd");
//         end cmd list
//+------------------------------------------+

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true, // Use the new URL parser
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

client.on("ready", async () => {
  console.log("Bot is ready");
  const currentdate = new Date();
  const datetime = `${currentdate.getDate()}/${
    currentdate.getMonth() + 1
  }/${currentdate.getFullYear()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;
  const Embed = {
    color: 0xfffffe,
    description: `**Back Online ${datetime}**`,
  };
  client.channels
    .fetch("1032596705201356810")
    .then((channel) => channel.send({ embeds: [Embed] }));
});

client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author === client.user) return;
  if (message.author.bot) return;
  const gptChannelId = "1328187329344442399";
  const guilddb = await guildSchema.findOne({ _id: message.guild.id });
  let guildPrefix = guilddb ? guilddb.prefix : defaultPrefix;
  // Handle events for specific channel
  if (
    message.channel.id === gptChannelId &&
    !message.content.startsWith(guildPrefix) &&
    !message.content.startsWith(">")
  ) {
    const args = message.content.trim().split(/\s+/); // Split message content into args
    try {
      // Trigger the GPT command directly
      await gpt(client, message, args);
    } catch (err) {
      console.error("Error triggering GPT command:", err);
    }
    return; // Prevent further processing for this message
  }
  msgevents(message);

  if (message.content.startsWith("<@1032039037990600766>")) {
    message.channel.send({
      embeds: [
        {
          color: 0xfffffe,
          description: `Use server prefix \`${guildPrefix}\` to call commands`,
        },
      ],
    });
  }

  if (!message.content.startsWith(guildPrefix)) return;

  const args = message.content
    .slice(guildPrefix.length)
    .split(/\s+/)
    .filter(Boolean);

  for (const [category, cat_commands] of Object.entries(cmdlist)) {
    for (const [key, value] of Object.entries(cat_commands)) {
      command(client, value, eval(key), message, args);
    }
  }
});

client.on("guildCreate", function (guild) {
  joinguild(guild);
});

client.login(process.env.TOKEN);
