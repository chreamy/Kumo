fetch = require('node-fetch')
const { post } = require('axios')
function geturl(message){
    const user = message.mentions.users.first() || message.author
    const attachment = message.attachments.first();
    let url = attachment ? attachment.url : null
    if(attachment){
        if(attachment.width>1000||attachment.height>1000){
            message.channel.send('*Image too big (Max: 1000x1000)*')
            return
        }
    }
    if (!url){url = user.displayAvatarURL()}
    return url
}
function geturl2(message,args){
    if(!message.mentions.users.at(0)){message.channel.send('Invalid format');return false}
    if(args[1]&&message.mentions.users.at(0)&&message.mentions.users.at(1)){
        return [message.mentions.users.at(0).displayAvatarURL(),message.mentions.users.at(1).displayAvatarURL()]
    }else{
        return [message.author.displayAvatarURL(),message.mentions.users.at(0).displayAvatarURL()]
    }
}
async function genImg(message,api){
    const msg = await message.channel.send('**generating image...** *(Dependent on file size)*')
        try {
			const json = await fetch(encodeURI(`${api}`)).then(res => res.json());
            const Embed = {
                color: 0xFFFFFE,
                image:  {url:json.message}
            }
			message.channel.send({ embeds: [Embed] });
		} catch(err) {
			if (message.deletable) message.delete();
		}
        msg.delete();
}

const deepfry = (client,message,args)=>{
    const api = `https://nekobot.xyz/api/imagegen?type=deepfry&image=${geturl(message)}`
    genImg(message,api)
} 
const captcha = (client,message,args)=>{
    const api =`https://nekobot.xyz/api/imagegen?type=captcha&username=${message.mentions.users.first() || message.author}&url=${geturl(message)}`
    genImg(message,api)
} 
const discordcolor = (client,message,args)=>{
    const api =`https://nekobot.xyz/api/imagegen?type=blurpify&image=${geturl(message)}`
    genImg(message,api)
} 
const whowouldwin = (client,message,args)=>{
    if(geturl2(message,args)) genImg(message,`https://nekobot.xyz/api/imagegen?type=whowouldwin&user1=${geturl2(message,args)[0]}&user2=${geturl2(message,args)[1]}`)
} 
module.exports = {whowouldwin, deepfry, captcha, discordcolor}
module.exports.desc = {
'approved':'Do check mark',
'deepfry':'Deepfry an image',
'discordcolor':'Make an image into discord color',
'captcha':'Turn an image into captcha'}
module.exports.detaileddesc = {}