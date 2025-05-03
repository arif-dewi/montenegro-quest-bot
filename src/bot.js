require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const express = require('express');
const app = express();
const { generateCertificate } = require('./generateCertificate');
const { steps } = require('./steps');
const { messages } = require('./messages');

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const QUEST_TITLE = {
  me: "🗝️ *Potraga: Signal sa Svetionika*",
  ru: "🗝️ *Квест: Сигнал с Маяка*",
  en: "🗝️ *Quest: Signal from the Lighthouse*"
};

const userProgress = {};
const userFeedback = {};

const mainKeyboard = Markup.keyboard([
  ['▶️ Начать квест'],
  ['🔁 Сброс', '❓ Помощь']
]).resize();

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

bot.start((ctx) => {
  ctx.reply('🗝️ Добро пожаловать в квест "Сигнал с Маяка"!\n\nНажми ▶️ «Начать квест», чтобы начать приключение.', mainKeyboard);
});

bot.hears('▶️ Начать квест', (ctx) => {
  const id = ctx.from.id;
  userProgress[id] = { step: 0, lang: 'ru' }; // default lang ru
  ctx.reply(t('chooseLang', 'ru'), {
    reply_markup: {
      keyboard: [['🇲🇪 Crnogorski'], ['🇷🇺 Русский'], ['🇬🇧 English']],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
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

bot.hears('🔁 Сброс', (ctx) => {
  const id = ctx.from.id;
  delete userProgress[id];
  ctx.reply('🔄 Прогресс сброшен. Нажми ▶️ «Начать квест», чтобы начать заново.', mainKeyboard);
});

bot.hears('❓ Помощь', (ctx) => {
  ctx.reply(
    `📜 Это приключенческий квест по Будве.\n\n` +
    `Ты получаешь подсказки, следуешь по реальным локациям и отвечаешь на загадки.\n\n` +
    `🧭 Для прохождения тебе нужно:\n• Быть в Будве (или смотреть Google Maps)\n• Читать подсказки внимательно\n• Прислать правильный ответ или фото\n\n` +
    `🏁 В конце — грамота и благодарность!`,
    mainKeyboard
  );
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

    const name = ctx.from.first_name || ctx.from.username || 'Explorer';
    const cert = await generateCertificate(name, lang);

    await ctx.replyWithPhoto({ source: cert }, { caption: `🏆 ${name}, you’ve completed the quest!` });
  } else {
    ctx.reply("🤔 Сейчас не требуется фото. Ответь на загадку текстом.");
  }
});

bot.launch();

setInterval(() => {
  console.log(`[${new Date().toISOString()}] Keep-alive ping`);
  require('https').get(WEBHOOK_URL, (res) => {
    console.log(`[${new Date().toISOString()}] Ping response: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`[${new Date().toISOString()}] Ping error: ${err.message}`);
  });
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.get('/', (_, res) => res.send('🌍 Budva Quest Bot is alive'));
app.listen(PORT, () => {
  console.log(`🌻 calm_comrade запущен через Webhook на порту ${PORT}`);
});
