fetch = require('node-fetch')
let desc = 'make pfp discord color'
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
module.exports = {deepfry, captcha, discordcolor}
module.exports.desc = {'deepfry':'Deepfry an image',
'discordcolor':'Make an image into discord color',
'captcha':'Turn an image into captcha'}
module.exports.detaileddesc = {}