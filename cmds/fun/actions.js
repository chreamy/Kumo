let desc = 'Performs actions to another user'
const axios = require('axios')
module.exports = (client,message,args) => {
    let myuser = message.mentions.users.first() || message.author
    if(myuser.id==1032039037990600766){message.channel.send('I\'m not doing this :P');return}
    let t = ''
    const me = message.guild.members.cache.get(message.author.id).nickname
    if(message.mentions.users.first()==message.author){
        const name = message.guild.members.cache.get(myuser.id).nickname
        const to ={
            'angry':`${me} is angry at themself`,
            'bite':`${me} bited themself`,
            'bored':`${me} is bored of themself`,
            'hug':`${me} hugged themself`,
            'cuddle':`${me} cuddled themself`,
            'kill':`${me} killed themself`,
            'kiss':`${me} kissed themself`,
            'lick':`${me} licked themself`,
            'pat':`${me} patted themself`,
            'poke':`${me} poked themself`,
            'pregnant':`${me} impregnated themself???`,
            'slap':`${me} slapped themself`,
            'spank':`${me} spanked themself`,
            'tickle':`${me} tickled themself`,
        }
        t=to[args[0]]
    }else if(message.mentions.users.first()==myuser){
        const name = message.guild.members.cache.get(myuser.id).nickname
        const to ={
            'angry':`${me} is angry at ${name}`,
            'bite':`${me} bited ${name}`,
            'bored':`${me} thinks ${name} is boring`,
            'hug':`${me} hugged ${name}`,
            'cuddle':`${me} cuddled ${name}`,
            'kill':`${me} killed ${name}`,
            'kiss':`${me} kissed ${name}`,
            'lick':`${me} licked ${name}`,
            'pat':`${me} patted ${name}`,
            'poke':`${me} poked ${name}`,
            'pregnant':`${me} made ${name} pregnant`,
            'slap':`${me} slapped ${name}`,
            'spank':`${me} spanked ${name}`,
            'tickle':`${me} tickled ${name}`,
        }
        t=to[args[0]]
    }else{
        const self ={
            'angry':`${me} is angry`,
            'bite':`${me} wants to bite someone`,
            'bored':`${me} is bored`,
            'hug':`${me} wants a hug`,
            'cuddle':`${me} wants to cuddle comeone`,
            'kill':`${me} is finding someone to kill`,
            'kiss':`${me} wants to get kissed`,
            'lick':`${me} is imagining ice cream`,
            'pat':`${me} wants some headpats`,
            'poke':`${me} is poking people randomly`,
            'pregnant':`${me} is pregnant`,
            'slap':`${me} wants to slap someone`,
            'spank':`${me} wants to get spanked`,
            'tickle':`${me} wants to tickle someone`,
        }
        t=self[args[0]]
    }
    let key = args[0]
    if(args[0]=='hug')key='cuddle'
    if(args[0]=='actions'){
        const Embed = {
        color: 0xFFFFFE,
        description : "use any actions from:\n*!bite !bored !cuddle !hug !kill !kiss !lick !pat !poke !pregnant !slap !spank !tickle*"
    }
    message.channel.send({ embeds: [Embed] });
    return}
    try {
    axios.get(`https://api.satou-chan.xyz/api/endpoint/${key}`)
				.then(res => {
					const Embed = {
                        color: 0xFFFFFE,
                        title: t,
                        image: {url:res.data.url}
                    }
					message.channel.send({ embeds: [Embed] });
				});
    }catch (err) {
        if (message.deletable) message.delete();
    }
}
module.exports.desc = desc