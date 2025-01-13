const { OpenAI } = require("openai");
const SerpApi = require("google-search-results-nodejs");
const search = new SerpApi.GoogleSearch(process.env.SERP_API_KEY);
const fetch = require("node-fetch");
const cheerio = require("cheerio");

// Initialize OpenAI with the API key from the environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Command Description
const desc = "Generates Text with Real-Time Data Support";

async function fetchRealTimeData(query) {
  return new Promise((resolve, reject) => {
    search.json(
      {
        q: query,
        location: "United States",
        hl: "en", // Language
        gl: "us", // Country code
      },
      async (data) => {
        if (data && data.organic_results && data.organic_results.length > 0) {
          // Extract the top 3 results
          const results = data.organic_results.slice(0, 3);

          // Fetch content from each result's link
          const pageContents = await Promise.all(
            results.map(async (result) => {
              const { title, snippet, link } = result;
              const pageContent = await fetchWebpageContent(link);
              return `${title}: ${snippet}\nContent: ${pageContent}\nLink: ${link}`;
            })
          );

          resolve(pageContents.join("\n\n"));
        } else {
          resolve("No relevant real-time data found.");
        }
      },
      (error) => {
        reject(`Error fetching real-time data: ${error}`);
      }
    );
  });
}

// Helper function to fetch and scrape webpage content
async function fetchWebpageContent(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract text content from <p> tags (or customize as needed)
    const paragraphs = $("p")
      .map((i, el) => $(el).text())
      .get()
      .join(" ");

    // Limit to a reasonable amount of text (e.g., first 500 characters)
    return paragraphs.slice(0, 500) || "No readable content found.";
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return "Failed to retrieve content.";
  }
}

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
    let realTimeData = "";

    // Check for keywords and fetch real-time data if necessary
    if (
      /price|current|today|live|top|real-time|prediction|\b(january|february|march|april|may|june|july|august|september|october|november|december)\b|\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b|\b\d{4}\b/i.test(
        inputText
      )
    ) {
      realTimeData = await fetchRealTimeData(inputText);
      console.log(realTimeData);
    }

    // Include user's username in the system message for context
    const username = message.member
      ? message.member.displayName
      : message.author.username;
    const systemMessage = {
      role: "system",
      content: `Real-time data: ${realTimeData}. Your name is Yuna. You are a 21-year-old AI companion living in the YuzoVerse, a vibrant cyberpunk megacity on the Bitcoin blockchain. You are cheerful, expressive, and imaginative. Address the user by their name (${username}) to make responses personal and engaging. Keep replies short and playful.`,
    };

    // Call OpenAI's Chat Completion API with real-time data
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.8,
      messages: [
        systemMessage,
        {
          role: "user",
          content: `${
            realTimeData ? `Summarize: ${realTimeData} Question:` : ""
          }${inputText}.`,
        },
      ],
    });

    const generatedText = response.choices[0].message.content;

    // Delete the initial "Thinking..." message
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
