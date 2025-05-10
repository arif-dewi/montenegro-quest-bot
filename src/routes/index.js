// routes/index.js
const { keyboard } = require('../keyboard');
const { steps, getLang } = require('../steps');
const { messages } = require('../messages');
const { generateCertificate } = require('../generateCertificate');
const {
  getUserState,
  setUserState,
  incrementCounter,
} = require('../db');

function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, '\\$1');
}

async function finishQuest(ctx, userId) {
  const userProgress = await getUserState(userId);
  const user = userProgress[userId];
  const lang = user.lang;
  const name = ctx.from.first_name || ctx.from.username || 'Explorer';

  await ctx.reply(t('finished', lang));
  await new Promise(resolve => setTimeout(resolve, 300));
  await ctx.reply(t('thanks_quest', lang));

  await new Promise(resolve => setTimeout(resolve, 500));
  await ctx.reply(t('feedback_intro', lang), keyboard.feedback(lang));

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const cert = await generateCertificate(name, lang);

    if (cert) {
      await ctx.replyWithPhoto({ source: cert }, {
        caption: `🏆 ${name}, ${t('certificate_caption', lang)}`
      });
    } else {
      await ctx.reply(t('cert_fail', lang));
    }
  } catch (e) {
    console.error('❌ Certificate error:', e.message);
    await ctx.reply(t('cert_fail', lang));
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  userProgress[userId] = { step: 0, lang };
  await ctx.reply(t('reset', lang), keyboard.start(lang));
}

function initRoutes(bot, db) {
  const langKeyboard = {
    reply_markup: {
      keyboard: [['🇷🇺 Русский'], ['🇲🇪 Crnogorski'], ['🇬🇧 English']],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  bot.start(async (ctx) => {
    await setUserState(ctx.chat.id, { step: -1 });
    await incrementCounter('start');
    await ctx.reply('🌍 Выбери язык / Select your language / Izaberi jezik:', langKeyboard);
  });

  bot.hears(['🇷🇺 Русский', '🇲🇪 Crnogorski', '🇬🇧 English'], async (ctx) => {
    const selected = ctx.message.text;
    const lang =
      selected.includes('Рус') ? 'ru'
        : selected.includes('Crnogorski') ? 'me'
          : 'en';

    await setUserState(ctx.chat.id, { step: 0, lang });
    await incrementCounter('lang:' + lang);

    const step = steps[0];
    await ctx.replyWithMarkdownV2(escapeMarkdownV2(step.story[lang]));
    await ctx.reply(step.question[lang], keyboard.main(lang));
  });

  bot.on(['text', 'photo'], async (ctx) => {
    try {
      const chatId = ctx.chat.id;
      const user = await getUserState(chatId);
      const lang = user.lang || getLang(ctx);

      if (user.step === -1) {
        await ctx.reply('🌍 Пожалуйста, выбери язык из предложенного списка.', langKeyboard);
        return;
      }

      const step = steps[user.step];
      if (!step) {
        ctx.reply('🏁 Квест завершён. Можешь начать заново.', keyboard.main(lang));
        return;
      }

      const messageText = ctx.message.text || '';
      const isPhoto = !!ctx.message.photo;
      const isCorrect = Array.isArray(step.answer)
        ? step.answer.some(pattern => new RegExp(pattern, 'i').test(messageText))
        : step.answer === 'photo' && isPhoto;

      if (isCorrect) {
        await ctx.reply(step.success?.[lang] || '✅');

        const nextStepIndex = user.step + 1;
        const nextStep = steps[nextStepIndex];
        await setUserState(chatId, { step: nextStepIndex, lang });
        await incrementCounter(`step:${nextStepIndex}`);

        if (nextStep) {
          await ctx.replyWithMarkdownV2(escapeMarkdownV2(nextStep.story[lang]));
          await ctx.reply(nextStep.question[lang], keyboard.main(lang));
        } else {
          finishQuest(ctx, chatId);
        }
      } else {
        ctx.reply(step.retryMessage || '❌ Неверно. Попробуй ещё раз.');
      }
    } catch (err) {
      console.error('❌ Ошибка маршрута:', err);
      ctx.reply('🚧 Что-то пошло не так. Попробуй ещё раз.');
    }
  });

  bot.command('help', (ctx) => ctx.reply(messages.help, keyboard.main(getLang(ctx))));
  bot.command('reset', async (ctx) => {
    await setUserState(ctx.chat.id, { step: -1 });
    ctx.reply('🔁 Квест сброшен. Выбери язык заново.', langKeyboard);
  });
}

module.exports = initRoutes;
