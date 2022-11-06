const axios = require('axios')
function send (message,type){
    let myuser = message.mentions.users.first() || message.author
    let t = ''
    const me = message.guild.members.cache.get(message.author.id).nickname || message.author.username
    if(message.mentions.users.first()==message.author){
        const name = message.guild.members.cache.get(myuser.id).nickname || myuser.username
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
        t=to[type]
    }else if(message.mentions.users.first()==myuser){
        const name = message.guild.members.cache.get(myuser.id).nickname || myuser.username
        const to ={
            'angry':`${me} is angry at ${name}`,
            'bite':`${me} bit ${name} (lol amy thanks for correcting my grammar)`,
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
        t=to[type]
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
        t=self[type]
    }
    let key = type
    if(type=='hug')key='cuddle'
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
const angry = (client,message,args)=>{send(message,'angry')} 
const bored = (client,message,args)=>{send(message,'bored')} 
const bite = (client,message,args)=>{send(message,'bite')} 
const hug = (client,message,args)=>{send(message,'hug')} 
const kill = (client,message,args)=>{send(message,'kill')} 
const kiss = (client,message,args)=>{send(message,'kiss')} 
const lick = (client,message,args)=>{send(message,'lick')} 
const pat = (client,message,args)=>{send(message,'pat')} 
const poke = (client,message,args)=>{send(message,'poke')} 
const pregnant = (client,message,args)=>{send(message,'pregnant')} 
const slap = (client,message,args)=>{send(message,'slap')} 
const spank = (client,message,args)=>{send(message,'spank')} 
const tickle = (client,message,args)=>{send(message,'tickle')} 
module.exports = {angry,bite,bored,hug,kill,kiss,lick,pat,poke,pregnant,slap,spank,tickle}
module.exports.desc = {'angry':`Show that you're angry`,
'bite':`@someone to bite`,
'bored':`Express your boredom`,
'hug':`@someone to hug`,
'kill':`@someone to kill`,
'kiss':`@someone to kiss`,
'lick':`@someone to lick`,
'pat':`@someone to pat`,
'poke':`@someone to poke`,
'pregnant':`Make @someone pregnant`,
'slap':`@someone to slap`,
'spank':`@someone to spank`,
'tickle':`@someone to tickle`,}
module.exports.detaileddesc = {}