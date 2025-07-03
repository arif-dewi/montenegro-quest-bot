// src/db/index.js
require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // For Render, Glitch, etc. For the local development, you can set this to false
    rejectUnauthorized: true,
  },
});
const PREFIX = process.env.BOT_PREFIX || 'bot';

const table = (name) => `${PREFIX}_${name}`;

/**
 * Initializes all necessary database tables.
 */
async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${table('user_states')} (
      chat_id BIGINT PRIMARY KEY,
      state JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ${table('analytics')} (
      event TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ${table('feedback')} (
      id SERIAL PRIMARY KEY,
      chat_id BIGINT,
      rating INTEGER,
      comment TEXT,
      lang TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

/**
 * Loads user state or initializes it if not found.
 */
async function getUserState(chatId) {
  const res = await db.query(
    `SELECT state FROM ${table('user_states')} WHERE chat_id = $1`,
    [chatId]
  );

  if (res.rowCount === 0) {
    const defaultState = { step: 0 };
    await setUserState(chatId, defaultState);
    return defaultState;
  }

  return res.rows[0].state;
}

/**
 * Saves or updates user state.
 */
async function setUserState(chatId, state) {
  await db.query(
    `INSERT INTO ${table('user_states')} (chat_id, state, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (chat_id)
     DO UPDATE SET state = $2, updated_at = NOW()`,
    [chatId, state]
  );
}

/**
 * Increments a named analytics event.
 */
async function incrementCounter(event) {
  await db.query(
    `INSERT INTO ${table('analytics')} (event, count)
     VALUES ($1, 1)
         ON CONFLICT (event)
     DO UPDATE SET count = ${table('analytics')}.count + 1`,
    [event]
  );
}

/**
 * Returns counts for the provided analytics keys.
 */
async function getAnalytics(keys) {
  const results = await Promise.all(
    keys.map((k) =>
      db.query(`SELECT count FROM ${table('analytics')} WHERE event = $1`, [k])
    )
  );

  return keys.map((k, i) => ({
    event: k,
    count: results[i].rows[0]?.count || 0,
  }));
}

/**
 * Deletes user states not updated for a given number of days.
 */
async function cleanupOldUserStates(days = 30) {
  const res = await db.query(
    `DELETE FROM ${table('user_states')}
     WHERE updated_at < NOW() - INTERVAL '${days} days'`
  );
  return res.rowCount;
}

/**
 * Stores user feedback.
 */
async function saveFeedback(chatId, { rating, comment, lang }) {
  await db.query(
    `INSERT INTO ${table('feedback')} (chat_id, rating, comment, lang)
     VALUES ($1, $2, $3, $4)`,
    [chatId, rating, comment || null, lang]
  );
}

module.exports = {
  db,
  table,
  initDb,
  getUserState,
  setUserState,
  incrementCounter,
  getAnalytics,
  cleanupOldUserStates,
  saveFeedback,
};