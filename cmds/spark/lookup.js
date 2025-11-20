const {
  fetchTokenDetails,
  createTokenEmbed,
  TOKEN_PATTERN,
} = require("../../util/tokenDetector");

module.exports = async (client, message, args) => {
  if (args.length === 0) {
    return message.channel.send({
      embeds: [
        {
          color: 0xe74c3c,
          title: "❌ Missing Token Identifier",
          description: `Please provide a token identifier.\n\n**Format:** \`btkn\` + 65 chars + \`h0dl\`\n\n**Example:**\n\`!lookup btkn16w9v5shwtv78xwsc0dt00sx9g8r8fdtpnhtxfzpfzz8s19mzt4ts7zh0d1\``,
        },
      ],
    });
  }

  const identifier = args[0];

  // Validate token identifier format
  if (!TOKEN_PATTERN.test(identifier)) {
    return message.channel.send({
      embeds: [
        {
          color: 0xe74c3c,
          title: "❌ Invalid Token Identifier",
          description: `The provided identifier doesn't match the expected format.\n\n**Expected:** \`btkn\` + 65 chars + \`h0dl\` (total 73 characters)\n**Received:** ${identifier.length} characters`,
        },
      ],
    });
  }

  // Show loading message
  const loadingMsg = await message.channel.send({
    embeds: [
      {
        color: 0x3498db,
        description: "🔍 Fetching token details from SparkScan...",
      },
    ],
  });

  try {
    // Fetch token data
    const tokenData = await fetchTokenDetails(identifier);

    // Create and send embed
    const embed = createTokenEmbed(tokenData);

    await loadingMsg.edit({ embeds: [embed] });

    console.log(`✅ Token lookup successful: ${identifier}`);
  } catch (error) {
    console.error(`❌ Token lookup failed:`, error);
    await loadingMsg.edit({
      embeds: [
        {
          color: 0xe74c3c,
          title: "❌ Error",
          description: `Failed to fetch token details.\n\`\`\`${error.message}\`\`\``,
        },
      ],
    });
  }
};

module.exports.desc = "Look up token details by identifier";
module.exports.detaildesc = `Fetches and displays detailed information about a token from SparkScan.

**Usage:** \`!lookup <token_identifier>\`

**Format:** Token identifiers follow the pattern: \`btkn\` + 65 characters + \`h0dl\`

**Example:**
\`!lookup btkn16w9v5shwtv78xwsc0dt00sx9g8r8fdtpnhtxfzpfzz8s19mzt4ts7zh0d1\`

**Note:** Tokens are also auto-detected in messages, so you don't always need to use this command.`;

