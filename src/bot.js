require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { message, mediaGroup } = require('telegraf/filters');
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

const languageKeyboard = Markup.keyboard([
  ['🇲🇪 Crnogorski'],
  ['🇷🇺 Русский'],
  ['🇬🇧 English']
]).oneTime().resize();

const feedbackKeyboard = Markup.keyboard([
  ['⭐️ 1', '⭐️ 2', '⭐️ 3'],
  ['⭐️ 4', '⭐️ 5']
]).oneTime().resize();

function t(id, lang) {
  return messages[id]?.[lang] || "⚠️ Missing translation";
}

function normalize(str) {
  return str.trim().toLowerCase();
}

function matches(input, expectedPatterns) {
  const cleanedInput = normalize(input);
  return expectedPatterns.some((pattern) => {
    const regex = new RegExp(`^${pattern}$`, 'i');
    return regex.test(cleanedInput);
  });
}

async function saveFeedback(userId, feedback) {
  try {
    const feedbackData = JSON.stringify({ id: userId, ...feedback }) + '\n';
    await fs.appendFile('feedback.json', feedbackData);
  } catch (error) {
    console.error(`Error saving feedback: ${error.message}`);
  }
}

bot.start((ctx) => {
  try {
    const id = ctx.from.id;
    userProgress[id] = { step: 0 };
    ctx.reply(t('chooseLang', 'en'), languageKeyboard);
  } catch (error) {
    console.error(`Error in start command: ${error.message}`);
    ctx.reply('An error occurred. Please try again.');
  }
});

bot.hears(['🇲🇪 Crnogorski', '🇷🇺 Русский', '🇬🇧 English'], (ctx) => {
  const id = ctx.from.id;
  const langMap = {
    '🇲🇪 Crnogorski': 'me',
    '🇷🇺 Русский': 'ru',
    '🇬🇧 English': 'en'
  };
  const lang = langMap[ctx.message.text];
  userProgress[id] = { step: 0, lang };
  ctx.reply(QUEST_TITLE[lang], { parse_mode: 'Markdown' });
  ctx.reply(messages.welcome[lang]);
  ctx.reply(steps[0].story[lang], { parse_mode: 'Markdown' });
  ctx.reply(steps[0].question[lang]);
});

bot.hears(['▶️ Start Quest', '▶️ Начать квест'], (ctx) => {
  const id = ctx.from.id;
  userProgress[id] = { step: 0, lang: 'en' };
  ctx.reply(t('chooseLang', 'en'), languageKeyboard);
});

bot.hears(['🔁 Reset', '🔁 Сброс'], (ctx) => {
  const id = ctx.from.id;
  delete userProgress[id];
  ctx.reply('🔄 Progress reset. Tap ▶️ to start again.', keyboard);
});

bot.hears(['❓ Help', '❓ Помощь'], (ctx) => {
  const id = ctx.from.id;
  const lang = userProgress[id]?.lang || 'en';
  ctx.reply(t('help', lang), keyboard);
});

bot.hears(['🧪 Test Certificate', '🧪 Тест грамоты'], async (ctx) => {
  const id = ctx.from.id;
  const lang = userProgress[id]?.lang || 'en';
  const name = ctx.from.first_name || ctx.from.username || 'Explorer';
  const cert = await generateCertificate(name, lang);
  await ctx.replyWithPhoto({ source: cert }, { caption: `🧪 Test certificate for ${name}` });
});

bot.use(message('text'), async (ctx) => {
  const id = ctx.from.id;
  const user = userProgress[id];
  if (!user) return;
  const lang = user.lang;
  const input = ctx.message.text;

  if (/⭐️ (\d)/.test(input)) {
    const rating = parseInt(input.match(/⭐️ (\d)/)[1]);
    userFeedback[id] = { rating };
    ctx.reply(t('thanks_feedback', lang));
    return;
  }

  if (userFeedback[id] && !userFeedback[id].comment) {
    userFeedback[id].comment = input;
    ctx.reply(t('end_feedback', lang));
    await saveFeedback(id, userFeedback[id]);
    return;
  }

  const step = steps[user.step];
  if (!step) return;
  if (step.answer === 'photo') {
    ctx.reply(t('expect_photo', lang));
    return;
  }
  if (matches(input, step.answer)) {
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
});

bot.use(message('photo'), async (ctx) => {
  const id = ctx.from.id;
  const user = userProgress[id];
  if (!user) return;
  const lang = user.lang;
  const step = steps[user.step];
  if (step.answer === 'photo') {
    user.step++;
    await finishQuest(ctx, id);
  } else {
    ctx.reply(t('unexpected_photo', lang));
  }
});

async function finishQuest(ctx, userId) {
  const user = userProgress[userId];
  const lang = user.lang;
  ctx.reply(t('finished', lang));
  ctx.reply(t('feedback_intro', lang), feedbackKeyboard);
  const name = ctx.from.first_name || ctx.from.username || 'Explorer';
  const cert = await generateCertificate(name, lang);
  await ctx.replyWithPhoto({ source: cert }, {
    caption: `🏆 ${name}, ${t('certificate_caption', lang)}`
  });
}

if (WEBHOOK_URL) {
  const keepAliveInterval = 10 * 60 * 1000;
  setInterval(() => {
    require('https').get(WEBHOOK_URL, (res) => {
      console.log(`[KeepAlive] Ping response: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`[KeepAlive] Ping error: ${err.message}`);
    });
  }, keepAliveInterval);
}

app.get('/', (_, res) => res.send('🌍 Bot is alive'));
app.get('/health', (_, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

const WEBHOOK_PATH = `/bot${BOT_TOKEN}`;
const FULL_WEBHOOK_URL = WEBHOOK_URL ? `${WEBHOOK_URL}${WEBHOOK_PATH}` : null;

(async () => {
  try {
    if (FULL_WEBHOOK_URL) {
      await bot.telegram.setWebhook(FULL_WEBHOOK_URL);
      app.use(bot.webhookCallback(WEBHOOK_PATH));
      console.log(`🚀 Webhook set: ${FULL_WEBHOOK_URL}`);
    } else {
      await bot.launch();
      console.log('🚀 Bot launched in polling mode');
    }

    app.listen(PORT, () => {
      console.log(`🌻 Bot server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Launch error: ${error.message}`);
    process.exit(1);
  }
})();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
