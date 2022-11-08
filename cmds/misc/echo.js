let desc = 'Repeat Message'
module.exports = (client,message,args) => {
    let out = ''
    args.forEach(element => {
        out += element+' '
    });
    message.channel.send(`${out}`)
}
module.exports.desc = desc