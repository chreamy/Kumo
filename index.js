const mongoose = require("mongoose")
const {Client,Events,GatewayIntentBits} = require('discord.js')
require('dotenv/config')
const config = require('./config.json')
const {command} = require('./command')
const {events} = require('./eventshandler')
//+------------------------------------------+
//         cmd list
let cmdlist = {
    'fun':{
        'spam':'spam'
    },
    'misc':{
        'ping':'ping',
        'help':['help','h'],
        'servers':['servers','server'],
    },
    'user':{
        'avatar':['avatar','ava'],
        'userinfo':['userinfo','ui','info','getuser','gu'],
        'messagecount':['messagecount','mc'],
    },
    'util':{
        'changeprefix':['changeprefix','prefix']
    }
}
exports.cmdlist = cmdlist
const ping = require('./cmds/misc/ping')
const help = require('./cmds/misc/help')
const avatar = require('./cmds/user/avatar')
const servers = require('./cmds/misc/servers')
const userinfo = require('./cmds/user/userinfo')
const spam = require('./cmds/fun/spam')
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
    for (const [category,cat_commands] of Object.entries(cmdlist)) {
    for (const [key, value] of Object.entries(cat_commands)) {
        command(client,value,eval(key))
      }
    }
})

client.on("messageCreate",  async message => {
    message.author.id!=1032039037990600766 ?events(message):null;
});

client.login(process.env.TOKEN)