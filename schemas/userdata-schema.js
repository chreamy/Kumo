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
    },
    level:{
        type: Number,
        required: true,
        default: 1,
    }
});
const name = "userdata";
module.exports = models[name] || model(name, userDataSchema);