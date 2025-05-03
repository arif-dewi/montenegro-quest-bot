require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const express = require('express');
const app = express();

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const QUEST_TITLE = {
  me: "🗝️ *Potraga: Signal sa Svetionika*",
  ru: "🗝️ *Квест: Сигнал с Маяка*",
  en: "🗝️ *Quest: Signal from the Lighthouse*"
};

const steps = [/* ... */]; // Сюжетные шаги (как мы сделали в предыдущих версиях)
const messages = { /* ... */ }; // Все сообщения
const userProgress = {};
const userFeedback = {};

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

bot.start(async (ctx) => {
  const id = ctx.from.id;
  userProgress[id] = { step: 0, lang: 'en' };
  ctx.reply(t('chooseLang', 'en'), {
    reply_markup: {
      keyboard: [['🇲🇪 Crnogorski'], ['🇷🇺 Русский'], ['🇬🇧 English']],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });

  // TO TEST
  const name = ctx.from.first_name || 'Explorer';
  const cert = await generateCertificate(name, lang);
  await ctx.replyWithPhoto({ source: cert }, { caption: '🏆' });
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

bot.on('text', (ctx) => {
  const id = ctx.from.id;
  const user = userProgress[id];
  if (!user) return;

  const step = steps[user.step];
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
    fs.appendFileSync('feedback.json', JSON.stringify({ id, ...userFeedback[id] }) + '\n');
    return;
  }

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
      ctx.reply(t('finished', lang));
      ctx.reply(t('feedback_intro', lang), {
        reply_markup: {
          keyboard: [['⭐️ 1', '⭐️ 2', '⭐️ 3'], ['⭐️ 4', '⭐️ 5']],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }
  } else {
    ctx.reply(t('wrong', lang));
  }
});

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

    const name = ctx.from.first_name || 'Explorer';
    const cert = await generateCertificate(name, lang);

    await ctx.replyWithPhoto({ source: cert }, { caption: '🏆' });
  } else {
    ctx.reply("🤔 Сейчас не требуется фото. Ответь на загадку текстом.");
  }
});

bot.launch();

// 🟡 VERY SIMPLE PING TO KEEP THE SERVICE ALIVE
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Keep-alive ping`);
  require('https').get(WEBHOOK_URL, (res) => {
    console.log(`[${new Date().toISOString()}] Ping response: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`[${new Date().toISOString()}] Ping error: ${err.message}`);
  });
}, 10 * 60 * 1000); // 10 minutes

// 🔵 EXPRESS SERVER (Required for platforms like Render/Glitch)
const PORT = process.env.PORT || 3000;
app.get('/', (_, res) => res.send('🌍 Budva Quest Bot is alive'));
app.listen(PORT, () => {
  console.log(`🌻 calm_comrade запущен через Webhook на порту ${PORT}`);
});