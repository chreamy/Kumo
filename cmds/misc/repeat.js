let desc = 'Repeat Message for a given amount of times'
module.exports = async (client,message,args) => {
    let out = ''
    for (let i = 0; i < args[1]; i++) {
        out += args[0]+' '
    }
    message.channel.send(`${out}`)
}
module.exports.desc = desc