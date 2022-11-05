const userDataSchema = require("../../schemas/userdata-schema");

let desc = 'Display the total messages'
module.exports = async (client,message,args) => {
    const user = message.mentions.users.first() || message.author;
    const userdata = await userDataSchema.findOne({
        _id: user.id,
    })
    const Embed = {
        color: 0xFFFFFE,
        title: `message count: ${userdata.messageCount}`,
    }
    message.channel.send({ embeds: [Embed] });
}
module.exports.desc = desc