// routes/index.js
const { mainKeyboard } = require('../keyboard');
const { steps, getLang } = require('../steps');
const { messages } = require('../messages');
const { generateCertificate } = require('../generateCertificate');
const {
  getUserState,
  setUserState,
  incrementCounter,
} = require('../db');

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
    await ctx.replyWithMarkdownV2(step.story[lang]);
    await ctx.reply(step.question[lang], step.keyboard);
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
        ctx.reply('🏁 Квест завершён. Можешь начать заново.', mainKeyboard);
        return;
      }

      const messageText = ctx.message.text || '';
      const isPhoto = !!ctx.message.photo;
      const isCorrect = Array.isArray(step.answer)
        ? step.answer.some(pattern => new RegExp(pattern, 'i').test(messageText))
        : step.answer === 'photo' && isPhoto;

      if (isCorrect) {
        const nextStepIndex = user.step + 1;
        const nextStep = steps[nextStepIndex];
        await setUserState(chatId, { step: nextStepIndex, lang });
        await incrementCounter(`step:${nextStepIndex}`);

        if (nextStep) {
          await ctx.replyWithMarkdownV2(nextStep.story[lang]);
          await ctx.reply(nextStep.question[lang], nextStep.keyboard);
        } else {
          await ctx.reply('🎉 Квест завершён!');
          await generateCertificate(ctx.from, db);
        }
      } else {
        ctx.reply(step.retryMessage || '❌ Неверно. Попробуй ещё раз.');
      }
    } catch (err) {
      console.error('❌ Ошибка маршрута:', err);
      ctx.reply('🚧 Что-то пошло не так. Попробуй ещё раз.');
    }
  });

  bot.command('help', (ctx) => ctx.reply(messages.help, mainKeyboard));
  bot.command('reset', async (ctx) => {
    await setUserState(ctx.chat.id, { step: -1 });
    ctx.reply('🔁 Квест сброшен. Выбери язык заново.', {
      reply_markup: {
        keyboard: [['🇷🇺 Русский'], ['🇲🇪 Crnogorski'], ['🇬🇧 English']],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  });
}

module.exports = initRoutes;
