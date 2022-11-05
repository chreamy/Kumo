//+------------------------------------------+
//         events list
const {repeat} = require("./events/repeat")
const {messagecount} = require("./events/messagecount")
//         end event list
//+------------------------------------------+

module.exports.events = (message) =>{
    repeat(message)
    messagecount(message)
}