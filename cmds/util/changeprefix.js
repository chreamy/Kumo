const guildSchema = require("../../schemas/guild-schema")
module.exports = async (client,message,args) => {
    const Embed = {
        color: 0xA8CFFF,
        description:''
    }
    if(args[0]===undefined){
        Embed.description=`***Error:** No prefix provided*`
        message.channel.send({ embeds: [Embed] })
        return}
    await guildSchema.findOneAndUpdate({id:message.guild.id},{prefix:args[0]},{upsert:false})
    Embed.description=`*Prefix changed successfully to* \`${args[0]}\``
    message.channel.send({ embeds: [Embed] })
}
let desc = 'Changes bot prefix'
let detaildesc = `Customize prefix instead of default \`!\`
input any character(s) to work as new prefix

*Example: !changeprefix >*
`
module.exports.desc = desc
module.exports.detaildesc = detaildesc