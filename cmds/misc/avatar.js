let desc = 'Displays avatar of the sender, or the person mentioned'
module.exports = (client,message,args) => {
    const user = message.mentions.users.first() || message.author;
    const Embed = {
        color: 0xFFFFFE,
        title: `${user.username}'s Avatar`,
        image: {url:user.displayAvatarURL()}
    }
    
    message.channel.send({ embeds: [Embed] });
}
module.exports.desc = desc