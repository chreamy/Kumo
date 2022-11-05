const {Schema, model, models} = require("mongoose")
const userDataSchema = new Schema({
    _id: {
        //Discord  user id
        type: String,
        required: true
    },
    messageCount:{
        type: Number,
        required: true
    }
});
const name = "userdata";
module.exports = models[name] || model(name, userDataSchema);