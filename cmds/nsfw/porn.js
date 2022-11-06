let desc = 'NSFW images'
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
    let rand = Math.floor(Math.random() * 8);
    const msg = await message.channel.send('**Fetching...**')
    type = {0:'4k',1:'anal',2:'ass',3:'boobs',4:'gonewild',5:'pgif',6:'pussy',7:'thigh'}
    try {
    axios.get(`https://nekobot.xyz/api/image?type=${type[rand]}`)
				.then(res => {
                    msg.delete();
					const Embed = {
                        color: 0xFFFFFE,
                        image: {url:res.data.message}
                    }
					message.channel.send({ embeds: [Embed] });
				});
    }catch (err) {
        if (message.deletable) message.delete();
        msg.delete();
    }
}
module.exports.desc = desc