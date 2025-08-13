const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const sharp = require('sharp');

// Import traits data
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

async function downloadImage(url, filepath) {
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
            
        await fs.writeFile(filepath, pngBuffer);
        console.log(`Downloaded: ${filepath}`);
    } catch (error) {
        console.error(`Failed to download ${url}:`, error);
    }
}

async function downloadAllTraits() {
    // Create base directory if it doesn't exist
    const baseDir = path.join(__dirname, 'assets');
    await fs.mkdir(baseDir, { recursive: true });

    // Process each trait category
    for (const category of traits) {
        // Create category directory
        const categoryDir = path.join(baseDir, category.name.toLowerCase());
        await fs.mkdir(categoryDir, { recursive: true });

        // Download each trait image
        for (const trait of category.traits) {
            const filepath = path.join(categoryDir, `${trait.name.toLowerCase().replace(/\s+/g, '_')}.png`);
            const url = `https://ordinals.com/content/${trait.id}`;
            await downloadImage(url, filepath);
        }
    }

    // Create special backgrounds
    const bgDir = path.join(baseDir, 'background');
    
    // Create matrix background
    const matrixCanvas = require('./matrix_helper').createMatrixBackground(1080, 1080);
    const matrixBuffer = matrixCanvas.toBuffer('image/png');
    await fs.writeFile(path.join(bgDir, 'matrix.png'), matrixBuffer);
    console.log('Created: matrix.png');

    // Create orange background
    const orangeCanvas = require('canvas').createCanvas(1080, 1080);
    const ctx = orangeCanvas.getContext('2d');
    ctx.fillStyle = '#FF5500';
    ctx.fillRect(0, 0, 1080, 1080);
    const orangeBuffer = orangeCanvas.toBuffer('image/png');
    await fs.writeFile(path.join(bgDir, 'orange.png'), orangeBuffer);
    console.log('Created: orange.png');
}

// Run the download
downloadAllTraits().then(() => {
    console.log('All traits downloaded successfully!');
}).catch(error => {
    console.error('Error downloading traits:', error);
});
