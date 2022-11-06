const Anime_Images = require('anime-images-api')
let desc = 'NSFW anime images'
const axios = require('axios')
module.exports = async (client,message,args) => {
    if (!message.channel.nsfw) {
        const Embed = {
            color: 0xFFFFFE,
            description : "*This command is only allowed in a NSFW channel*"
        }
        message.channel.send({ embeds: [Embed] });
        return
    }
    const msg = await message.channel.send('**Fetching...**')
    
    
    try {
    const API = new Anime_Images()
    let { image } = await API.nsfw.hentai()
                    msg.delete();
					const Embed = {
                        color: 0xFFFFFE,
                        image: {url:image}
                    }
					message.channel.send({ embeds: [Embed] });
    }catch (err) {
        if (message.deletable) message.delete();
        msg.delete();
    }
}
module.exports.desc = desc