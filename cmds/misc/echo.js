let desc = 'Repeat Message'
module.exports = (client,message,args) => {
    let out = ''
    args.forEach(element => {
        out += element+' '
    });
    message.channel.send(`${out}`)
    if (message.deletable) message.delete();
}
module.exports.desc = desc