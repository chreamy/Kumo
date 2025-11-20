// Core dependencies
const mongoose = require("mongoose");
const { EmbedBuilder } = require("discord.js");
require("dotenv/config");
const config = require("./config.json");
const { command } = require("./command");
const { client } = require("./util/client");
const { getGuildSettings } = require("./util/guild");
const serviceManager = require("./service");
const { processTokenMessage } = require("./util/tokenDetector");

let defaultPrefix = "!";

let cmdlist = {
    // fun: {
    //   spam: "spam",
    // },
    flashnet: {
        ping: ["ping", "p"],
        status: ["status", "s"],
    },
    spark: {
        stats: ["tokenstats", "stats", "token"],
        top: ["top"],
        gains: ["gains", "ga"],
        newtokens: ["new", "newtokens"],
        lookup: ["lookup", "token-info", "ti"],
    },
    setup: {
        prefix: ["prefix", "setprefix"],
        setping: ["setping", "pingeveryone"],
        channel: ["setchannel", "channel"],
        settings: ["settings", "config"],
    },
    misc: {
        help: ["help", "h"],
        clear: ["clear", "purge"],
        echo: ["echo", "e"],
    },
    yuna: {
        genyuna: "genyuna",
        yuna: ["yuna", "y"],
    },
    brc20: {
        brc20: ["brc20", "b"],
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
const ping = require("./cmds/flashnet/ping");
const status = require("./cmds/flashnet/status");
const prefix = require("./cmds/setup/prefix");
const setping = require("./cmds/setup/setping");
const channel = require("./cmds/setup/channel");
const settings = require("./cmds/setup/settings");
const clear = require("./cmds/misc/clear");
const stats = require("./cmds/spark/stats");
const top = require("./cmds/spark/top");
const gains = require("./cmds/spark/gains");
const newtokens = require("./cmds/spark/new");
const lookup = require("./cmds/spark/lookup");
const brc20 = require("./cmds/brc20/brc20");
//         end cmd list
//+------------------------------------------+

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true, // Use the new URL parser
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

client.on("ready", async () => {
    console.log(`Bot is ready as ${client.user.tag}`);
    const currentdate = new Date();
    const datetime = `${currentdate.getDate()}/${
        currentdate.getMonth() + 1
    }/${currentdate.getFullYear()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;

    console.log(`Ready at: ${datetime}`);

    // Modern styled embed
    const readyEmbed = new EmbedBuilder()
        .setTitle("🟢 Bot Online")
        .setColor(0x2ecc71) // Green color
        .addFields(
            {
                name: "📊 Statistics",
                value: `\`\`\`yml\nServers: ${client.guilds.cache.size}\nUsers: ${client.users.cache.size}\nChannels: ${client.channels.cache.size}\`\`\``,
                inline: true,
            },
            {
                name: "⚡ Services",
                value: "```diff\n+ Health Monitor\n+ Token Stream\n+ Multi-Server Support```",
                inline: true,
            },
            {
                name: "🕐 Started At",
                value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                inline: false,
            }
        )
        .setFooter({
            text: `${client.user.tag} • Ready`,
            iconURL: client.user.displayAvatarURL(),
        });

    // Send to original channel
    client.channels
        .fetch("1032596705201356810")
        .then((channel) => channel.send({ embeds: [readyEmbed] }))
        .catch(() =>
            console.log("Could not send ready message to original channel")
        );

    // Start background services
    try {
        await serviceManager.startServices();
    } catch (e) {
        console.error("Failed to start services:", e);
    }
});

client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author === client.user) return;
    if (message.author.bot) return;

    // Get guild settings from database
    const guildSettings = await getGuildSettings(message.guild.id);
    const guildPrefix = guildSettings?.prefix || defaultPrefix;

    let tokenDetected = false;
    try {
        tokenDetected = await processTokenMessage(message);
    } catch (error) {
        console.error("Error processing token detection:", error);
    }

    if (tokenDetected) {
        return;
    }

    if (typeof msgevents !== "undefined") {
        msgevents(message);
    }

    // Bot mention handler
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

    // Command processing
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

client.on("guildCreate", async (guild) => {
    console.log(`Joined new guild: ${guild.name} (${guild.id})`);
    try {
        await getGuildSettings(guild.id);
        console.log(`Created database entry for guild: ${guild.name}`);
    } catch (error) {
        console.error(`Failed to create guild entry: ${error.message}`);
    }

    // Call original joinguild if defined
    if (typeof joinguild !== "undefined") {
        joinguild(guild);
    }
});

// Graceful shutdown handlers
process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    serviceManager.stopServices();
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    client.destroy();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\nShutting down...");
    serviceManager.stopServices();
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    client.destroy();
    process.exit(0);
});

client.login(process.env.TOKEN);
