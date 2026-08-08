const fs = require('fs');
try {
  fs.copyFileSync(
    'C:\\Users\\Prasad\\.gemini\\antigravity-ide\\brain\\7d9caa9a-fbdf-4305-b0bb-0420900cf123\\certicraft_isometric_hero_1785599877660.png', 
    'c:\\Users\\Prasad\\Desktop\\certicrafttt\\frontend\\public\\hero-isometric.png'
  );
  console.log("Image copied successfully!");
} catch (e) {
  console.error("Error copying image:", e);
}
