module.exports = (client,message,args) => {
    let myuser = message.mentions.users.first() || message.author
    const Embed = {
        color: 0xFFFFFE,
        title: '',
        description:'',
        image: {url:myuser.displayAvatarURL()}
    }
    const member = message.guild.members.cache.get(myuser.id)
    myuser = client.users.cache.find(user => user.id === myuser.id)
    Embed.title+=myuser.username+'#'+myuser.discriminator
    Embed.color=myuser.accent_color
    Embed.description+='\nNickname: '+(`\`${member.nickname||'N/A'}\`\n` || '\`N/A\`\n')+'Joined \`'+message.guild.name+'\` since \`'+new Date(member.joinedTimestamp).toLocaleDateString()+'\`\n'
    Embed.description+='Joined Discord since \`'+new Date(myuser.createdTimestamp).toLocaleDateString()+'\`\nRoles count: '+`\`${member.roles.cache.size-1}\``
    message.channel.send({embeds:[Embed]})
}
let desc = 'Displays user info'
let detaildesc = `Use this function to see the basic info of the @mentioned user
or the sender, if unspecified

*Example: !userinfo <@&1032042952744247309>*
`
module.exports.desc = desc
module.exports.detaildesc = detaildesc