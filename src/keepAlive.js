// keepAlive.js
const https = require('https');

const TIMEOUT = 60 * 1000; // 1 minute

function keepAlive(url, intervalMinutes = 10) {
  if (!url) {
    console.warn('[keepAlive] URL is missing. Ping skipped.');
    return;
  }

  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 Keep-alive ping to ${url}`);
    https.get(url, (res) => {
      console.log(`[${timestamp}] ✅ Ping response: ${res.statusCode}`);
    }).on('error', (err) => {
      console.log(`[${timestamp}] ❌ Ping error: ${err.message}`);
    });
  }, intervalMinutes * TIMEOUT);
}

module.exports = keepAlive;