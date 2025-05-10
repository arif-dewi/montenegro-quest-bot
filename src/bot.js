// src/bot.js
const { Telegraf } = require('telegraf');
const express = require('express');
const { Pool } = require('pg');
const keepAlive = require('./keepAlive');
const initRoutes = require('./routes');
const { initDb, cleanupOldUserStates } = require("./db");
require('dotenv').config();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const CLEAR_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;
const FULL_WEBHOOK_URL = process.env.WEBHOOK_URL ? `${process.env.WEBHOOK_URL}${WEBHOOK_PATH}` : null;

// Инициализация
(async () => {
  try {
    await initDb();
    initRoutes(bot, db);

    if (FULL_WEBHOOK_URL) {
      await bot.telegram.setWebhook(FULL_WEBHOOK_URL);
      app.use(bot.webhookCallback(WEBHOOK_PATH));
      console.log(`🚀 Webhook установлен: ${FULL_WEBHOOK_URL}`);
    } else {
      await bot.launch();
      console.log('🚀 Бот запущен в режиме polling');
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🌐 Сервер слушает на порту ${PORT}`));
    if (FULL_WEBHOOK_URL) keepAlive(process.env.WEBHOOK_URL);
  } catch (err) {
    console.error('❌ Ошибка запуска:', err);
    process.exit(1);
  }
})();

app.get('/', (_, res) => res.send('🏝 Квест-бот живой.'));

setInterval(async () => {
  try {
    const count = await cleanupOldUserStates();
    console.log(`🧹 Очистка: ${count} старых записей удалено.`);
  } catch (err) {
    console.error('❌ Очистка не удалась:', err);
  }
}, CLEAR_INTERVAL);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
