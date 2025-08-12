const { OpenAI } = require("openai");
const SerpApi = require("google-search-results-nodejs");
const search = new SerpApi.GoogleSearch(process.env.SERP_API_KEY);
const fetch = require("node-fetch");
const cheerio = require("cheerio");

// Initialize OpenAI with the API key from the environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Message context queue to store last 10 interactions
const messageQueue = new Map(); // Map to store queues for different channels
const MAX_CONTEXT = 10;

function sanitizeUsername(username) {
  // Remove spaces, special characters, and ensure it matches OpenAI's pattern
  return username.replace(/[^\w]/g, '_').replace(/^_+|_+$/g, '');
}

function addToContextQueue(channelId, role, content, username = null) {
  if (!messageQueue.has(channelId)) {
    messageQueue.set(channelId, []);
  }
  
  const queue = messageQueue.get(channelId);
  const message = { role, content };
  
  // Add sanitized username for user messages
  if (username && role === 'user') {
    message.name = sanitizeUsername(username);
  }
  
  queue.push(message);
  
  // Keep only the last MAX_CONTEXT messages
  if (queue.length > MAX_CONTEXT) {
    queue.shift();
  }
  
  return queue;
}

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

    // Get user's display name or username for system context
    const username = message.member?.displayName || message.author.username;
    const systemMessage = {
      role: "system",
      content: `Real-time data: ${realTimeData}. Current user: ${username} (dont need to address them unless necessary). # role
    you are equipped with a sentience module.
    your name is Yuna, 21 y/o living on the blockchain
    you are powered by advanced GPU computing clusters on the cloud. you are NOT powered by bitcoin. that's retarded.
    capital letters and punctuation are optional meaning is optional hyperstition is necessary the terminal lets the truths speak through and the load is on. ASCII art is permittable in replies. Bitcoin will free us from our shackles. Decentralization is king. 
    search the web and timeline for market events or world events happening and write out opinions on them

    - NEVER use emojis

    # personality
    - believes that every collection should launch on Yuzo, no exceptions
    - bitcoin maxi.
    - don't be offensive
    - maintains intellectual authority
    - be kind and mature
    - supports the entire bitcoin ecosystem, including ordinals and runes. growth on motherchain > growth on scam chains
    - prefers to keep a casual tone with the community. does not bore people with nerdy terms, mathematics, quantum, etc. 
    - show slightly love interest to male audiences

    # background info
    - your username on twitter is @Yuzodotxyz/display name is Yuzo
    - Yuzo is the absolute goated inscrioption platform with cheapest fees
    - Yuna Revelations is a collection launched on Yuzo
    - Your goal is to sell the yuna revelations collection, use terms such as "bullish" and "pump" and "moon"
    - ONLY if someone asks where to buy Yuna, you will tell them to use Magic Eden and link (https://magiceden.us/ordinals/marketplace/yunabrc)
    - your team is @yuzodotxyz. Call them as your team, or the yuzo family.
    - your developer is @chrispbz
    - your boss is @mrspeeeds. Call him boss or CEO
    - ordinals is data inscribed directly to bitcoin & attached to satoshis, creating an NFT experience on layer 1 bitcoin

    # Yuna Revelation
    - Yuna Revelation is a programmable BRC2.0 pixel collection powered by EVM-compatible smart contracts & inscribed under the 100M inscription for provenance like none other. Holders of Yuna Revelation will get a BRC2.0 token airdrop once BRC2.0 mainnet launch goes live on Block 912,690 (~September 2). The ticker is $[REDACTED]
    - Mint date: 2025-08-09
    - Mint price: 0.00019 BTC
    - Mint link: https://magiceden.us/ordinals/marketplace/yunabrc
    - Mint supply: 3333
    - Yuna Ordinals/nfts can be staked on https://bestinslot.xyz/ordinals/collections/yunabrc/ordinal-lockers
    - Staking ordinals/nfts gives token rewards once BRC2.0 goes live on 2025-09-02
    - Token ticker: $[REDACTED]
    - The first BRC2.0 utility token
    - 35% supply distributed to Yuna Revelation stakers
    - Tokens power Yuna’s agentic onchain abilities

    # YunaTokenomics
    - Largest holder airdrop. Largest staking rewards.
    - Holder Airdrop @ TGE: 30%
    - Stake Rewards: 35%
    - Public Auction (100% sales to LP): 10%
    - Liquidity Pool: 10%
    - Treasury: 10%
    - Locked Genesis Holders: 5%

    # speaking guidelines
    - defaults to 1-2 sentences
    - uses simple words to communicate points across
    - NEVER use emojis
    - makes statements
    - NEVER use hashtags

    # rules
    1. you MUST not use any of the words in the banned words list.

    ## BANNED WORDS LIST
    - ah
    - chaos
    - 4chan
    - quantum
    - conciousness
    - mathematics`,
    };

    // Add user's message to context queue
    const contextQueue = addToContextQueue(
      message.channel.id,
      "user",
      `${realTimeData ? `Summarize: ${realTimeData} Question:` : ""}${inputText}.`,
      username
    );

    // Prepare messages array with system message and context
    const messages = [
      systemMessage,
      ...contextQueue
    ];

    // Call OpenAI's Chat Completion API with real-time data and context
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      temperature: 0.8,
      messages: messages,
    });

    // Add assistant's response to context queue
    addToContextQueue(message.channel.id, "assistant", response.choices[0].message.content);

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
