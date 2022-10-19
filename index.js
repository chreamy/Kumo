"use strict";
const {Client,Events,GatewayIntentBits} = require('discord.js')
require('dotenv/config')
const config = require('./config.json')
const command = require('./command')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

client.on('ready', () =>{
    console.log('bot ready')
    command(client,'ping',message =>{
        message.reply('pong')
    })
})

client.on('messageCreate', async(message) => {
    if(message.content === 'ping'){
        const reply = await message.reply('pong')
        reply.react('😘')
    }
})

client.on('messageReactionAdd', (reaction)=>{
    console.log(reaction)
})

client.login(process.env.TOKEN)