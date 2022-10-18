const {Client, GatewayIntentBits} = require('discord.js')
require('dotenv/config')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

client.on('bot ready', () =>{
    console.log('ready')
})

client.on('messageCreate',(message) => {
    if(message.content === 'ping'){
        message.reply('pong')
    }
})

client.login(process.env.TOKEN)