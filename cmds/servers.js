let desc = 'Displays all servers this bot is in'
const Embed = {
	color: 0xFFFFFF,
    description: '**Server List**\n\n'
}
module.exports = (client,message) => {
    client.guilds.cache.forEach((guild) =>{0
        Embed.description+=`*${guild.name}*\n\`id: ${guild.id}\`\n\n`
    })
    message.channel.send({ embeds: [Embed] })
}
module.exports.desc = desc