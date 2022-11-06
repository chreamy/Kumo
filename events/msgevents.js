//+------------------------------------------+
//         events list
const {repeat} = require("./msgevents/repeat")
const {messagecount} = require("./msgevents/messagecount")
//         end event list
//+------------------------------------------+

module.exports.msgevents = async (message) =>{
    repeat(message)
    messagecount(message)
}