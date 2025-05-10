// steps.js
const { Markup } = require('telegraf');

const steps = [
  {
    story: {
      me: "📜 *Poglavlje I: Zagonetno Pismo*...",
      ru: "📜 *Глава I: Таинственное письмо*...",
      en: "📜 *Chapter I: The Cryptic Letter*..."
    },
    question: {
      me: "⏰ Koliko je sati na starom satu?",
      ru: "⏰ Сколько времени на старых часах?",
      en: "⏰ What time is on the old clock?"
    },
    answer: ["10:15", "10.15", "10[-:.\\s]?15", "10\\s15"],
    success: {
      me: "⏰ Tačno! Sat je zaustavljen u vremenu...",
      ru: "⏰ Верно! Часы остановились навсегда...",
      en: "⏰ Correct! The clock is frozen in time..."
    },
    keyboard: Markup.keyboard([['Подсказка']]).resize(),
    retryMessage: '👀 Присмотрись внимательнее. Что находится над воротами?'
  },
  {
    story: {
      me: "⛪ *Poglavlje II: Zidovi Pamte*...",
      ru: "⛪ *Глава II: Стены помнят*...",
      en: "⛪ *Chapter II: The Walls Remember*..."
    },
    question: {
      me: "🔤 Koja je prva riječ iznad mozaika?",
      ru: "🔤 Какое первое слово над мозаикой?",
      en: "🔤 What is the first word above the mosaic?"
    },
    answer: ["pomolimo"],
    success: {
      me: "🙏 Tačno. Zid pamti tvoje korake...",
      ru: "🙏 Верно. Стена помнит твой шаг...",
      en: "🙏 Correct. The wall remembers you..."
    },
    keyboard: Markup.keyboard([['Подсказка']]).resize(),
    retryMessage: '🗿 Найди надпись над мозаикой. Что там первое?'
  },
  {
    story: {
      me: "⚓ *Poglavlje III: Sidro Tajni*...",
      ru: "⚓ *Глава III: Якорь Тайн*...",
      en: "⚓ *Chapter III: The Anchor of Secrets*..."
    },
    question: {
      me: "🔗 Koliko lanaca drži sidro?",
      ru: "🔗 Сколько цепей держат якорь?",
      en: "🔗 How many chains hold the anchor?"
    },
    answer: ["3", "три", "tri"],
    success: {
      me: "⚓ Tačno. Ali sidro želi slobodu...",
      ru: "⚓ Точно. Но якорь мечтает о свободе...",
      en: "⚓ Correct. But the anchor longs for freedom..."
    },
    keyboard: Markup.keyboard([['Подсказка']]).resize(),
    retryMessage: '💣 Почти. Вспомни: сколько ядер лежит у пушки?'
  },
  {
    story: {
      me: "🌌 *Završno Poglavlje: Svetionik se Budi*...",
      ru: "🌌 *Последняя глава: Пробуждение маяка*...",
      en: "🌌 *Final Chapter: The Lighthouse Awakens*..."
    },
    question: {
      me: "📸 Pošalji fotografiju ostrva sa obale!",
      ru: "📸 Пришли фото острова с берега!",
      en: "📸 Send a photo of the island from the shore!"
    },
    answer: "photo",
    success: {
      me: "📸 Savršeno! Svetionik te prepoznao...",
      ru: "📸 Прекрасно! Маяк узнал тебя...",
      en: "📸 Beautiful! The lighthouse recognized you..."
    },
    keyboard: Markup.keyboard([['Подсказка']]).resize(),
    retryMessage: '📷 Отправь фото острова, вид с берега.'
  }
];

function getLang(ctx) {
  const lang = ctx?.from?.language_code || 'en';
  if (/^ru/.test(lang)) return 'ru';
  if (/^sr|me|bs|hr/.test(lang)) return 'me';
  return 'en';
}

module.exports = { steps, getLang };