const {Schema, model, models} = require("mongoose")
const guildSchema = new Schema({
    _id: {
        //Guild  user id
        type: String,
        required: true
    },
    prefix:{
        type: String,
        required: true,
        default: '!',
    }
});
const name = "guild";
module.exports = models[name] || model(name, guildSchema);