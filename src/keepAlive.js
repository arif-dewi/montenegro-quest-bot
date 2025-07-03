const https = require('https');

const MINUTE_MS = 60 * 1000;

/**
 * Periodically pings the provided URL to prevent server from idling.
 * Useful for free hosting platforms like Render, Glitch, etc.
 *
 * @param {string} url - The public URL to ping
 * @param {number} intervalMinutes - Interval in minutes (default: 10)
 */
function keepAlive(url, intervalMinutes = 10) {
  if (!url) {
    console.warn('[keepAlive] No URL provided. Skipping keep-alive pings.');
    return;
  }

  const interval = intervalMinutes * MINUTE_MS;

  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 Sending keep-alive ping to ${url}...`);

    https
      .get(url, (res) => {
        console.log(`[${timestamp}] ✅ Ping successful (status ${res.statusCode})`);
      })
      .on('error', (err) => {
        console.error(`[${timestamp}] ❌ Ping failed: ${err.message}`);
      });
  }, interval);
}

module.exports = keepAlive;