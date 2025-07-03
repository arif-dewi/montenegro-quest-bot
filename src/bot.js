// src/bot.js
require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const keepAlive = require('./keepAlive');
const initRoutes = require('./routes');
const { initDb, cleanupOldUserStates } = require('./db');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const PORT = process.env.PORT || 3000;
const CLEAR_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const WEBHOOK_PATH = `/bot${process.env.BOT_TOKEN}`;
const FULL_WEBHOOK_URL = process.env.WEBHOOK_URL
  ? `${process.env.WEBHOOK_URL}${WEBHOOK_PATH}`
  : null;

(async () => {
  try {
    // Initialize database and bot routes
    await initDb();
    initRoutes(bot);

    if (FULL_WEBHOOK_URL) {
      // Use webhook mode if URL is provided
      await bot.telegram.setWebhook(FULL_WEBHOOK_URL);
      app.use(bot.webhookCallback(WEBHOOK_PATH));
      console.log(`🚀 Webhook set: ${FULL_WEBHOOK_URL}`);
    } else {
      // Fallback to polling mode
      await bot.launch();
      console.log('🚀 Bot launched in polling mode');
    }

    // Start Express server
    app.listen(PORT, () => console.log(`🌐 Server listening on port ${PORT}`));

    // Keep alive if webhook is used (for platforms like Replit/Glitch)
    if (FULL_WEBHOOK_URL) keepAlive(process.env.WEBHOOK_URL);
  } catch (error) {
    console.error('❌ Failed to launch bot:', error);
    process.exit(1);
  }
})();

// Health check endpoint
app.get('/', (_, res) => res.send('🏝 Quest bot is alive.'));

// Privacy policy endpoint
app.get('/privacy', (_, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>This bot does not store any personal data.</p>
    <p>All interactions are logged anonymously for analytics.</p>
  `);
});

// Periodic cleanup of old states
setInterval(async () => {
  try {
    const removed = await cleanupOldUserStates();
    console.log(`🧹 Cleanup: removed ${removed} outdated user states.`);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
  }
}, CLEAR_INTERVAL_MS);

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));