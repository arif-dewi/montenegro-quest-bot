// routes/index.js
const { keyboard } = require('../keyboard');
const { steps, getLang } = require('../steps');
const { messages } = require('../messages');
const { generateCertificate } = require('../generateCertificate');
const {
  getUserState,
  setUserState,
  incrementCounter,
  saveFeedback
} = require('../db');

function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, '\\$1');
}

async function finishQuest(ctx, userId, bot) {
  const userProgress = await getUserState(userId);
  const lang = userProgress.lang || 'en';
  const name = ctx.from.first_name || ctx.from.username || 'Explorer';

  await ctx.reply(messages.finished[lang]);
  await new Promise(resolve => setTimeout(resolve, 300));
  await ctx.reply(messages.thanks_quest[lang]);

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const cert = await generateCertificate(name, lang);

    if (cert) {
      await ctx.replyWithPhoto({ source: cert }, {
        caption: `🏆 ${name}, ${messages.certificate_caption[lang]}`
      });
    } else {
      await ctx.reply(messages.cert_fail?.[lang] || '❌ Certificate generation failed.');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    await ctx.reply(messages.feedback_intro[lang], keyboard.feedback);
    await incrementCounter('feedback');

    bot.on('text', async (ctx) => {
      const feedback = ctx.message.text;
      const ratingMatch = feedback.match(/^⭐️\s?([1-5])$/);
      const user = await getUserState(ctx.chat.id);

      if (ratingMatch) {
        const rating = parseInt(ratingMatch[1]);
        await setUserState(ctx.chat.id, { ...user, rating });
        return ctx.reply(messages.thanks_feedback[lang]);
      }

      if (user.rating && !user.comment) {
        await saveFeedback(ctx.chat.id, {
          rating: user.rating,
          comment: feedback,
          lang
        });
        await setUserState(ctx.chat.id, { step: -1 });
        return ctx.reply(messages.end_feedback[lang]);
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    await setUserState(userId, { step: 0, lang });
    await ctx.reply(messages.reset[lang], keyboard.start(lang));
  } catch (e) {
    console.error('❌ Certificate error:', e.message);
    await ctx.reply(messages.cert_fail?.[lang] || '❌ Certificate generation failed.');
  }
}

function initRoutes(bot) {
  bot.start(async (ctx) => {
    await setUserState(ctx.chat.id, { step: -1 });
    await incrementCounter('start');
    await ctx.reply('🌍 Выбери язык / Select your language / Izaberi jezik:', keyboard.lang);
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
        await ctx.reply('🌍 Пожалуйста, выбери язык из предложенного списка.', keyboard.lang);
        return;
      }

      const step = steps[user.step];
      if (!step) {
        ctx.reply('🏁 Квест завершён. Можешь начать заново.', keyboard.start(lang));
        await setUserState(chatId, { step: -1 });
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
          await ctx.reply(nextStep.question[lang], nextStep.keyboard || keyboard.main(lang));
        } else {
          finishQuest(ctx, chatId, bot);
        }
      } else {
        ctx.reply(step.retryMessage[lang] || '❌ Неверно. Попробуй ещё раз.');
      }
    } catch (err) {
      console.error('❌ Ошибка маршрута:', err);
      ctx.reply('🚧 Что-то пошло не так. Попробуй ещё раз.');
    }
  });

  bot.command('help', (ctx) => ctx.reply(messages.help, keyboard.main(getLang(ctx))));
  bot.command('reset', async (ctx) => {
    await setUserState(ctx.chat.id, { step: -1 });
    ctx.reply('🔁 Квест сброшен. Выбери язык заново.', keyboard.lang);
  });
}

module.exports = initRoutes;
