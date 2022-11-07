let desc = 'Displays a list of available commands'
const {cmdlist} = require('../../index.js')
let importdesc = null
const fs = require("fs")

function printcategories(){
    let out =''
    for (const [category, cat_commands] of Object.entries(cmdlist)) {
        if(category!='nsfw'){
        out += '**'+category.toUpperCase()+'**\n\`'
        for (const [key, value] of Object.entries(cat_commands)) {
            out += key+' '
        }
        out += '\`\n\n'
    }
    }
    out += `\`For commands in each categories, use !help {category}\``
    return out
}
function printcmddesc(category,cmd_name){
    let out = ''
    try{
        importdesc = require(`./../${category}/${cmd_name}.js`).desc
    }catch{
        try{
        importdesc = require(`./../${category}/${category}.js`).desc[`${cmd_name}`]
        }catch{
            importdesc = undefined
        }
    }
    out += '\`Purpose:\` *'+importdesc+'*\n\n'
    try{
        importdetaildesc = require(`./../${category}/${cmd_name}.js`).detaildesc
    }catch{
        try{
            importdetaildesc = require(`./../${category}/${category}.js`).detaildesc ? require(`./../${category}/${category}.js`).detaildesc[`${cmd_name}`]:undefined
        }catch{
            importdetaildesc = undefined
        }
    }
    if(importdetaildesc!==undefined){
        out += '\`Description:\`\n'+importdetaildesc
    }
    return out
}

function printcommands(cat_name){
    let funcname
    let out =``
    for (const [key, value] of Object.entries(eval(`cmdlist.${cat_name}`))) {
        let aliases = value
        if(typeof aliases === 'string'){
            aliases = [aliases]
        }
        funcname = key.charAt(0).toUpperCase() + key.slice(1)
        try{
            importdesc = require(`./../${cat_name}/${key}.js`).desc
        }catch{
            try{
                importdesc = require(`./../${cat_name}/${cat_name}.js`).desc[`${key}`]
            }catch{
                importdesc = undefined
            }
        }
        out += '**' +funcname+'**\n> '+importdesc+'\n*usage:'
        aliases.forEach(val =>{
            out += ' !'+val
        })
        out += '*\n\n'
    }
    out +=`\`For each command's details, use !help {command name}\``
    return out
}

module.exports = (client,message,args)=>{
    const Embed = {
        color: 0xFCA8FF,
        title:'',
        description: ''
    }    
    if(args[0]!==undefined){
        found = false
        for (const [category,cat_commands] of Object.entries(cmdlist)) {
            for (const [key, value] of Object.entries(cat_commands)) {
                let valuearr = value
                if(typeof valuearr === 'string'){
                    valuearr = [valuearr]
                }
                valuearr.forEach((alias)=>{
                    if(alias===args[0]){
                        found = true
                        Embed.title = key.toUpperCase()
                        if(valuearr.length>1){Embed.title += ` (${valuearr.slice(1)})`}
                        Embed.description = printcmddesc(category,key)
                    }
                })
            }
        }
        for (const [category,cat_commands] of Object.entries(cmdlist)) {
            if(category===args[0]){
                found = true
                Embed.title = 'List of '+category+' commands'
                Embed.description = printcommands(args[0])
            }
        }
        if(!found){
            Embed.description = '*'+args[0]+' is not a command*'
        }
    }else{
        Embed.title = 'Command List'
        Embed.description = printcategories()
    }
    message.channel.send({ embeds: [Embed] })
}
module.exports.desc = desc