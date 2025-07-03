const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

// Register fonts
registerFont(path.join(__dirname, 'fonts', 'OldEnglish.ttf'), {
  family: 'OldEnglish',
});
registerFont(path.join(__dirname, 'fonts', 'BlackChancery.ttf'), {
  family: 'BlackChancery',
});

/**
 * Generates a certificate image with user name and localized text
 * @param {string} name - Player's name
 * @param {string} lang - Language code ('en', 'ru', 'me')
 * @returns {Promise<Buffer>} PNG buffer of the certificate
 */
const generateCertificate = async (name, lang = 'en') => {
  const width = 800;
  const height = 1131;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  try {
    // Load and draw background image
    const background = await loadImage(path.join(__dirname, 'back.png'));
    ctx.drawImage(background, 0, 0, width, height);
  } catch (error) {
    console.error('❌ Failed to load certificate background:', error);
    throw new Error('Background image missing or unreadable');
  }

  // Localized text content
  const textMap = {
    en: {
      title: 'Certificate',
      line1: 'has successfully completed',
      line2: 'the quest',
      quest: 'Signal from\nthe Lighthouse',
      location: 'Budva, Montenegro',
    },
    ru: {
      title: 'Сертификат',
      line1: 'успешно завершил(а)',
      line2: 'квест',
      quest: 'Сигнал с\nМаяка',
      location: 'Будва, Черногория',
    },
    me: {
      title: 'Sertifikat',
      line1: 'uspješno je završio/la',
      line2: 'potragu',
      quest: 'Signal sa\nSvetionika',
      location: 'Budva, Crna Gora',
    },
  };

  const text = textMap[lang] || textMap.en;
  const centerX = width / 2;

  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';

  // Title
  ctx.font = '70px OldEnglish';
  ctx.fillText(text.title, centerX, 200);

  // Player name
  ctx.font = '55px BlackChancery';
  ctx.fillText(name, centerX, 290);

  // Subtitle lines
  ctx.font = '30px serif';
  ctx.fillText(text.line1, centerX, 370);
  ctx.fillText(text.line2, centerX, 410);

  // Quest title
  ctx.font = 'bold 42px OldEnglish';
  const questLines = text.quest.split('\n');
  ctx.fillText(questLines[0], centerX, 490);
  ctx.fillText(questLines[1], centerX, 540);

  // Location
  ctx.font = '28px serif';
  ctx.fillText(text.location, centerX, 630);

  // Localized date
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'me' ? 'sr-ME' : 'en-US';
  const dateStr = today.toLocaleDateString(locale, options);
  ctx.fillText(dateStr, centerX, 680);

  return canvas.toBuffer();
};

module.exports = { generateCertificate };