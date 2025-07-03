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

/**
 * Escape MarkdownV2 characters
 */
function escapeMarkdownV2(text) {
  return text.replace(/([_*[\]()~`>#+=|{}.!\\-])/g, '\\$1');
}

/**
 * Called when user completes all quest steps
 */
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
    console.error('❌ Certificate generation error:', e.message);
    await ctx.reply(messages.cert_fail?.[lang] || '❌ Certificate generation failed.');
  }
}

/**
 * Handles language selection at the start
 */
async function handleLanguageSelection(ctx) {
  const selected = ctx.message.text;
  const lang =
    selected.includes('Рус') ? 'ru' :
      selected.includes('Crnogorski') ? 'me' : 'en';

  await setUserState(ctx.chat.id, { step: 0, lang });
  await incrementCounter(`lang:${lang}`);

  const step = steps[0];
  await ctx.reply(messages.welcome[lang] || 'Welcome to the quest!');
  await new Promise(resolve => setTimeout(resolve, 500));
  await ctx.replyWithMarkdownV2(escapeMarkdownV2(step.story[lang]));
  await ctx.reply(step.question[lang], keyboard.main(lang));
}

/**
 * Handles star-rating input from user
 */
async function handleFeedbackRating(ctx, user) {
  const input = ctx.message.text || '';
  const lang = user.lang || 'en';
  const match = input.match(/⭐️ (\d)/);

  if (match) {
    const rating = parseInt(match[1], 10);
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

/**
 * Handles feedback comment input
 */
async function handleFeedbackComment(ctx, user) {
  const chatId = ctx.chat.id;
  const input = ctx.message.text || '';
  const lang = user.lang || 'en';
  const rating = user.feedback?.rating;

  await saveFeedback(chatId, {
    rating,
    comment: input,
    lang
  });

  await ctx.reply(messages.end_feedback[lang] || 'Thank you for your feedback!');
  await setUserState(chatId, { step: 'completed', lang });

  // Restart the quest
  await new Promise(resolve => setTimeout(resolve, 500));
  await setUserState(chatId, { step: -1 });
  await ctx.reply(messages.reset?.[lang] || 'You can restart the quest anytime.', keyboard.start(lang));
}

/**
 * Handles a regular quest step
 */
async function handleQuestStep(ctx, user) {
  const chatId = ctx.chat.id;
  const lang = user.lang || 'en';
  const input = ctx.message.text || '';
  const step = steps[user.step];

  if (!step) {
    await ctx.reply('🏁 The quest is complete. You can restart anytime.', keyboard.start(lang));
    await setUserState(chatId, { step: -1 });
    return;
  }

  const isPhoto = !!ctx.message.photo;
  const isCorrect = Array.isArray(step.answer)
    ? step.answer.some((pattern) => new RegExp(pattern, 'i').test(input))
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
      await finishQuest(ctx, chatId);
    }
  } else {
    await ctx.reply(step.retryMessage?.[lang] || '❌ Incorrect. Try again.');
  }
}

/**
 * Handles any incoming text or photo message
 */
async function handleMessage(ctx) {
  try {
    const chatId = ctx.chat.id;
    const user = await getUserState(chatId);
    const lang = user.lang || getLang(ctx);

    // Skip command handlers
    if (ctx.message.text?.startsWith('/')) return;

    if (user.step === -1) {
      await ctx.reply(
        '🌍 Please select a language. ' +
        'Выбери язык. ' +
        'Izaberi jezik.',
        keyboard.lang
      );
      return;
    }

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
        if (typeof user.step === 'number') {
          await handleQuestStep(ctx, user);
        }
    }
  } catch (err) {
    console.error('❌ Message handler error:', err);
    await ctx.reply('🚧 Something went wrong. Please try again.');
  }
}

// Reset user state
const reset = async (ctx) => {
  await setUserState(ctx.chat.id, { step: -1 });
  const lang = getLang(ctx);
  await ctx.reply(messages.reset[lang], keyboard.start(lang));
};

// Help command handler
const help = async (ctx) => {
  const lang = getLang(ctx);
  await ctx.reply(messages.help[lang], keyboard.main(lang));
};

/**
 * Initializes all bot routes and handlers
 */
function initRoutes(bot) {
  // Start command
  bot.start(async (ctx) => {
    await setUserState(ctx.chat.id, { step: -1 });
    await incrementCounter('start');
    await ctx.reply('🌍 Please select a language / Выбери язык / Izaberi jezik:', keyboard.lang);
  });

  // Language selection
  bot.hears(['🇷🇺 Русский', '🇲🇪 Crnogorski', '🇬🇧 English'], handleLanguageSelection);

  // Reset handlers
  bot.hears(Object.values(keyboardButtons.reset), reset);
  bot.command('reset', reset);

  // Help handlers
  bot.hears(Object.values(keyboardButtons.help), help);
  bot.command('help', help);

  // Main message handler
  bot.on(['text', 'photo'], handleMessage);

  // Privacy policy
  bot.command('privacy', (ctx) => {
    ctx.reply(messages.privacy[getLang(ctx)]);
  });
}

module.exports = initRoutes;