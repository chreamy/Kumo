function drawMatrixBackground(ctx, width, height) {
    // Clear background to black first
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Set up the grid
    const pixelX = 25; // Same as pixel.html
    const pixelY = 25;
    const blockW = Math.ceil(width / pixelX);
    const blockH = Math.ceil(height / pixelY);
    
    // Set up text properties
    ctx.fillStyle = '#0F0'; // Matrix green
    ctx.font = `25px monospace`; // Use block width for font size
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw the grid of characters
    for (let y = 0; y < pixelY; y++) {
        for (let x = 0; x < pixelX; x++) {
            // Generate random Japanese character (same range as pixel.html)
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);
            
            // Calculate center position for each cell
            const centerX = x * blockW + blockW / 2;
            const centerY = y * blockH + blockH / 2;
            
            ctx.fillText(text, centerX, centerY);
        }
    }
    
}

module.exports = { drawMatrixBackground };