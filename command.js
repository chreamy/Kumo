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
                let arg = `${content.slice(command.length)}`
                let args = arg.split(" ").filter(element => {if (Object.keys(element).length !== 0) {return true;}return false;});
                callback(client,message,args)
            }
        })
    })
}