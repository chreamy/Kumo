const userDataSchema = require("../../schemas/userdata-schema")

module.exports.messagecount = async (message)=> {
    await userDataSchema.findOneAndUpdate({
        _id: message.author.id
    },{
        _id: message.author.id,
        $inc:{
            messageCount: 1,
        },
    },{
        upsert: true
    })
}