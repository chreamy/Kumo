//const prefix = require('discord-prefix');
let defaultPrefix = '!';
module.exports.command = (client, aliases, callback) => {
    if(typeof aliases === 'string'){
        aliases = [aliases]
    }
    client.on('messageCreate',message =>{
        if (!message.guild) return;
        let guildPrefix = '!'//prefix.getPrefix(message.guild.id);
        if (!guildPrefix) guildPrefix = defaultPrefix;
        let args = message.content.slice(guildPrefix.length).split(' ');
        args = args.filter(element => {if (Object.keys(element).length !== 0) {return true;}return false;})
        if (!message.content.startsWith(guildPrefix)) return;
        const {content} = message;
        aliases.forEach(alias => {
            const command = `${alias}`
            if(`${args[0]}`.toLowerCase()===`${command}`){
                
                args = args.slice(1)
                callback(client,message,args)
            }
        })
    })
}