const fetch = require("node-fetch");

module.exports = async (client, message, args) => {
    if (args.length === 0) {
        return message.channel.send({
            embeds: [
                {
                    color: 0xe74c3c,
                    title: "❌ Missing Ticker",
                    description: `Please provide a BRC-20 ticker symbol.\n\n**Usage:** \`!brc20 <ticker>\`\n\n**Example:**\n\`!brc20 ORDI\``,
                },
            ],
        });
    }

    const ticker = args[0].toUpperCase();

    // Show loading message
    const loadingMsg = await message.channel.send({
        embeds: [
            {
                color: 0x3498db,
                description: `🔍 Fetching ${ticker} details from Best in Slot...`,
            },
        ],
    });

    try {
        // Fetch ticker data from Best in Slot API
        const apiKey = process.env.BIS_API_KEY || "";
        const headers = apiKey ? { "X-API-KEY": apiKey } : {};

        const response = await fetch(
            `https://api.bestinslot.xyz/v3/brc20/ticker_info?ticker=${ticker}`,
            { headers }
        );

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const result = await response.json();

        if (!result.data) {
            throw new Error("Ticker not found");
        }

        const data = result.data;

        // Format numbers with commas
        const formatNumber = (num) => {
            return num.toLocaleString("en-US");
        };

        // Format percentage
        const formatPercent = (num) => {
            return num.toFixed(2) + "%";
        };

        // Format date
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        };

        // Calculate circulating supply
        const circulatingSupply = data.minted_supply - data.burned_supply;

        // Create embed
        const embed = {
            color: 0xf7931a, // Bitcoin orange
            title: `${data.original_ticker} - BRC-20 Token`,
            thumbnail: {
                url: data.image_url,
            },
            fields: [
                {
                    name: "📊 Supply Information",
                    value: `**Max Supply:** ${formatNumber(
                        data.max_supply
                    )}\n**Minted:** ${formatNumber(
                        data.minted_supply
                    )}\n**Burned:** ${formatNumber(
                        data.burned_supply
                    )}\n**Circulating:** ${formatNumber(
                        circulatingSupply
                    )}\n**Mint Progress:** ${formatPercent(
                        data.mint_progress
                    )}`,
                    inline: true,
                },
                {
                    name: "⚙️ Token Details",
                    value: `**Decimals:** ${
                        data.decimals
                    }\n**Limit per Mint:** ${formatNumber(
                        data.limit_per_mint
                    )}\n**Self Mint:** ${data.is_self_mint ? "Yes" : "No"}`,
                    inline: true,
                },
                {
                    name: "👥 Activity",
                    value: `**Holders:** ${formatNumber(
                        data.holder_count
                    )}\n**Transactions:** ${formatNumber(data.tx_count)}`,
                    inline: true,
                },
                {
                    name: "📅 Deployment",
                    value: `**Date:** ${formatDate(
                        data.deploy_ts
                    )}\n**Inscription #:** ${formatNumber(
                        data.deploy_incr_number
                    )}`,
                    inline: true,
                },
                {
                    name: "🔗 Links",
                    value: `[View on Best in Slot](https://bestinslot.xyz/${
                        ticker.length == 6
                            ? `brc2.0/${ticker.toLowerCase()}`
                            : `ordinals/brc20/${ticker.toLowerCase()}`
                    })\n[Inscription](https://ordinals.com/inscription/${
                        data.deploy_inscr_id
                    })`,
                    inline: true,
                },
            ],
            footer: {
                text: `Block Height: ${formatNumber(result.block_height)}`,
            },
            timestamp: new Date().toISOString(),
        };

        await loadingMsg.edit({ embeds: [embed] });

        console.log(`✅ BRC-20 lookup successful: ${ticker}`);
    } catch (error) {
        console.error(`❌ BRC-20 lookup failed:`, error);
        await loadingMsg.edit({
            embeds: [
                {
                    color: 0xe74c3c,
                    title: "❌ Error",
                    description: `Failed to fetch BRC-20 ticker details for **${ticker}**.\n\`\`\`${error.message}\`\`\`\n\nPlease check that the ticker exists and try again.`,
                },
            ],
        });
    }
};

module.exports.desc = "Look up BRC-20 token information";
module.exports.detaildesc = `Fetches and displays detailed information about a BRC-20 token from Best in Slot.

**Usage:** \`!brc20 <ticker>\`

**Example:**
\`!brc20 ORDI\`
\`!brc20 SATS\`

**Information Displayed:**
• Supply metrics (max, minted, burned, circulating)
• Token configuration (decimals, mint limit)
• Holder and transaction counts
• Deployment details and inscription ID`;
