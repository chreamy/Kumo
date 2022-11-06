const guildSchema = require("../../schemas/guild-schema")
module.exports.joinguild = async (guild) =>{
    await guildSchema.findOneAndUpdate({
        _id: guild.id
    },{
        _id: guild.id
    },{
        upsert: true
    })
}