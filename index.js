const mongoose = require('mongoose')
const {Client,Events,GatewayIntentBits} = require('discord.js')
require('dotenv/config')
const config = require('./config.json')
const {command} = require('./command')
const testSchema = require('./test-schema') 
//+------------------------------------------+
//         cmd list
let cmdlist = {
    'ping':'ping',
    'help':['help','h'],
    'avatar':['ava','avatar'],
    'servers':['servers','server'],
    'userinfo':['userinfo','ui','info','getuser','gu'],
    'spam':'spam'
}
exports.cmdlist = cmdlist
const ping = require('./cmds/ping')
const help = require('./cmds/help')
const avatar = require('./cmds/avatar')
const servers = require('./cmds/servers')
const userinfo = require('./cmds/userinfo')
const spam = require('./cmds/spam')
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
    await mongoose.connect(process.env.MONGO_URI,{keepAlive: true})
    await new testSchema({
        message: 'hello world'
    }).save()
    console.log('bot ready')
    for (const [key, value] of Object.entries(cmdlist)) {
        command(client,value,eval(key))
      }
})


client.login(process.env.TOKEN)