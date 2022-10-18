"use strict";
const {Client,Events,GatewayIntentBits} = require('discord.js')
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

client.on('messageCreate', async(message) => {
    if(message.content === 'ping'){
        const reply = await message.reply('peng')
        reply.react('😘')
    }
})

client.on('messageReactionAdd', (reaction)=>{
    console.log(reaction)
})

client.login(process.env.TOKEN)