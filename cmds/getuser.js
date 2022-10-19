let desc = 'Displays user info'
module.exports = (client,message) => {
    let myuser = message.mentions.users.first() || message.author
    const Embed = {
        color: 0xFFFFFF,
        title: '',
        description:'',
        image: {url:myuser.displayAvatarURL()}
    }
    const member = message.guild.members.cache.get(myuser.id)
    myuser = client.users.cache.find(user => user.id === myuser.id)
    Embed.title+=myuser.username+'#'+myuser.discriminator
    Embed.color=myuser.accent_color
    Embed.description+='\nNickname: '+(member.nickname || '\`N/A\`\n')+'Joined \`'+message.guild.name+'\` since \`'+new Date(member.joinedTimestamp).toLocaleDateString()+'\`\n'
    Embed.description+='Joined Discord since \`'+new Date(myuser.createdTimestamp).toLocaleDateString()+'\`\nRoles count: '+`\`${member.roles.cache.size-1}\``
    message.channel.send({embeds:[Embed]})
}
module.exports.desc = desc