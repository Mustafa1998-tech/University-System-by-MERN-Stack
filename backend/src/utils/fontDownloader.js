const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '../assets/fonts');

// Ensure fonts directory exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Download Noto Sans Arabic from Google Fonts
const downloadFont = (url, filename) => {
  return new Promise((resolve, reject) => {
    const fontPath = path.join(fontsDir, filename);
    
    // Check if font already exists
    if (fs.existsSync(fontPath)) {
      console.log(`Font ${filename} already exists`);
      return resolve(fontPath);
    }

    const file = fs.createWriteStream(fontPath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Font ${filename} downloaded successfully`);
        resolve(fontPath);
      });
    }).on('error', (err) => {
      fs.unlink(fontPath, () => {}); // Delete file on error
      console.error(`Error downloading font ${filename}:`, err.message);
      reject(err);
    });
  });
};

// Download Arabic fonts
const downloadArabicFonts = async () => {
  try {
    console.log('Downloading Arabic fonts...');
    
    // Note: These are placeholder URLs. In production, you would use actual font URLs
    // or include fonts in your project assets
    const fonts = [
      {
        name: 'NotoSansArabic-Regular.ttf',
        // This is a placeholder - replace with actual font URL or include font files
        url: 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l-b6_h7.ttf'
      },
      {
        name: 'Cairo-Regular.ttf',
        url: 'https://fonts.gstatic.com/s/cairo/v17/SLXgc1nY6HkvalIkTp2mxdt0UX8.ttf'
      }
    ];

    for (const font of fonts) {
      try {
        await downloadFont(font.url, font.name);
      } catch (error) {
        console.warn(`Failed to download ${font.name}, will use fallback font`);
      }
    }
    
    console.log('Font download process completed');
  } catch (error) {
    console.error('Error in font download process:', error);
  }
};

// Create a simple Arabic font file as fallback
const createFallbackFont = () => {
  const fallbackPath = path.join(fontsDir, 'arabic-fallback.txt');
  fs.writeFileSync(fallbackPath, 'Arabic font fallback - use system font');
  console.log('Created fallback font marker');
};

module.exports = {
  downloadArabicFonts,
  createFallbackFont,
  fontsDir
};

// Run if called directly
if (require.main === module) {
  createFallbackFont();
  downloadArabicFonts().catch(console.error);
}