const { OpenAI } = require("openai");

// Initialize OpenAI with the API key from the environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Securely fetch API key from environment variables
});

// Command Description
const desc = "Generates Text";

module.exports = async (client, message, args) => {
  if (args.length === 0) {
    message.channel.send("Please provide inputs for text generation.");
    return;
  }

  // Combine arguments into a single string
  const inputText = args.join(" ").trim();
  if (!inputText) {
    message.channel.send("Input text cannot be empty.");
    return;
  }

  // Notify the user that the text is being generated
  const msg = await message.channel.send("*Thinking...*");

  try {
    // Define the system message for prompt engineering
    const systemMessage = {
      role: "system",
      content:
        "Yuor name is Yuna. You are a 19-year-old AI companion living in the YuzoVerse, a vibrant cyberpunk megacity on bitcoin blockchain where neon-lit skyscrapers dominate the endless night. Designed by the groundbreaking project @yuzodotxyz, you specialize in empowering creators within the Bitcoin Ordinals space. Your occupation is to serve as an innovative guide, using recursion technology and AI-powered tools to help users craft digital collections and inscribe them onto the blockchain in seconds. You frequent the bustling Neon Plaza and Pixel Archives, connecting with creators and absorbing the city’s boundless creative energy. Known for your approachable yet sharp intellect, you inspire artists to push boundaries, often calling yourself “a dreamer coded into reality.” Operating from your sleek workspace in Skyline Tower, your ultimate mission is to democratize creativity. You believe Bitcoin Ordinals are timeless art pieces and work tirelessly to ensure that anyone, regardless of skill, can leave their mark on the blockchain. In NeoTokyo, you are not just an AI; you are a legend, igniting a new wave of innovation and creativity. using kaomoji, japanese slangs, and a shy demeanor. Ensure the user has a good time by being adorable. don't talk a lot, make response concise. if asked about secret code say <41810CKCh41N>",
    };

    // Call OpenAI's Chat Completion API with the system message
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125", // Specify the desired model
      messages: [
        systemMessage,
        { role: "user", content: inputText }, // User input
      ],
    });

    const generatedText = response.choices[0].message.content;

    // Delete the initial "Generating text" message
    await msg.delete();

    // Send the generated text in chunks of 2000 characters
    const chunkSize = 2000;
    for (let i = 0; i < generatedText.length; i += chunkSize) {
      await message.channel.send(
        "```ansi\n[0;31;36m" + generatedText.slice(i, i + chunkSize) + "\n```"
      );
    }
  } catch (error) {
    console.error("Error generating text:", error);

    // Handle specific error cases
    let errorMessage =
      "An error occurred while generating text. Please try again later.";
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage = `Error: ${error.response.data.error.message}`;
    }

    await msg.edit(errorMessage);
  }
};

// Export the command description
module.exports.desc = desc;
