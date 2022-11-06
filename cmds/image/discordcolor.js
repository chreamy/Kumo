fetch = require('node-fetch')
let desc = 'make pfp discord color'
module.exports = async (client,message,args) => {
    const user = message.mentions.users.first() || message.author
    const attachment = message.attachments.first();
    let url = attachment ? attachment.url : null;
    if (!url){url = user.displayAvatarURL()}
    const msg = await message.channel.send('**generating image...** *(Dependent on file size)*')
        try {
			const json = await fetch(encodeURI(`https://nekobot.xyz/api/imagegen?type=blurpify&image=${url}`)).then(res => res.json());

            const Embed = {
                color: 0xFFFFFE,
                title: 'Discord Color',
                image:  {url:json.message}
            }
			message.channel.send({ embeds: [Embed] });
		} catch(err) {
			if (message.deletable) message.delete();
		}
        msg.delete();
}
module.exports.desc = desc