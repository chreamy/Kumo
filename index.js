const {Client, GatewayIntentBits} = require('discord.js')
require('dotenv/config')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

client.on('ready', () =>{
    console.log('bot ready')
})

client.on('messageCreate',(message) => {
    if(message.content === 'ping'){
        message.reply('peng')
    }
})

client.login(process.env.TOKEN)