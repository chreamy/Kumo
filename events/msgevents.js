//+------------------------------------------+
//         events list
const { messagecount } = require("./msgevents/messagecount");
//         end event list
//+------------------------------------------+

module.exports.msgevents = async (message) => {
  messagecount(message);
};
