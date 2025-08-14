const { createCanvas, loadImage } = require("canvas");
const traits = require("./genyuna").traits;
const {
    AttachmentBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const { getLocalImagePath, getTraitName } = require("./image_helper");
const { getRarityInfo } = require("./rarity_helper");
const { pixelateImage } = require("./pixel_helper");
const { createAnimatedGif } = require("./gif_helper");
const combinedData = require("./combined_data.json");
const path = require("path");

let desc = "Show a specific Yuna NFT by number (1-3333)";

module.exports = async (client, message, args) => {
    try {
        // Check if number is provided
        if (!args[0]) {
            return message.reply(
                "Please provide a number! Usage: !yuna <number> (1-3333)"
            );
        }

        const number = parseInt(args[0]);

        // Validate number
        if (isNaN(number) || number < 1 || number > 3333) {
            return message.reply(
                "Please provide a valid number between 1 and 3333!"
            );
        }

        // Send initial message
        const loadingMsg = await message.channel.send("Fetching Yuna...");

        // Get the data from the array (subtract 1 from number since array is 0-based)
        const yunaData = combinedData[number - 1];
        const [seed, id] = yunaData;

        // Calculate trait seeds
        const normalizedSeed = seed % 154440;
        const bgSeed = normalizedSeed % (traits[0].traits.length + 2);
        const bodySeed =
            Math.floor(normalizedSeed / (traits[0].traits.length + 2)) %
            traits[1].traits.length;
        const outfitSeed =
            Math.floor(
                normalizedSeed /
                    ((traits[0].traits.length + 2) * traits[1].traits.length)
            ) % traits[2].traits.length;
        const accessoriesSeed =
            Math.floor(
                normalizedSeed /
                    ((traits[0].traits.length + 2) *
                        traits[1].traits.length *
                        traits[2].traits.length)
            ) %
            (traits[3].traits.length + 1);
        const eyewearSeed =
            Math.floor(
                normalizedSeed /
                    ((traits[0].traits.length + 2) *
                        traits[1].traits.length *
                        traits[2].traits.length *
                        (traits[3].traits.length + 1))
            ) %
            (traits[4].traits.length + 1);

        // Get trait IDs
        const bgId =
            bgSeed === traits[0].traits.length
                ? "matrix"
                : bgSeed === traits[0].traits.length + 1
                ? "orange"
                : traits[0].traits[bgSeed].id;
        const bodyId = traits[1].traits[bodySeed].id;
        const outfitId = traits[2].traits[outfitSeed].id;
        const accessoryId =
            accessoriesSeed < traits[3].traits.length
                ? traits[3].traits[accessoriesSeed].id
                : null;
        const eyewearId =
            eyewearSeed < traits[4].traits.length
                ? traits[4].traits[eyewearSeed].id
                : null;

        // Get rarity information
        const rarityInfo = getRarityInfo(number);

        // Set up canvas
        const width = [0, 2, 3, 8, 10, 11].includes(bodySeed) ? 720 : 1080;
        const height = width;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // Get trait names and load images
        const bgName =
            bgId === "matrix"
                ? "Matrix"
                : bgId === "orange"
                ? "Orange"
                : getTraitName(traits, "Background", bgId);
        const bodyName = getTraitName(traits, "Body", bodyId);
        const outfitName = getTraitName(traits, "Outfit", outfitId);
        const accessoryName = getTraitName(traits, "Accessories", accessoryId);
        const eyewearName = getTraitName(traits, "Eyewear", eyewearId);

        // Load and draw images
        try {
            // Background
            if (bgId && bgId !== "None") {
                const img = await loadImage(
                    getLocalImagePath("Background", bgName)
                );
                ctx.drawImage(img, 0, 0, width, height);
            }

            // Body
            if (bodyName !== "None") {
                const img = await loadImage(
                    getLocalImagePath("Body", bodyName)
                );
                ctx.drawImage(img, 0, 0, width, height);
            }

            // Outfit
            if (outfitName !== "None") {
                const img = await loadImage(
                    getLocalImagePath("Outfit", outfitName)
                );
                ctx.drawImage(img, 0, 0, width, height);
            }

            // Accessories
            if (accessoryName !== "None") {
                const img = await loadImage(
                    getLocalImagePath("Accessories", accessoryName)
                );
                ctx.drawImage(img, 0, 0, width, height);
            }

            // Eyewear
            if (eyewearName !== "None") {
                const img = await loadImage(
                    getLocalImagePath("Eyewear", eyewearName)
                );
                ctx.drawImage(img, 0, 0, width, height);
            }
        } catch (error) {
            console.error("Failed to load or draw image:", error);
        }

        // Save the original version
        const originalCanvas = createCanvas(width, height);
        const originalCtx = originalCanvas.getContext("2d");
        originalCtx.drawImage(canvas, 0, 0);

        // Create pixelated version in a new canvas
        const pixelatedCanvas = createCanvas(width, height);
        const pixelatedCtx = pixelatedCanvas.getContext("2d");
        pixelatedCtx.drawImage(canvas, 0, 0);
        pixelateImage(pixelatedCtx, width, height);

        // Create animated GIF
        const buffer = await createAnimatedGif(originalCanvas, pixelatedCanvas);
        const attachment = new AttachmentBuilder(buffer, {
            name: `yuna-${number}.gif`,
        });

        // Create the Magic Eden button
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("View on Magic Eden")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://magiceden.us/ordinals/item-details/${id}`)
        );

        await loadingMsg.delete();
        await message.channel.send({
            embeds: [
                {
                    title: `Yuna #${number}`,
                    description: `**Seed:** ${seed}\n**Inscription ID:** ${id}\n\n**Rarity Rank:** ${rarityInfo.rank} of ${rarityInfo.totalCount} (Top ${rarityInfo.percentile}%)`,
                    color: 0xff5500, // Orange color
                    fields: [
                        {
                            name: "Background",
                            value: `${rarityInfo.traits.Background.name}\n*(${(
                                rarityInfo.traits.Background.probability * 100
                            ).toFixed(
                                2
                            )}% | Score: ${rarityInfo.traits.Background.score.toFixed(
                                2
                            )})*`,
                            inline: true,
                        },
                        {
                            name: "Body",
                            value: `${rarityInfo.traits.Body.name}\n*(${(
                                rarityInfo.traits.Body.probability * 100
                            ).toFixed(
                                2
                            )}% | Score: ${rarityInfo.traits.Body.score.toFixed(
                                2
                            )})*`,
                            inline: true,
                        },
                        {
                            name: "Outfit",
                            value: `${rarityInfo.traits.Outfit.name}\n*(${(
                                rarityInfo.traits.Outfit.probability * 100
                            ).toFixed(
                                2
                            )}% | Score: ${rarityInfo.traits.Outfit.score.toFixed(
                                2
                            )})*`,
                            inline: true,
                        },
                        {
                            name: "Accessories",
                            value: `${rarityInfo.traits.Accessories.name}\n*(${(
                                rarityInfo.traits.Accessories.probability * 100
                            ).toFixed(
                                2
                            )}% | Score: ${rarityInfo.traits.Accessories.score.toFixed(
                                2
                            )})*`,
                            inline: true,
                        },
                        {
                            name: "Eyewear",
                            value: `${rarityInfo.traits.Eyewear.name}\n*(${(
                                rarityInfo.traits.Eyewear.probability * 100
                            ).toFixed(
                                2
                            )}% | Score: ${rarityInfo.traits.Eyewear.score.toFixed(
                                2
                            )})*`,
                            inline: true,
                        },
                        {
                            name: "Rarity Score",
                            value: `${rarityInfo.score.toFixed(4)}`,
                            inline: true,
                        },
                    ],
                    image: {
                        url: "attachment://yuna-" + number + ".gif",
                    },
                },
            ],
            components: [row],
            files: [attachment],
        });
    } catch (error) {
        console.error("Error in yuna command:", error);
        message.channel.send("An error occurred while fetching the Yuna NFT.");
    }
};

module.exports.desc = desc;
