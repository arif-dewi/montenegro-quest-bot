const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

/**
 * Generates a certificate image for quest completion that matches the provided example
 * @param {string} name - Player name
 * @param {string} lang - Language code (en, ru, me)
 * @returns {Buffer} - Image buffer
 */
const generateCertificate = async (name, lang = 'en') => {
  // Register custom fonts if available
  try {
    const fontsDir = path.join(__dirname, 'fonts');
    if (fs.existsSync(path.join(fontsDir, 'BlackChancery.ttf'))) {
      registerFont(path.join(fontsDir, 'BlackChancery.ttf'), { family: 'BlackChancery' });
    }
    if (fs.existsSync(path.join(fontsDir, 'OldEnglish.ttf'))) {
      registerFont(path.join(fontsDir, 'OldEnglish.ttf'), { family: 'OldEnglish' });
    }
  } catch (err) {
    console.warn('Font registration error:', err.message);
    // Continue without custom fonts if they can't be loaded
  }

  // Create canvas with proper dimensions
  const width = 1000;
  const height = 1400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Load background image, or create a vintage background if image not available
  try {
    const background = await loadImage(path.join(__dirname, 'certificate_background.png'));
    ctx.drawImage(background, 0, 0, width, height);
  } catch (err) {
    console.warn('Background image not found, using generated background');
    // Create a vintage parchment background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#d5bc93');
    gradient.addColorStop(0.5, '#d5bc93');
    gradient.addColorStop(1, '#c4ae87');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add some texture
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#c4ae87' : '#e5cd9f';
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 3,
        Math.random() * 3
      );
    }
    ctx.globalAlpha = 1;

    // Draw border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Draw ornate corners
    const cornerSize = 120;
    ctx.lineWidth = 5;
    // Top left
    ctx.beginPath();
    ctx.moveTo(40, 40 + cornerSize);
    ctx.quadraticCurveTo(40, 40, 40 + cornerSize, 40);
    ctx.stroke();
    // Top right
    ctx.beginPath();
    ctx.moveTo(width - 40 - cornerSize, 40);
    ctx.quadraticCurveTo(width - 40, 40, width - 40, 40 + cornerSize);
    ctx.stroke();
    // Bottom left
    ctx.beginPath();
    ctx.moveTo(40, height - 40 - cornerSize);
    ctx.quadraticCurveTo(40, height - 40, 40 + cornerSize, height - 40);
    ctx.stroke();
    // Bottom right
    ctx.beginPath();
    ctx.moveTo(width - 40 - cornerSize, height - 40);
    ctx.quadraticCurveTo(width - 40, height - 40, width - 40, height - 40 - cornerSize);
    ctx.stroke();

    // Add decorative swirls
    const drawSwirl = (x, y, size, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size/2, -size/2, size, -size/4, size, 0);
      ctx.bezierCurveTo(size, size/4, size/2, size/2, 0, 0);
      ctx.stroke();
      ctx.restore();
    };

    ctx.lineWidth = 3;
    // Top border swirls
    for (let i = 0; i < 5; i++) {
      drawSwirl(width/2 - 200 + i*100, 60, 40, 0);
    }
    // Bottom border swirls
    for (let i = 0; i < 5; i++) {
      drawSwirl(width/2 - 200 + i*100, height - 60, 40, Math.PI);
    }
    // Left border swirls
    for (let i = 0; i < 7; i++) {
      drawSwirl(60, height/2 - 300 + i*100, 40, Math.PI/2);
    }
    // Right border swirls
    for (let i = 0; i < 7; i++) {
      drawSwirl(width - 60, height/2 - 300 + i*100, 40, -Math.PI/2);
    }
  }

  // Translations
  const textMap = {
    en: {
      title: 'Certificate',
      line1: 'has successfully completed',
      line2: 'the quest',
      quest: '"Signal from the Lighthouse"',
      location: 'Budva, Montenegro'
    },
    ru: {
      title: 'Сертификат',
      line1: 'успешно завершил(а)',
      line2: 'квест',
      quest: '«Сигнал с Маяка»',
      location: 'Будва, Черногория'
    },
    me: {
      title: 'Sertifikat',
      line1: 'uspješno je završio/la',
      line2: 'potragu',
      quest: '„Signal sa Svetionika"',
      location: 'Budva, Crna Gora'
    }
  };

  const text = textMap[lang] || textMap.en;

  // Draw medal icon
  try {
    const medalSize = 100;
    const medalX = width/2 - 150;
    const medalY = 260;
    const medal = await loadImage(path.join(__dirname, 'medal.png'));
    ctx.drawImage(medal, medalX, medalY, medalSize, medalSize);
  } catch (err) {
    console.warn('Medal image not found, drawing a simple medal');
    // Draw simple medal if image not available
    const medalX = width/2 - 150;
    const medalY = 260;
    const medalSize = 100;

    // Medal circle
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(medalX + medalSize/2, medalY + medalSize/2, medalSize/2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(medalX + medalSize/2, medalY + medalSize/2, medalSize/2 - 5, 0, Math.PI * 2);
    ctx.stroke();

    // Star in medal
    ctx.fillStyle = '#FFFFFF';
    const starX = medalX + medalSize/2;
    const starY = medalY + medalSize/2;
    const spikes = 5;
    const outerRadius = medalSize/2 - 15;
    const innerRadius = outerRadius/2;

    ctx.beginPath();
    let rot = Math.PI / 2 * 3;
    let x = starX;
    let y = starY;
    let step = Math.PI / spikes;

    ctx.moveTo(starX, starY - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = starX + Math.cos(rot) * outerRadius;
      y = starY + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = starX + Math.cos(rot) * innerRadius;
      y = starY + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(starX, starY - outerRadius);
    ctx.closePath();
    ctx.fill();

    // Ribbon
    ctx.fillStyle = '#DAA520';
    ctx.beginPath();
    ctx.moveTo(medalX + medalSize/2 - 20, medalY + medalSize);
    ctx.lineTo(medalX + medalSize/2 + 20, medalY + medalSize);
    ctx.lineTo(medalX + medalSize/2 + 30, medalY + medalSize + 30);
    ctx.lineTo(medalX + medalSize/2, medalY + medalSize + 20);
    ctx.lineTo(medalX + medalSize/2 - 30, medalY + medalSize + 30);
    ctx.closePath();
    ctx.fill();
  }

  // Set up text rendering
  const centerX = width / 2;

  // Title - "Certificate"
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  try {
    ctx.font = 'bold 80px OldEnglish, BlackChancery, serif';
  } catch (err) {
    console.warn('Font error:', err.message);
    ctx.font = 'bold 80px serif';
  }
  ctx.fillText(text.title, centerX + 50, 300);

  // Name
  try {
    ctx.font = 'bold 70px OldEnglish, BlackChancery, serif';
  } catch (err) {
    ctx.font = 'bold 70px serif';
  }
  ctx.fillText(name, centerX, 450);

  // "has successfully completed the quest"
  ctx.font = 'bold 40px Times New Roman, serif';
  ctx.fillText(text.line1, centerX, 550);
  ctx.fillText(text.line2, centerX, 610);

  // Quest name
  try {
    ctx.font = 'bold 70px OldEnglish, BlackChancery, serif';
  } catch (err) {
    ctx.font = 'bold 70px serif';
  }
  const questLines = fitTextToWidth(text.quest, width - 200, ctx);
  let questY = 750;
  for (const line of questLines) {
    ctx.fillText(line, centerX, questY);
    questY += 80;
  }

  // Location with icon
  ctx.font = '40px Times New Roman, serif';
  const locationX = centerX;
  const locationY = height - 300;

  // Draw location pin icon
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(locationX - text.location.length * 8, locationY - 15, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(locationX - text.location.length * 8, locationY - 15);
  ctx.lineTo(locationX - text.location.length * 8, locationY + 10);
  ctx.lineTo(locationX - text.location.length * 8 - 15, locationY - 5);
  ctx.fill();

  ctx.fillText(text.location, locationX, locationY);

  // Date with icon
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = today.toLocaleDateString(
    lang === 'ru' ? 'ru-RU' : lang === 'me' ? 'sr-ME' : 'en-US',
    options
  );
  const dateX = centerX;
  const dateY = height - 200;

  // Calendar icon
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  const calX = dateX - dateStr.length * 4 - 30;
  const calY = dateY - 25;
  const calWidth = 30;
  const calHeight = 30;

  // Calendar body
  ctx.strokeRect(calX, calY, calWidth, calHeight);

  // Calendar top
  ctx.beginPath();
  ctx.moveTo(calX + 5, calY - 5);
  ctx.lineTo(calX + 5, calY);
  ctx.moveTo(calX + calWidth - 5, calY - 5);
  ctx.lineTo(calX + calWidth - 5, calY);
  ctx.stroke();

  // Calendar lines
  ctx.beginPath();
  ctx.moveTo(calX, calY + calHeight/3);
  ctx.lineTo(calX + calWidth, calY + calHeight/3);
  ctx.moveTo(calX, calY + calHeight*2/3);
  ctx.lineTo(calX + calWidth, calY + calHeight*2/3);
  ctx.moveTo(calX + calWidth/3, calY);
  ctx.lineTo(calX + calWidth/3, calY + calHeight);
  ctx.moveTo(calX + calWidth*2/3, calY);
  ctx.lineTo(calX + calWidth*2/3, calY + calHeight);
  ctx.stroke();

  ctx.fillText(dateStr, dateX, dateY);

  return canvas.toBuffer();
}

/**
 * Breaks text into lines that fit within a maximum width
 * @param {string} text - The text to fit
 * @param {number} maxWidth - The maximum width in pixels
 * @param {CanvasRenderingContext2D} ctx - Canvas context for measuring text
 * @returns {string[]} - Array of lines
 */
function fitTextToWidth(text, maxWidth, ctx) {
  // For short text, return as is
  if (ctx.measureText(text).width <= maxWidth) {
    return [text];
  }

  // For longer text, break at appropriate points
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }

  lines.push(currentLine);
  return lines;
}

module.exports = { generateCertificate };