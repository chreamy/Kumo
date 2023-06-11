const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);
let desc = 'Generates Text'
module.exports = async (client,message,args) => {
  if(args.length===0){
    message.channel.send('inputs required');
    return
  }
  let p = '';
  for(let i=0;i<args.length;i++){
    p+=`${args[i]} `
  }
  p = p.trim()
  let des = ''
  const msg = await message.channel.send('**generating text**')
        try {
          const response = await openai.createChatCompletion({
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": p}]
          }
          );
          des = response.data.choices[0].message.content
		} catch(err) {
			console.log(err);
      msg.delete();
      return
		}
        msg.delete();
    for(let i=0;i<des.length/2000;i+=1){
    message.channel.send(des.substring(i*2000,(i+1)*2000));
    }
}
module.exports.desc = desc
