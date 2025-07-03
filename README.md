# 🗺️ Budva Quest Bot

![Lint](https://github.com/arif-dewi/montenegro-quest-bot/actions/workflows/lint.yml/badge.svg)

A **multilingual Telegram bot** that guides users through a real-world mystery quest in the old town of **Budva, Montenegro** — mixing folklore, geolocation, and interactive storytelling.

> Noir-pirate aesthetics, personalized certificates, and immersive puzzles — all packed in a Telegram experience.

---

## 🧩 Features

- 🌍 Supports 3 languages: English, Russian, Montenegrin
- 🏰 Story-based quest across real locations in Budva
- 📸 Final task requires a **real photo** at a hidden spot
- 🏆 Generates a **personalized certificate** as PNG
- 💾 Saves progress per user (via PostgreSQL)
- ⭐ Collects feedback after the quest (rating + comment)
- 🎮 Fully Telegram-native experience (no mobile app required)

---

## 🚀 Quick Start

### 1. Create your bot

Talk to [@BotFather](https://t.me/BotFather) and grab your bot token.

### 2. Clone and install

```bash
git clone https://github.com/your-username/montenegro-quest-bot.git
cd montenegro-quest-bot
npm install
```

### 3. Add `.env` file

```env
BOT_TOKEN=your-telegram-bot-token
WEBHOOK_URL=https://your.public.url
DATABASE_URL=postgresql://user:pass@host:port/dbname
PORT=3000
BOT_PREFIX=bot
```

> Use a PostgreSQL instance (Render / Railway / Supabase / Neon).

### 4. Run locally

```bash
node src/bot.js
```

Or use PM2 / Docker in production.

---

## 🧱 Stack

| Layer       | Tech                 |
|-------------|----------------------|
| Bot engine  | [Telegraf.js](https://telegraf.js.org/)
| DB          | PostgreSQL (via `pg`)
| Hosting     | Render, Railway or local
| Certificate | `canvas` + custom fonts
| Language    | JavaScript (Node.js)

---

## 📂 Project Structure

```
src/
  ├── bot.js                # Entry point
  ├── db/                   # PostgreSQL access and init
  ├── routes/               # All bot handlers
  ├── steps.js              # Quest logic
  ├── keyboard.js           # Telegram keyboards
  ├── messages.js           # Localized text
  ├── generateCertificate.js# Certificate rendering
  └── keepAlive.js          # Optional ping to prevent sleep
```

---

## 📜 License

MIT — use, modify, remix. Attribution appreciated ✨

> Created with ☕ and ☀️ in Montenegro by [@arifdewi](https://github.com/arifdewi)