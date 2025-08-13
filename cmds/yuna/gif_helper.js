const GIFEncoder = require('gif-encoder-2');

async function createAnimatedGif(originalCanvas, pixelatedCanvas) {
    const width = originalCanvas.width;
    const height = originalCanvas.height;

    // Create GIF encoder
    const encoder = new GIFEncoder(width, height);
    
    // Start encoding
    encoder.setDelay(1000); // 1s delay between frames
    encoder.start();
    encoder.setRepeat(0); // 0 = infinite loop
    encoder.setQuality(10); // Lower = better quality
    
    // Add original frame
    const originalCtx = originalCanvas.getContext('2d');
    const originalImageData = originalCtx.getImageData(0, 0, width, height).data;
    encoder.addFrame(originalImageData);
    
    // Add pixelated frame
    const pixelatedCtx = pixelatedCanvas.getContext('2d');
    const pixelatedImageData = pixelatedCtx.getImageData(0, 0, width, height).data;
    encoder.addFrame(pixelatedImageData);
    
    // Finish encoding
    encoder.finish();
    
    // Get the GIF buffer
    return encoder.out.getData();
}

module.exports = { createAnimatedGif };