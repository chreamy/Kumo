//const mongoose = require('mongoose')
const {Client,Events,GatewayIntentBits} = require('discord.js')
require('dotenv/config')
//const config = require('./config.json')
const {command} = require('./command')
//const testSchema = require('./test-schema') 
//+------------------------------------------+
//         cmd list
let cmdlist = {
    'misc':{
        'ping':'ping',
        'help':['help','h'],
        'avatar':['avatar','ava'],
        'servers':['servers','server'],
        'userinfo':['userinfo','ui','info','getuser','gu'],
    },
    'fun':{
        'spam':'spam'
    },
    'util':{
        'changeprefix':['changeprefix','prefix']
    }
}
exports.cmdlist = cmdlist
const ping = require('./cmds/misc/ping')
const help = require('./cmds/misc/help')
const avatar = require('./cmds/misc/avatar')
const servers = require('./cmds/misc/servers')
const userinfo = require('./cmds/misc/userinfo')
const spam = require('./cmds/fun/spam')
const changeprefix = require('./cmds/util/changeprefix')
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
    //await mongoose.connect(process.env.MONGO_URI,{keepAlive: true})
    //await new testSchema({
    //    message: 'hello world'
    //}).save()
    console.log('bot is ready')
    for (const [category,cat_commands] of Object.entries(cmdlist)) {
    for (const [key, value] of Object.entries(cat_commands)) {
        command(client,value,eval(key))
      }
    }
})


client.login(process.env.TOKEN)