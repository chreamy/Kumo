
//const {Client,Events,GatewayIntentBits} = require('discord.js')
const Commando = require('discord.js-commando')
const path = require('path')
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

const client = new Commando.CommandoClient({
    owner: '532331965651877888',
    commandPrefix: config.prefix,
    invite: 'https://discord.gg/frECbWEpzR',
})
client.registry
	.registerDefaultTypes()
	//.registerGroups([
	//	['first', 'Your First Command Group'],
	//	['second', 'Your Second Command Group'],
	//])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'cmds'));
client.on('ready', () =>{
    console.log('bot ready')
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
	client.user.setActivity('with Commando');
    //for (const [key, value] of Object.entries(cmdlist)) {
    //    command(client,value,eval(key))
     // }
})


client.login(process.env.TOKEN)