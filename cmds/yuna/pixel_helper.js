const { createCanvas } = require('canvas');

function pixelateImage(ctx, width, height) {
    // Create an offscreen canvas
    const offCanvas = createCanvas(width, height);
    const offCtx = offCanvas.getContext('2d');

    // Copy the original image to offscreen canvas
    offCtx.drawImage(ctx.canvas, 0, 0);
    const originalImageData = offCtx.getImageData(0, 0, width, height);

    // Clear the main canvas
    ctx.clearRect(0, 0, width, height);

    // Use the same pixelation values as pixel.html
    const pixelX = 55;
    const pixelY = 55;
    const blockW = Math.ceil(width / pixelX);
    const blockH = Math.ceil(height / pixelY);

    // Get the original image data
    const offImageData = originalImageData.data;

    // Draw pixelated version
    for (let y = 0; y < pixelY; y++) {
        for (let x = 0; x < pixelX; x++) {
            const sx = Math.floor((x + 0.5) * blockW);
            const sy = Math.floor((y + 0.5) * blockH);
            const idx = (Math.min(sy, height - 1) * width + Math.min(sx, width - 1)) * 4;
            
            const r = offImageData[idx];
            const g = offImageData[idx + 1];
            const b = offImageData[idx + 2];
            const a = offImageData[idx + 3] / 255;

            // Only draw block if center is not transparent
            if (a > 0) {
                ctx.globalAlpha = a;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x * blockW, y * blockH, blockW, blockH);
            }
        }
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1.0;
}

module.exports = { pixelateImage };