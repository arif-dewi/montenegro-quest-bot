// db/index.js
require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const PREFIX = process.env.BOT_PREFIX || 'bot';

function prefixed(table) {
  return `${PREFIX}_${table}`;
}

async function initDb() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${prefixed('user_states')} (
      chat_id BIGINT PRIMARY KEY,
      state JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ${prefixed('analytics')} (
      event TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ${prefixed('feedback')} (
      id SERIAL PRIMARY KEY,
      chat_id BIGINT,
      rating INTEGER,
      comment TEXT,
      lang TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function getUserState(chatId) {
  const res = await db.query(
    `SELECT state FROM ${prefixed('user_states')} WHERE chat_id = $1`,
    [chatId]
  );
  if (res.rowCount === 0) {
    const state = { step: 0 };
    await setUserState(chatId, state);
    return state;
  }
  return res.rows[0].state;
}

async function setUserState(chatId, state) {
  await db.query(
    `INSERT INTO ${prefixed('user_states')} (chat_id, state, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (chat_id)
     DO UPDATE SET state = $2, updated_at = NOW()`,
    [chatId, state]
  );
}

async function incrementCounter(event) {
  await db.query(
    `INSERT INTO ${prefixed('analytics')} (event, count)
     VALUES ($1, 1)
     ON CONFLICT (event)
     DO UPDATE SET count = ${prefixed('analytics')}.count + 1`,
    [event]
  );
}

async function getAnalytics(keys) {
  const results = await Promise.all(
    keys.map(k => db.query(
      `SELECT count FROM ${prefixed('analytics')} WHERE event = $1`, [k])
    )
  );
  return keys.map((k, i) => ({ event: k, count: results[i].rows[0]?.count || 0 }));
}

async function cleanupOldUserStates(days = 30) {
  const res = await db.query(
    `DELETE FROM ${prefixed('user_states')}
     WHERE updated_at < NOW() - INTERVAL '${days} days'`
  );
  return res.rowCount;
}

async function saveFeedback(chatId, { rating, comment, lang }) {
  await db.query(`
    INSERT INTO ${prefixed('feedback')} (chat_id, rating, comment, lang)
    VALUES ($1, $2, $3, $4)
  `, [chatId, rating, comment || null, lang]);
}

module.exports = {
  db,
  prefixed,
  initDb,
  getUserState,
  setUserState,
  incrementCounter,
  getAnalytics,
  cleanupOldUserStates,
  saveFeedback
};