const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);
let desc = 'Generates AI Image'
module.exports = async (client,message,args) => {
  if(args.length===0){
    message.channel.send('inputs required');
    return
  }
  let p = '';
  for(let i=0;i<args.length;i++){
    p+=`${args[i]} `
  }
  const msg = await message.channel.send('**generating image...**')
        try {
          const response = await openai.createImage({
            prompt: p,
            n: 1,
            size: "1024x1024",
          });
          image_url = response.data.data[0].url;
		} catch(err) {
			message.channel.send(`you were trying to generate some sussy stuff weren't you?`);
      msg.delete();
      return
		}
        msg.delete();
  
      
    
      const Embed = {
        color: 0xFFFFFE,
        description: '',
        image: {url:image_url}
    }
    message.channel.send({ embeds: [Embed] });
}
module.exports.desc = desc
