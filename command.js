
module.exports.command = async(client, aliases, callback,message,args) => {
    if(typeof aliases === 'string'){
        aliases = [aliases]
    }
    aliases.forEach(alias => {
        const command = `${alias}`
        if(`${args[0]}`.toLowerCase()===`${command}`){
            args = args.slice(1)
            callback(client,message,args)
        }
    })
}