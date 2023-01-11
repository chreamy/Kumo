let desc = 'Repeat Message'
require('discord-reply');
module.exports = async (client,message,args) => {
    let out = (args[0]+'  ').repeat(args[1]);
        message.channel.send(`${out}`)
}
module.exports.desc = desc