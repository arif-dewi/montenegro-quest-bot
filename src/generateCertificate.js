const { createCanvas, loadImage } = require('canvas');
const path = require('path');

export const generateCertificate = async (name, lang = 'en') => {
  const background = await loadImage(path.join(__dirname, 'certificate_background.png'));
  const canvas = createCanvas(background.width, background.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(background, 0, 0);

  const textMap = {
    en: {
      title: '🏅 Certificate of Completion',
      line: 'has successfully completed the quest:',
      quest: '“Signal from the Lighthouse”',
      location: 'Budva, Montenegro'
    },
    ru: {
      title: '🏅 Грамота об окончании',
      line: 'успешно завершил(а) квест:',
      quest: '«Сигнал с Маяка»',
      location: 'Будва, Черногория'
    },
    me: {
      title: '🏅 Sertifikat o Završetku',
      line: 'uspješno je završio/la potragu:',
      quest: '„Signal sa Svetionika“',
      location: 'Budva, Crna Gora'
    }
  };

  const text = textMap[lang] || textMap.en;

  ctx.font = 'bold 30px Georgia';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';

  const centerX = canvas.width / 2;
  let y = 170;

  ctx.fillText(text.title, centerX, y);
  y += 60;
  ctx.fillText(name, centerX, y);
  y += 40;
  ctx.fillText(text.line, centerX, y);
  y += 40;
  ctx.fillText(text.quest, centerX, y);
  y += 40;
  ctx.fillText(text.location, centerX, y);
  y += 30;
  ctx.fillText(new Date().toLocaleDateString(), centerX, y);

  return canvas.toBuffer();
}

bot.on('photo', async (ctx) => {
  const id = ctx.from.id;
  const user = userProgress[id];
  const lang = user.lang;
  const step = steps[user.step];

  if (step.answer === 'photo') {
    user.step++;

    ctx.reply(t('finished', lang));
    ctx.reply(t('feedback_intro', lang), {
      reply_markup: {
        keyboard: [['⭐️ 1', '⭐️ 2', '⭐️ 3'], ['⭐️ 4', '⭐️ 5']],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });

    const playerName = ctx.from.first_name || ctx.from.username || 'Explorer';
    const certificateImage = await generateCertificate(playerName, lang);

    await ctx.replyWithPhoto({ source: certificateImage }, {
      caption: `🏆 ${playerName}, you’ve completed the quest!`
    });

  } else {
    ctx.reply("🤔 Сейчас не требуется фото. Ответь на загадку текстом.");
  }
});