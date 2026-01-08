const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// Optionally register a default font that's available in the environment
try {
  registerFont(path.join(__dirname, '..', '..', 'fonts', 'Inter-Regular.ttf'), { family: 'Inter' });
} catch (e) {
  // ignore if font not present
}

async function generateCertificatePdf({
  templatePath,
  name,
  coords,
  fontSize = 40,
  fontColor = '#000000',
  qrCoords = null,
  qrSize = 100,
  verificationId = null,
  outputPath
}) {
  // Load template image
  const img = await loadImage(templatePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.drawImage(img, 0, 0, img.width, img.height);

  // Draw name
  ctx.fillStyle = fontColor || '#000000';
  const fsz = fontSize || 40;
  ctx.font = `${fsz}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const x = coords && typeof coords.nameX === 'number' ? coords.nameX : img.width / 2;
  const y = coords && typeof coords.nameY === 'number' ? coords.nameY : img.height / 2;

  ctx.fillText(name, x, y);

  // Draw QR code if coordinates are provided
  if (qrCoords && typeof qrCoords.qrX === 'number' && typeof qrCoords.qrY === 'number') {
    try {
      // Generate QR code with naming only
      const qrDataUrl = await QRCode.toDataURL(name, {
        width: qrSize || 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Load QR code image
      const qrImage = await loadImage(qrDataUrl);

      // Draw QR code centered at the specified coordinates
      const qrX = qrCoords.qrX - (qrSize / 2);
      const qrY = qrCoords.qrY - (qrSize / 2);

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    } catch (qrError) {
      console.error('Failed to generate QR code:', qrError);
      // Continue without QR code if generation fails
    }
  }

  // Convert canvas to PNG buffer
  const pngBuffer = canvas.toBuffer('image/png');

  // Create PDF and embed PNG
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [img.width, img.height] });
    const out = fs.createWriteStream(outputPath);
    out.on('finish', resolve);
    out.on('error', reject);
    doc.pipe(out);
    doc.image(pngBuffer, 0, 0, { width: img.width, height: img.height });
    doc.end();
  });

  return outputPath;
}

module.exports = { generateCertificatePdf };
