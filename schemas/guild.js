const mongoose = require("mongoose");
const guildSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    required: true,
    default: "!",
  },
  pingEveryone: {
    type: Boolean,
    required: true,
    default: false,
  },
  channelId: {
    type: String,
  },
  pingRoleId: {
    type: String,
  },
});
module.exports = mongoose.model("Guild", guildSchema);
