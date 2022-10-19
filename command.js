const {prefix} = require('./config.json')
module.exports.command = (client, aliases, callback) => {
    if(typeof aliases === 'string'){
        aliases = [aliases]
    }
    client.on('messageCreate',message =>{
        const {content} = message;
        aliases.forEach(alias => {
            const command = `${prefix}${alias}`
            if(content.startsWith(`${command} `)||content===command){
                callback(client,message)
            }
        })
    })
}