fetch = require('node-fetch')
let desc = 'make pfp discord color'
module.exports = async (client,message,args) => {
    const user = message.mentions.users.first() || message.author
    //const files = await message.getImage();
		//if (!Array.isArray(files)) return;
        try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${user.displayAvatarURL()}`)).then(res => res.json());

            const Embed = {
                color: 0xFFFFFE,
                title: 'Discord Color',
                image:  {url:json.message}
            }
			message.channel.send({ embeds: [Embed] });
		} catch(err) {
			if (message.deletable) message.delete();
		}
}
module.exports.desc = desc