let desc = 'Repeat Message'
require('discord-reply');
module.exports = async (client,message,args) => {
    if(!message.author === '<@532331965651877888>')
{return}
    let out = message.content.substr(message.content.indexOf(" ") + 1);
    if(message.reference){
        message.channel.send({ content: out, reply: { messageReference: message.reference.messageId },allowedMentions: { repliedUser: false }});
    }else{
        message.channel.send(`${out}`)
    }
    if (message.deletable) message.delete();
}
module.exports.desc = desc