const mongoose = require("mongoose")
const {Client,Events,GatewayIntentBits} = require('discord.js')
require('dotenv/config')
const config = require('./config.json')
const {command} = require('./command')
const guildSchema = require("./schemas/guild-schema");
let defaultPrefix = '!';
//+------------------------------------------+
//         event list
const {msgevents} = require('./events/msgevents')
const {joinguild} = require('./events/guildevents/joinguild')
//         end event list
//+------------------------------------------+
//         cmd list
let cmdlist = {
    'actions':{
        'angry':'angry',
        'bite':'bite',
        'bored':'bored',
        'hug':['hug','cuddle'],
        'kill':'kill',
        'kiss':'kiss',
        'lick':'lick',
        'pat':'pat',
        'poke':'poke',
        'pregnant':'pregnant',
        'slap':'slap',
        'spank':'spank',
        'tickle':'tickle'
    },
    'fun':{
        'spam':'spam',
    },
    'image':{
        //'captcha':'captcha',
        'deepfry':['deepfry','df'],
        'discordcolor':['discordcolor','dc'],
        'whowouldwin' : ['whowouldwin','www'],
    },
    'misc':{
        'ping':'ping',
        'echo':['echo','e'],
        'help':['help','h'],
        'servers':['servers','server'],
        'repeat':'repeat',
    },
    'user':{
        'avatar':['avatar','ava'],
        'userinfo':['userinfo','ui','info','getuser','gu'],
        'messagecount':['messagecount','mc'],
    },
    'util':{
        'changeprefix':['changeprefix','prefix']
    },
    'nsfw':{   
            'porn':['porn','nsfw'],
            'hentai':'hentai',
        },
}
exports.cmdlist = cmdlist
const ping = require('./cmds/misc/ping')
const echo = require('./cmds/misc/echo')
const help = require('./cmds/misc/help')
const repeat = require('./cmds/misc/repeat')
const avatar = require('./cmds/user/avatar')
const servers = require('./cmds/misc/servers')
const userinfo = require('./cmds/user/userinfo')
const spam = require('./cmds/fun/spam')
const {whowouldwin, discordcolor,deepfry,captcha} = require('./cmds/image/image')
const porn = require('./cmds/nsfw/porn')
const hentai = require('./cmds/nsfw/hentai')
const {angry,bite,bored,hug,kill,kiss,lick,pat,poke,pregnant,slap,spank,tickle} = require('./cmds/actions/actions')
const changeprefix = require('./cmds/util/changeprefix')
const messagecount = require('./cmds/user/messagecountcmd')
//         end cmd list
//+------------------------------------------+

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})
client.on('ready', async () =>{
    console.log('bot is ready')
    client.channels.fetch('1032596705201356810')
    .then(channel=>channel.send('**Back Online**'))
    mongoose.connect(process.env.MONGO_URI,{
        keepAlive: true
    })
})

client.on('messageCreate', async message =>{
    if (!message.guild) return;
    if (message.author == client.user) return;
    if (message.author.bot) return;
    msgevents(message)
    const guilddb = await guildSchema.findOne({_id:message.guild.id})
    guildPrefix = guilddb.prefix
    if (!guildPrefix) guildPrefix = defaultPrefix;
    if (message.content.startsWith('<@1032039037990600766>')) message.channel.send({embeds: [{color: 0xFFFFFE,description: `Use server prefix \`${guildPrefix}\` to call commands`}]})
    let args = message.content.slice(guildPrefix.length).split(' ');
    args = args.filter(element => {if (Object.keys(element).length !== 0) {return true;}return false;})
    if (!message.content.startsWith(guildPrefix)) return;
    const {content} = message;
    for (const [category,cat_commands] of Object.entries(cmdlist)) {
        for (const [key, value] of Object.entries(cat_commands)) {
            command(client,value,eval(key),message,args)
          }
        }
})

client.on("guildCreate", function(guild){
    joinguild(guild);
});

client.login(process.env.TOKEN)
