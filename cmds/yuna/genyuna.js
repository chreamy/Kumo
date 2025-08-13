const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const fetch = require('node-fetch');
const sharp = require('sharp');
const { drawMatrixBackground } = require('./matrix_helper');
const { pixelateImage } = require('./pixel_helper');
const { createAnimatedGif } = require('./gif_helper');

let desc = 'Generate a Yuna image with a specific seed number (!genyuna <seed>)';

// Trait data from pixel.html
const traits = [
    {
        "name": "Background",
        "unique": false,
        "required": true,
        "traits": [
            {
                "name": "Subway",
                "id": "192928d350e6d6c6b25b372d58bfcbe1313efe3a608c86ac337eae2a89c29ba2i1"
            },
            {
                "name": "Mempool",
                "id": "192928d350e6d6c6b25b372d58bfcbe1313efe3a608c86ac337eae2a89c29ba2i0"
            },
            {
                "name": "Station",
                "id": "269db3602e28496586ea5a218453bed44ae95caecbfb6707ba2866626ade609bi1"
            },
            {
                "name": "DOGE",
                "id": "269db3602e28496586ea5a218453bed44ae95caecbfb6707ba2866626ade609bi0"
            },
            {
                "name": "Whitepaper",
                "id": "269db3602e28496586ea5a218453bed44ae95caecbfb6707ba2866626ade609bi6"
            },
            {
                "name": "Spaceport",
                "id": "269db3602e28496586ea5a218453bed44ae95caecbfb6707ba2866626ade609bi4"
            },
            {
                "name": "Matrix",
                "id": "269db3602e28496586ea5a218453bed44ae95caecbfb6707ba2866626ade609bi5"
            },
            {
                "name": "Snow",
                "id": "269db3602e28496586ea5a218453bed44ae95caecbfb6707ba2866626ade609bi3"
            },
            {
                "name": "Palace",
                "id": "269db3602e28496586ea5a218453bed44ae95caecbfb6707ba2866626ade609bi2"
            }
        ]
    },
    {
        "name": "Body",
        "unique": true,
        "required": true,
        "traits": [
            {
                "name": "Classic",
                "id": "6df15f10b4fed1dbd291eb91a7cbbc527d45a01ce20451aae895aa94565ca75ai2"
            },
            {
                "name": "Lilac",
                "id": "d2e411b59414faf001a88bc6508db4f7142fceaed0f535b7c140b8cef714cbadi4"
            },
            {
                "name": "Rust",
                "id": "d2e411b59414faf001a88bc6508db4f7142fceaed0f535b7c140b8cef714cbadi0"
            },
            {
                "name": "Azure",
                "id": "d2e411b59414faf001a88bc6508db4f7142fceaed0f535b7c140b8cef714cbadi1"
            },
            {
                "name": "Alien",
                "id": "d2e411b59414faf001a88bc6508db4f7142fceaed0f535b7c140b8cef714cbadi2"
            },
            {
                "name": "Lime",
                "id": "d2e411b59414faf001a88bc6508db4f7142fceaed0f535b7c140b8cef714cbadi3"
            },
            {
                "name": "Mystic",
                "id": "d2e411b59414faf001a88bc6508db4f7142fceaed0f535b7c140b8cef714cbadi5"
            },
            {
                "name": "Neko",
                "id": "7b07ae640b9bce91014ad16badc8f99ab18865b08343b7765cccf37102d7d858i1"
            },
            {
                "name": "Devil",
                "id": "7b07ae640b9bce91014ad16badc8f99ab18865b08343b7765cccf37102d7d858i2"
            },
            {
                "name": "Aloof",
                "id": "7b07ae640b9bce91014ad16badc8f99ab18865b08343b7765cccf37102d7d858i3"
            },
            {
                "name": "Nova",
                "id": "7b07ae640b9bce91014ad16badc8f99ab18865b08343b7765cccf37102d7d858i4"
            },
            {
                "name": "Crimson",
                "id": "7b07ae640b9bce91014ad16badc8f99ab18865b08343b7765cccf37102d7d858i5"
            },
            {
                "name": "Sakura",
                "id": "b754d6d2707dba2ba8ebf051a947a729d93c30fe08ce699bb82d71625bc7d9e8i0"
            }
        ]
    },
    {
        "name": "Outfit",
        "unique": true,
        "required": true,
        "traits": [
            {
                "name": "Normie",
                "id": "99a39c6aa7354e8ef64553922f7ddffe05293eaba3ff0e044f754eba8b560c3bi2"
            },
            {
                "name": "Mono Glitch",
                "id": "7b07ae640b9bce91014ad16badc8f99ab18865b08343b7765cccf37102d7d858i0"
            },
            {
                "name": "RunesDev",
                "id": "6df15f10b4fed1dbd291eb91a7cbbc527d45a01ce20451aae895aa94565ca75ai0"
            },
            {
                "name": "Satoshi",
                "id": "6df15f10b4fed1dbd291eb91a7cbbc527d45a01ce20451aae895aa94565ca75ai3"
            },
            {
                "name": "Professor X",
                "id": "99a39c6aa7354e8ef64553922f7ddffe05293eaba3ff0e044f754eba8b560c3bi1"
            },
            {
                "name": "Yucci",
                "id": "a4d550893e9052f3f7e973e199488420d1b976503e04eed860ac4a2dd5bf48adi0"
            },
            {
                "name": "Nuclear",
                "id": "51b7fda6dad95974d2dd73e34e2e3cc0b23d4851233c60282f4880fae6999396i1"
            },
            {
                "name": "Fugitive",
                "id": "51b7fda6dad95974d2dd73e34e2e3cc0b23d4851233c60282f4880fae6999396i2"
            },
            {
                "name": "69",
                "id": "51b7fda6dad95974d2dd73e34e2e3cc0b23d4851233c60282f4880fae6999396i3"
            },
            {
                "name": "Tux",
                "id": "a4d550893e9052f3f7e973e199488420d1b976503e04eed860ac4a2dd5bf48adi2"
            },
            {
                "name": "Hoodie",
                "id": "bc60843466622be075d86e049793639f6e512f3ea8c738bf62fffc364e4c34e7i5"
            },
            {
                "name": "McB",
                "id": "bc60843466622be075d86e049793639f6e512f3ea8c738bf62fffc364e4c34e7i0"
            },
            {
                "name": "Purradox",
                "id": "bc60843466622be075d86e049793639f6e512f3ea8c738bf62fffc364e4c34e7i6"
            },
            {
                "name": "NodeRunner",
                "id": "bc60843466622be075d86e049793639f6e512f3ea8c738bf62fffc364e4c34e7i7"
            },
            {
                "name": "Pimp",
                "id": "99a39c6aa7354e8ef64553922f7ddffe05293eaba3ff0e044f754eba8b560c3bi0"
            }
        ]
    },
    {
        "name": "Accessories",
        "unique": true,
        "required": false,
        "traits": [
            {
                "name": "Runestone",
                "id": "51b7fda6dad95974d2dd73e34e2e3cc0b23d4851233c60282f4880fae6999396i0"
            },
            {
                "name": "Jeet3000",
                "id": "a4d550893e9052f3f7e973e199488420d1b976503e04eed860ac4a2dd5bf48adi1"
            },
            {
                "name": "Catify",
                "id": "a4d550893e9052f3f7e973e199488420d1b976503e04eed860ac4a2dd5bf48adi3"
            },
            {
                "name": "Gizmo",
                "id": "a4d550893e9052f3f7e973e199488420d1b976503e04eed860ac4a2dd5bf48adi5"
            },
            {
                "name": "Wizard",
                "id": "a4d550893e9052f3f7e973e199488420d1b976503e04eed860ac4a2dd5bf48adi6"
            },
            {
                "name": "Lightsaber",
                "id": "a4d550893e9052f3f7e973e199488420d1b976503e04eed860ac4a2dd5bf48adi7"
            },
            {
                "name": "Pizza",
                "id": "bc60843466622be075d86e049793639f6e512f3ea8c738bf62fffc364e4c34e7i1"
            },
            {
                "name": "Halo",
                "id": "bc60843466622be075d86e049793639f6e512f3ea8c738bf62fffc364e4c34e7i2"
            },
            {
                "name": "Pooky",
                "id": "bc60843466622be075d86e049793639f6e512f3ea8c738bf62fffc364e4c34e7i4"
            },
            {
                "name": "Dual Wield",
                "id": "99a39c6aa7354e8ef64553922f7ddffe05293eaba3ff0e044f754eba8b560c3bi3"
            },
            {
                "name": "Joint",
                "id": "99a39c6aa7354e8ef64553922f7ddffe05293eaba3ff0e044f754eba8b560c3bi6"
            }
        ]
    },
    {
        "name": "Eyewear",
        "unique": true,
        "required": false,
        "traits": [
            {
                "name": "Vision Bro",
                "id": "99a39c6aa7354e8ef64553922f7ddffe05293eaba3ff0e044f754eba8b560c3bi5"
            },
            {
                "name": "Vipers",
                "id": "99a39c6aa7354e8ef64553922f7ddffe05293eaba3ff0e044f754eba8b560c3bi4"
            },
            {
                "name": "Monocle",
                "id": "99a39c6aa7354e8ef64553922f7ddffe05293eaba3ff0e044f754eba8b560c3bi7"
            },
            {
                "name": "Black Eyes",
                "id": "bc60843466622be075d86e049793639f6e512f3ea8c738bf62fffc364e4c34e7i3"
            },
            {
                "name": "Laser Maxi",
                "id": "a4d550893e9052f3f7e973e199488420d1b976503e04eed860ac4a2dd5bf48adi4"
            }
        ]
    }
];

function getTraitBySeed(seed, category) {
    const traitCategory = traits.find(t => t.name === category);
    if (!traitCategory) return null;

    if (category === "Background") {
        const totalOptions = traitCategory.traits.length + 2;
        const selection = seed % totalOptions;
        if (selection === totalOptions - 2) return "matrix";
        if (selection === totalOptions - 1) return "orange";
        return selection < traitCategory.traits.length ? traitCategory.traits[selection].id : null;
    }
    const totalOptions = traitCategory.required ? traitCategory.traits.length : traitCategory.traits.length + 1;
    const selection = seed % totalOptions;
    return selection < traitCategory.traits.length ? traitCategory.traits[selection].id : null;
}

async function fetchImage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const buffer = await response.buffer();
        
        // Convert WebP to PNG using sharp
        const pngBuffer = await sharp(buffer)
            .toFormat('png')
            .toBuffer();
            
        return pngBuffer;
    } catch (error) {
        console.error(`Failed to fetch/convert image from ${url}:`, error);
        return null;
    }
}

module.exports = async (client, message, args) => {
    try {
        // Check if seed is provided
        if (!args[0]) {
            return message.reply('Please provide a seed number! Usage: !genyuna <seed>');
        }

        const seed = parseInt(args[0]);
        
        // Validate seed number
        if (isNaN(seed) || seed < 0) {
            return message.reply('Please provide a valid positive number!');
        }

        // Send initial message
        const loadingMsg = await message.channel.send('Generating Yuna image...');

        const totalCombinations = 154440;
        const normalizedSeed = seed % totalCombinations;
        
        // Calculate individual trait seeds
        const bgSeed = normalizedSeed % (traits[0].traits.length + 2);
        const bodySeed = Math.floor(normalizedSeed / (traits[0].traits.length + 2)) % traits[1].traits.length;
        const outfitSeed = Math.floor(normalizedSeed / ((traits[0].traits.length + 2) * traits[1].traits.length)) % traits[2].traits.length;
        const accessoriesSeed = Math.floor(normalizedSeed / ((traits[0].traits.length + 2) * traits[1].traits.length * traits[2].traits.length)) % (traits[3].traits.length + 1);
        const eyewearSeed = Math.floor(normalizedSeed / ((traits[0].traits.length + 2) * traits[1].traits.length * traits[2].traits.length * (traits[3].traits.length + 1))) % (traits[4].traits.length + 1);

        // Get trait IDs
        const bgId = getTraitBySeed(bgSeed, "Background");
        const bodyId = getTraitBySeed(bodySeed, "Body");
        const outfitId = getTraitBySeed(outfitSeed, "Outfit");
        const accessoryId = getTraitBySeed(accessoriesSeed, "Accessories");
        const eyewearId = getTraitBySeed(eyewearSeed, "Eyewear");

        // Set up canvas
        const width = [0,2,3,8,10,11].includes(bodySeed) ? 720 : 1080;
        const height = width;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Handle special backgrounds
        if (bgId === "matrix") {
            drawMatrixBackground(ctx, width, height);
        } else if (bgId === "orange") {
            ctx.fillStyle = '#FF5500';
            ctx.fillRect(0, 0, width, height);
        }

        // Define image URLs
        const imageUrls = [
            bgId && bgId !== "matrix" && bgId !== "orange" ? `https://ordinals.com/content/${bgId}` : null,
            bodyId ? `https://ordinals.com/content/${bodyId}` : null,
            outfitId ? `https://ordinals.com/content/${outfitId}` : null,
            accessoryId ? `https://ordinals.com/content/${accessoryId}` : null,
            eyewearId ? `https://ordinals.com/content/${eyewearId}` : null
        ].filter(url => url !== null);

        // Fetch and draw each image
        for (const url of imageUrls) {
            try {
                const imageBuffer = await fetchImage(url);
                if (imageBuffer) {
                    const img = await loadImage(imageBuffer);
                    ctx.drawImage(img, 0, 0, width, height);
                }
            } catch (error) {
                console.error(`Failed to process image from ${url}:`, error);
            }
        }

        // Create a copy of the original canvas
        const originalCanvas = createCanvas(width, height);
        const originalCtx = originalCanvas.getContext('2d');
        originalCtx.drawImage(canvas, 0, 0);

        // Apply pixelation effect to main canvas
        pixelateImage(ctx, width, height);

        // Create animated GIF
        const buffer = await createAnimatedGif(originalCanvas, canvas);
        const attachment = new AttachmentBuilder(buffer, { name: `yuna-${seed}.gif` });

        // Get trait names for the embed
        const bgName = bgId === "matrix" ? "Matrix" : 
                      bgId === "orange" ? "Orange" : 
                      traits[0].traits.find(t => t.id === bgId)?.name || "None";
        const bodyName = traits[1].traits.find(t => t.id === bodyId)?.name || "None";
        const outfitName = traits[2].traits.find(t => t.id === outfitId)?.name || "None";
        const accessoryName = traits[3].traits.find(t => t.id === accessoryId)?.name || "None";
        const eyewearName = traits[4].traits.find(t => t.id === eyewearId)?.name || "None";

        await loadingMsg.delete();
        await message.channel.send({
            embeds: [{
                title: `Yuna #${seed}`,
                description: `Generated with seed: ${seed}`,
                color: 0xFF5500, // Orange color
                fields: [
                    {
                        name: 'Background',
                        value: bgName,
                        inline: true
                    },
                    {
                        name: 'Body',
                        value: bodyName,
                        inline: true
                    },
                    {
                        name: 'Outfit',
                        value: outfitName,
                        inline: true
                    },
                    {
                        name: 'Accessories',
                        value: accessoryName,
                        inline: true
                    },
                    {
                        name: 'Eyewear',
                        value: eyewearName,
                        inline: true
                    }
                ],
                image: {
                    url: 'attachment://yuna-' + seed + '.gif'
                }
            }],
            files: [attachment]
        });

    } catch (error) {
        console.error('Error in yuna command:', error);
        message.channel.send('An error occurred while generating the image.');
    }
};

module.exports.desc = desc;