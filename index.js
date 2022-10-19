
const {Client,Events,GatewayIntentBits} = require('discord.js')
require('dotenv/config')
const config = require('./config.json')
const {command} = require('./command')
//+------------------------------------------+
//         cmd list
let cmdlist = {
    'ping':'ping',
    'help':['help','h'],
    'avatar':['ava','avatar'],
    'servers':['servers','server'],
    'getuser':['getuser','gu']
}
exports.cmdlist = cmdlist
const ping = require('./cmds/ping')
const help = require('./cmds/help')
const avatar = require('./cmds/avatar')
const servers = require('./cmds/servers')
const getuser = require('./cmds/getuser')
//         end cmd list
//+------------------------------------------+

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})
client.on('ready', () =>{
    console.log('bot ready')
    for (const [key, value] of Object.entries(cmdlist)) {
        command(client,value,eval(key))
      }
})


client.login(process.env.TOKEN)