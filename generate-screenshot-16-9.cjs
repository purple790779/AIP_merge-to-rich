const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const inputFile = path.join(publicDir, 'thumbnail_landscape.png');
const outputFile = path.join(publicDir, 'screenshot_16_9.png');

async function generate16_9() {
    if (!fs.existsSync(inputFile)) {
        console.error('Input file not found:', inputFile);
        return;
    }

    try {
        console.log('Processing:', inputFile);

        // Resize to exact 1920x1080 (16:9)
        // Use 'contain' to add black bars (letterboxing) to preserve aspect ratio, 
        // or 'cover' to crop. 
        // Given it's a game screenshot, 'fill' might distort it slightly but 'contain' is safer for strict requirements.
        // Actually, let's use 'cover' to fill the frame, cropping edges slightly if needed, to look better.
        await sharp(inputFile)
            .resize(1920, 1080, {
                fit: 'cover',
                position: 'center'
            })
            .toFile(outputFile);

        console.log('Successfully created:', outputFile);

    } catch (error) {
        console.error('Error processing image:', error);
    }
}

generate16_9();
