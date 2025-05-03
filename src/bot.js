require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs').promises;
const express = require('express');
const app = express();
const { generateCertificate } = require('./generateCertificate');
const { steps } = require('./steps');
const { messages } = require('./messages');

// Validate required environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('ERROR: BOT_TOKEN is required in .env file');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.warn('WARNING: WEBHOOK_URL not set. Keep-alive ping will not work');
}

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Constants
const QUEST_TITLE = {
  me: "🗝️ *Potraga: Signal sa Svetionika*",
  ru: "🗝️ *Квест: Сигнал с Маяка*",
  en: "🗝️ *Quest: Signal from the Lighthouse*"
};

// User state storage
const userProgress = {};
const userFeedback = {};

// Keyboard layouts
const mainKeyboard = Markup.keyboard([
  ['▶️ Начать квест'],
  ['🔁 Сброс', '❓ Помощь'],
  ['🧪 Тест грамоты']
]).resize();

const languageKeyboard = Markup.keyboard([
  ['🇲🇪 Crnogorski'],
  ['🇷🇺 Русский'],
  ['🇬🇧 English']
]).oneTime().resize();

const feedbackKeyboard = Markup.keyboard([
  ['⭐️ 1', '⭐️ 2', '⭐️ 3'],
  ['⭐️ 4', '⭐️ 5']
]).oneTime().resize();

// Helper functions
/**
 * Get translated message by key and language
 * @param {string} id - Message ID
 * @param {string} lang - Language code
 * @returns {string} - Translated message
 */
function t(id, lang) {
  return messages[id]?.[lang] || "⚠️ Missing translation";
}

/**
 * Normalize text input for comparison
 * @param {string} str - Input string
 * @returns {string} - Normalized string
 */
function normalize(str) {
  return str.trim().toLowerCase();
}

/**
 * Check if input matches any of the expected patterns
 * @param {string} input - User input
 * @param {string[]} expectedPatterns - Array of regex patterns
 * @returns {boolean} - Whether input matches any pattern
 */
function matches(input, expectedPatterns) {
  const cleanedInput = normalize(input);
  return expectedPatterns.some((pattern) => {
    const regex = new RegExp(`^${pattern}$`, 'i');
    return regex.test(cleanedInput);
  });
}

/**
 * Save feedback to file
 * @param {number} userId - User ID
 * @param {object} feedback - Feedback data
 */
async function saveFeedback(userId, feedback) {
  try {
    const feedbackData = JSON.stringify({ id: userId, ...feedback }) + '\n';
    await fs.appendFile('feedback.json', feedbackData);
  } catch (error) {
    console.error(`Error saving feedback: ${error.message}`);
  }
}

// Bot commands
bot.start((ctx) => {
  try {
    ctx.reply('🗝️ Добро пожаловать в квест "Сигнал с Маяка"!\n\nНажми ▶️ «Начать квест», чтобы начать приключение.', mainKeyboard);
  } catch (error) {
    console.error(`Error in start command: ${error.message}`);
    ctx.reply('Sorry, an error occurred. Please try again.');
  }
});

bot.hears('▶️ Начать квест', (ctx) => {
  try {
    const id = ctx.from.id;
    userProgress[id] = { step: 0, lang: 'ru' }; // default lang ru
    ctx.reply(t('chooseLang', 'ru'), languageKeyboard);
  } catch (error) {
    console.error(`Error starting quest: ${error.message}`);
    ctx.reply('Sorry, an error occurred. Please try again.');
  }
});

bot.hears(['🇲🇪 Crnogorski', '🇷🇺 Русский', '🇬🇧 English'], (ctx) => {
  try {
    const id = ctx.from.id;
    const langMap = {
      '🇲🇪 Crnogorski': 'me',
      '🇷🇺 Русский': 'ru',
      '🇬🇧 English': 'en'
    };
    const lang = langMap[ctx.message.text];

    if (!lang) {
      ctx.reply('Language not recognized. Please select a language.', languageKeyboard);
      return;
    }

    userProgress[id] = { step: 0, lang };
    ctx.reply(QUEST_TITLE[lang], { parse_mode: 'Markdown' });
    ctx.reply(messages.welcome[lang]);
    ctx.reply(steps[0].story[lang], { parse_mode: 'Markdown' });
    ctx.reply(steps[0].question[lang]);
  } catch (error) {
    console.error(`Error setting language: ${error.message}`);
    ctx.reply('Sorry, an error occurred. Please try again.');
  }
});

bot.hears('🔁 Сброс', (ctx) => {
  try {
    const id = ctx.from.id;
    delete userProgress[id];
    ctx.reply('🔄 Прогресс сброшен. Нажми ▶️ «Начать квест», чтобы начать заново.', mainKeyboard);
  } catch (error) {
    console.error(`Error resetting progress: ${error.message}`);
    ctx.reply('Sorry, an error occurred. Please try again.');
  }
});

bot.hears('❓ Помощь', (ctx) => {
  try {
    ctx.reply(
      `📜 Это приключенческий квест по Будве.\n\n` +
      `Ты получаешь подсказки, следуешь по реальным локациям и отвечаешь на загадки.\n\n` +
      `🧭 Для прохождения тебе нужно:\n• Быть в Будве (или смотреть Google Maps)\n• Читать подсказки внимательно\n• Прислать правильный ответ или фото\n\n` +
      `🏁 В конце — грамота и благодарность!`,
      mainKeyboard
    );
  } catch (error) {
    console.error(`Error showing help: ${error.message}`);
    ctx.reply('Sorry, an error occurred. Please try again.');
  }
});

// Debug/test command - will be removed later
bot.hears('🧪 Тест грамоты', async (ctx) => {
  try {
    const id = ctx.from.id;
    const lang = userProgress[id]?.lang || 'en';
    const name = ctx.from.first_name || ctx.from.username || 'Explorer';

    try {
      const cert = await generateCertificate(name, lang);
      await ctx.replyWithPhoto({ source: cert }, { caption: `🧪 Грамота для теста, ${name}` });
    } catch (certError) {
      console.error(`Error generating certificate: ${certError.message}`);
      ctx.reply('Sorry, there was an error generating the certificate.');
    }
  } catch (error) {
    console.error(`Error in test certificate: ${error.message}`);
    ctx.reply('Sorry, an error occurred. Please try again.');
  }
});

// Handle text messages (using proper filter instead of deprecated on() method)
bot.on('message', async (ctx) => {
  // Skip if not a text message
  if (!ctx.message.text) return;
  try {
    const id = ctx.from.id;
    const user = userProgress[id];

    if (!user) return;

    const lang = user.lang;
    const input = ctx.message.text;

    // Check if this is feedback rating
    if (/⭐️ (\d)/.test(input)) {
      const rating = parseInt(input.match(/⭐️ (\d)/)[1]);
      userFeedback[id] = { rating };
      ctx.reply(t('thanks_feedback', lang));
      return;
    }

    // Check if this is feedback comment
    if (userFeedback[id] && !userFeedback[id].comment) {
      userFeedback[id].comment = input;
      ctx.reply(t('end_feedback', lang));
      await saveFeedback(id, userFeedback[id]);
      return;
    }

    // Handle quest steps
    const step = steps[user.step];
    if (!step) return;

    if (step.answer === 'photo') {
      ctx.reply("📷 Пришли фото!");
      return;
    }

    const isCorrect = matches(input, step.answer);
    if (isCorrect) {
      user.step++;
      if (user.step < steps.length) {
        ctx.reply(t('correct', lang));
        ctx.reply(steps[user.step].story[lang], { parse_mode: 'Markdown' });
        ctx.reply(steps[user.step].question[lang]);
      } else {
        await finishQuest(ctx, id);
      }
    } else {
      ctx.reply(t('wrong', lang));
    }
  } catch (error) {
    console.error(`Error handling text: ${error.message}`);
    ctx.reply('Sorry, an error occurred. Please try again.');
  }
});

// Handle photo submissions (using filter approach instead of deprecated on() method)
bot.use(async (ctx, next) => {
  if (ctx.message?.photo?.length > 0) {
    try {
      const id = ctx.from.id;
      const user = userProgress[id];

      if (!user) return next();

      const lang = user.lang;
      const step = steps[user.step];

      if (step.answer === 'photo') {
        user.step++;
        await finishQuest(ctx, id);
      } else {
        ctx.reply("🤔 Сейчас не требуется фото. Ответь на загадку текстом.");
      }
    } catch (error) {
      console.error(`Error handling photo: ${error.message}`);
      ctx.reply('Sorry, an error occurred. Please try again.');
    }
  } else {
    return next();
  }
});

/**
 * Handle quest completion
 * @param {object} ctx - Telegram context
 * @param {number} userId - User ID
 */
async function finishQuest(ctx, userId) {
  try {
    const user = userProgress[userId];
    const lang = user.lang;

    ctx.reply(t('finished', lang));
    ctx.reply(t('feedback_intro', lang), feedbackKeyboard);

    const name = ctx.from.first_name || ctx.from.username || 'Explorer';

    try {
      const cert = await generateCertificate(name, lang);
      await ctx.replyWithPhoto({ source: cert }, {
        caption: `🏆 ${name}, ${t('certificate_caption', lang) || 'you\'ve completed the quest!'}`
      });
    } catch (certError) {
      console.error(`Error generating completion certificate: ${certError.message}`);
      ctx.reply('Sorry, there was an error generating your certificate.');
    }
  } catch (error) {
    console.error(`Error in finishQuest: ${error.message}`);
    ctx.reply('Sorry, an error occurred. Please try again.');
  }
}

// Keep-alive mechanism
if (WEBHOOK_URL) {
  const keepAliveInterval = 10 * 60 * 1000; // 10 minutes

  const pingWebhook = () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Keep-alive ping`);

    try {
      require('https').get(WEBHOOK_URL, (res) => {
        console.log(`[${timestamp}] Ping response: ${res.statusCode}`);
      }).on('error', (err) => {
        console.error(`[${timestamp}] Ping error: ${err.message}`);
      });
    } catch (error) {
      console.error(`[${timestamp}] Ping exception: ${error.message}`);
    }
  };

  setInterval(pingWebhook, keepAliveInterval);
}

// Express server setup
app.get('/', (_, res) => {
  res.send('🌍 Budva Quest Bot is alive');
});

app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start bot
// ==== Запуск бота с поддержкой Webhook или Polling ====

const WEBHOOK_PATH = `/bot${BOT_TOKEN}`;
const FULL_WEBHOOK_URL = WEBHOOK_URL ? `${WEBHOOK_URL}${WEBHOOK_PATH}` : null;

(async () => {
  try {
    if (FULL_WEBHOOK_URL) {
      await bot.telegram.setWebhook(FULL_WEBHOOK_URL);
      app.use(bot.webhookCallback(WEBHOOK_PATH));
      console.log(`🚀 Webhook установлен: ${FULL_WEBHOOK_URL}`);
    } else {
      await bot.launch();
      console.log('🚀 Бот запущен в режиме polling');
    }

    app.listen(PORT, () => {
      console.log(`🌻 montenegro-quest-bot слушает порт ${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Ошибка запуска бота: ${error.message}`);
    process.exit(1);
  }
})();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
