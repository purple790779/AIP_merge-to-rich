const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const INPUT = path.join(__dirname, 'public', 'icon_600.png');
const RES_DIR = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Android mipmap sizes for launcher icons
const SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
};

// Adaptive icon foreground needs to be 108dp (with 18dp safe zone padding)
// So the actual foreground canvas is larger
const FOREGROUND_SIZES = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
};

async function generateIcons() {
    if (!fs.existsSync(INPUT)) {
        console.error('Input icon not found:', INPUT);
        process.exit(1);
    }

    console.log('Generating Android icons from:', INPUT);

    for (const [folder, size] of Object.entries(SIZES)) {
        const dir = path.join(RES_DIR, folder);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // ic_launcher.png - standard launcher icon (full square)
        await sharp(INPUT)
            .resize(size, size, { fit: 'cover' })
            .png()
            .toFile(path.join(dir, 'ic_launcher.png'));

        // ic_launcher_round.png - round version (same source, Android crops it)
        await sharp(INPUT)
            .resize(size, size, { fit: 'cover' })
            .png()
            .toFile(path.join(dir, 'ic_launcher_round.png'));

        console.log(`  ✅ ${folder}: ${size}x${size}`);
    }

    // Generate foreground images for adaptive icons
    for (const [folder, size] of Object.entries(FOREGROUND_SIZES)) {
        const dir = path.join(RES_DIR, folder);

        // For adaptive icon foreground:
        // The icon content should be centered in the 108dp canvas with 18dp padding on each side
        // So the actual icon occupies 72/108 = 66.67% of the canvas
        const iconSize = Math.round(size * (72 / 108));
        const padding = Math.round((size - iconSize) / 2);

        // Create a transparent canvas with the icon centered
        const iconBuffer = await sharp(INPUT)
            .resize(iconSize, iconSize, { fit: 'cover' })
            .png()
            .toBuffer();

        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        })
            .composite([{ input: iconBuffer, left: padding, top: padding }])
            .png()
            .toFile(path.join(dir, 'ic_launcher_foreground.png'));

        console.log(`  ✅ ${folder} foreground: ${size}x${size}`);
    }

    // Update adaptive icon XML to use PNG foreground instead of vector drawable
    const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

    const adaptiveDir = path.join(RES_DIR, 'mipmap-anydpi-v26');
    fs.writeFileSync(path.join(adaptiveDir, 'ic_launcher.xml'), adaptiveIconXml);
    fs.writeFileSync(path.join(adaptiveDir, 'ic_launcher_round.xml'), adaptiveIconXml);
    console.log('  ✅ Updated adaptive icon XMLs');

    // Update background color to match app theme
    const colorsPath = path.join(RES_DIR, 'values', 'ic_launcher_background.xml');
    const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#1a1a2e</color>
</resources>`;
    fs.writeFileSync(colorsPath, colorsXml);
    console.log('  ✅ Set icon background color to #1a1a2e');

    // Remove vector drawable foreground (we now use PNG)
    const vectorFgPath = path.join(RES_DIR, 'drawable-v24', 'ic_launcher_foreground.xml');
    if (fs.existsSync(vectorFgPath)) {
        fs.unlinkSync(vectorFgPath);
        console.log('  ✅ Removed old vector foreground');
    }

    // Remove vector drawable background
    const vectorBgPath = path.join(RES_DIR, 'drawable', 'ic_launcher_background.xml');
    if (fs.existsSync(vectorBgPath)) {
        fs.unlinkSync(vectorBgPath);
        console.log('  ✅ Removed old vector background');
    }

    console.log('\n🎉 All Android icons generated successfully!');
}

generateIcons().catch(console.error);
