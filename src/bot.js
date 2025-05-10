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

// Обновляем webhook
const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}${WEBHOOK_PATH}`);
app.use(bot.webhookCallback(WEBHOOK_PATH));

// Простая заглушка для проверки
app.get('/', (_, res) => res.send('🏝 Квест-бот живой.'));

// Keep-alive + запуск сервера
keepAlive(process.env.WEBHOOK_URL);

// Инициализация
(async () => {
  try {
    await initDb();
    initRoutes(bot, db);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 QuestBot работает на порту ${PORT}`));
  } catch (err) {
    console.error('❌ Ошибка запуска:', err);
    process.exit(1);
  }
})();

setInterval(async () => {
  try {
    const count = await cleanupOldUserStates();
    console.log(`🧹 Очистка: ${count} старых записей удалено.`);
  } catch (err) {
    console.error('❌ Очистка не удалась:', err);
  }
}, CLEAR_INTERVAL);