const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const inputFile = path.join(publicDir, 'thumbnail_landscape.png');
const outputFile = path.join(publicDir, 'feature_graphic_1024x500.png');

async function generateFeatureGraphic() {
    if (!fs.existsSync(inputFile)) {
        console.error('Input file not found:', inputFile);
        return;
    }

    try {
        console.log('Processing:', inputFile);

        // Resize to exactly 1024x500
        // Use 'cover' strategy to fill the dimensions without distortion, cropping if necessary
        await sharp(inputFile)
            .resize(1024, 500, {
                fit: 'cover',
                position: 'center'
            })
            .toFile(outputFile);

        console.log('Successfully created:', outputFile);

    } catch (error) {
        console.error('Error processing image:', error);
    }
}

generateFeatureGraphic();
