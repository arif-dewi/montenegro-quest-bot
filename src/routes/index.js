const { keyboard, keyboardButtons } = require('../keyboard');
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

async function finishQuest(ctx, userId) {
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

    await setUserState(userId, { ...userProgress, step: 'feedback_rating' });
  } catch (e) {
    console.error('❌ Certificate error:', e.message);
    await ctx.reply(messages.cert_fail?.[lang] || '❌ Certificate generation failed.');
  }
}

// Handle language selection
async function handleLanguageSelection(ctx) {
  const selected = ctx.message.text;
  const lang =
    selected.includes('Рус') ? 'ru' :
      selected.includes('Crnogorski') ? 'me' :
        'en';

  await setUserState(ctx.chat.id, { step: 0, lang });
  await incrementCounter('lang:' + lang);

  const step = steps[0];
  await ctx.reply(messages.welcome[lang] || 'Welcome to the quest!');
  await Promise.resolve(setTimeout(() => {}, 500));

  await ctx.replyWithMarkdownV2(escapeMarkdownV2(step.story[lang]));
  await ctx.reply(step.question[lang], keyboard.main(lang));
}

// Handle feedback rating
async function handleFeedbackRating(ctx, user) {
  const input = ctx.message.text || '';
  const lang = user.lang || 'en';
  const ratingMatch = input.match(/⭐️ (\d)/);

  if (ratingMatch) {
    const rating = parseInt(ratingMatch[1]);
    await setUserState(ctx.chat.id, {
      ...user,
      step: 'feedback_comment',
      feedback: { rating }
    });
    await ctx.reply(messages.thanks_feedback[lang] || 'Please share your thoughts about the quest:');
  } else {
    await ctx.reply(
      messages.invalid_rating[lang] || 'Please select a rating from the buttons below:',
      keyboard.feedback
    );
  }
}

// Handle feedback comment
async function handleFeedbackComment(ctx, user) {
  const chatId = ctx.chat.id;
  const input = ctx.message.text || '';
  const lang = user.lang || 'en';
  const rating = user.feedback?.rating;

  // Save feedback with the correct parameter structure
  await saveFeedback(chatId, {
    rating: rating,
    comment: input,
    lang: lang
  });

  await ctx.reply(messages.end_feedback[lang] || 'Thank you for your feedback!');
  await setUserState(chatId, { step: 'completed', lang });

  // restart
  await new Promise(resolve => setTimeout(resolve, 500));
  await setUserState(chatId, { step: -1 });
  await ctx.reply(
    messages.reset?.[lang] || 'You can restart the quest anytime.',
    keyboard.start(lang)
  );
}

// Handle quest steps
async function handleQuestStep(ctx, user) {
  const chatId = ctx.chat.id;
  const lang = user.lang || 'en';
  const input = ctx.message.text || '';
  const step = steps[user.step];

  if (!step) {
    await ctx.reply('🏁 Квест завершён. Можешь начать заново.', keyboard.start(lang));
    await setUserState(chatId, { step: -1 });
    return;
  }

  const isPhoto = !!ctx.message.photo;
  const isCorrect = Array.isArray(step.answer)
    ? step.answer.some(pattern => new RegExp(pattern, 'i').test(input))
    : step.answer === 'photo' && isPhoto;

  if (isCorrect) {
    await ctx.reply(step.success?.[lang] || '✅');

    const nextStepIndex = user.step + 1;
    const nextStep = steps[nextStepIndex];
    await setUserState(chatId, { step: nextStepIndex, lang });
    await incrementCounter(`step:${nextStepIndex}`);

    if (nextStep) {
      await ctx.replyWithMarkdownV2(escapeMarkdownV2(nextStep.story[lang]));
      await ctx.reply(
        nextStep.question[lang],
        nextStep.keyboard || keyboard.main(lang)
      );
    } else {
      await finishQuest(ctx, chatId);
    }
  } else {
    await ctx.reply(step.retryMessage?.[lang] || '❌ Неверно. Попробуй ещё раз.');
  }
}

// Main message handler
async function handleMessage(ctx) {
  try {
    const chatId = ctx.chat.id;
    const user = await getUserState(chatId);
    const lang = user.lang || getLang(ctx);

    // If this is a command, let it be handled by command handlers
    if (ctx.message.text?.startsWith('/')) return;

    // Language selection needed
    if (user.step === -1) {
      await ctx.reply(
        '🌍 Пожалуйста, выбери язык. ' +
        'Select your language. ' +
        'Izaberi jezik. '
        , keyboard.lang);
      return;
    }

    // Handle different steps based on user state
    switch (user.step) {
      case 'feedback_rating':
        await handleFeedbackRating(ctx, user);
        break;

      case 'feedback_comment':
        await handleFeedbackComment(ctx, user);
        break;

      case 'completed':
        await ctx.reply(
          messages.quest_already_completed?.[lang] || 'You have already completed the quest.',
          keyboard.start(lang)
        );
        break;

      default:
        // Handle regular numbered quest steps
        if (typeof user.step === 'number') {
          await handleQuestStep(ctx, user);
        }
    }
  } catch (err) {
    console.error('❌ Ошибка маршрута:', err);
    await ctx.reply('🚧 Что-то пошло не так. Попробуй ещё раз.');
  }
}

const reset = async (ctx) => {
  await setUserState(ctx.chat.id, { step: -1 });
  const lang = getLang(ctx);
  ctx.reply(messages.reset[lang], keyboard.start(lang));
}

const help = async (ctx) => {
  const lang = getLang(ctx);
  ctx.reply(messages.help[lang], keyboard.main(lang));
}

// Initialize all bot routes
function initRoutes(bot) {
  // Start command
  bot.start(async (ctx) => {
    await setUserState(ctx.chat.id, { step: -1 });
    await incrementCounter('start');
    await ctx.reply('🌍 Выбери язык / Select your language / Izaberi jezik:', keyboard.lang);
  });

  // Language selection
  bot.hears(['🇷🇺 Русский', '🇲🇪 Crnogorski', '🇬🇧 English'], handleLanguageSelection);

  // Handle reset
  bot.hears(Object.values(keyboardButtons.reset), reset);
  bot.command('reset', reset);

  // Handle help
  bot.hears(Object.values(keyboardButtons.help), help);
  bot.command('help', help);

  // Main message handler for text and photos
  bot.on(['text', 'photo'], handleMessage);

  // Privacy command
  bot.command('privacy', (ctx) => {
    ctx.reply(messages.privacy[getLang(ctx)]);
  });
}

module.exports = initRoutes;