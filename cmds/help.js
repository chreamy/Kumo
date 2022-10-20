let desc = 'Displays a list of available commands'
const {cmdlist} = require('./../index.js')
let importdesc = null

const Embed = {
	color: 0xFFFFFF,
	title:'Commands List',
    description: ''
}

module.exports = (client,message,args)=>{
    let out =''
    let funcname
    for (const [key, value] of Object.entries(cmdlist)) {
        let aliases = value
        if(typeof aliases === 'string'){
            aliases = [aliases]
        }
        funcname = key.charAt(0).toUpperCase() + key.slice(1)
        importdesc = require(`./${key}.js`).desc
        out += '**' +funcname+'**\n> '+importdesc+'\n*usage:'
        aliases.forEach(val =>{
            out += ' !'+val
        })
        out += '*\n\n'
        Embed.description = out
    }
    message.channel.send({ embeds: [Embed] })
}
module.exports.desc = desc