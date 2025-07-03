/**
 * Quest storyline steps with localized text.
 * Each step includes: story, question, answer(s), success and retry messages.
 */
const steps = [
  {
    story: {
      me: "🏰 Poglavlje I: Vratima sve počinje\n\nKamen pod tvojim nogama već pamti hiljade koraka. Ali sada — ti si taj koji dolazi ne slučajno...",
      ru: "🏰 Глава I: Всё начинается с Врат\n\nКамень под ногами хранит тысячи шагов. Но сейчас — твой шаг имеет значение...",
      en: "🏰 Chapter I: It Begins at the Gate\n\nThe stone beneath your feet has felt a thousand footsteps. But now — it's yours that matter..."
    },
    question: {
      me: "📍 Kako se zovu ova vrata?",
      ru: "📍 Как называются эти ворота?",
      en: "📍 What is the name of this gate?"
    },
    answer: ["pizanela", "vrata pizanela", "pizanella", "pizzanela"],
    success: {
      me: "✅ Vrata su te prepoznala. Počinje priča...",
      ru: "✅ Врата тебя узнали. История начинается...",
      en: "✅ The gate recognized you. The story begins..."
    },
    retryMessage: {
      me: "👀 Potraži crvenu tablu. Kako se zovu ta vrata?",
      ru: "👀 Найди красную табличку. Как называются ворота?",
      en: "👀 Look for the red sign. What is the name of the gate?"
    }
  },
  {
    story: {
      me: "🔔 Poglavlje II: Zvona\n\nNa trgu čeka crkva...",
      ru: "🔔 Глава II: Колокола\n\nНа площади — церковь...",
      en: "🔔 Chapter II: The Bells\n\nIn the square, the church waits..."
    },
    question: {
      me: "🔢 Koliko zvona ima iznad ulaza u crkvu?",
      ru: "🔢 Сколько колоколов над входом в церковь?",
      en: "🔢 How many bells hang above the church entrance?"
    },
    answer: ["3", "tri", "три"],
    success: {
      me: "🔔 Tačno. Zvona pamte tvoje ime...",
      ru: "🔔 Верно. Колокола помнят твоё имя...",
      en: "🔔 Correct. The bells remember your name..."
    },
    retryMessage: {
      me: "🔔 Pogledaj iznad ulaza pažljivo.",
      ru: "🔔 Посмотри внимательно над входом.",
      en: "🔔 Look carefully above the entrance."
    }
  },
  {
    story: {
      me: "🏰 Poglavlje III: Kamen sa Godinom\n\nKrećeš ka tvrđavi...",
      ru: "🏰 Глава III: Камень с годом\n\nТы идёшь к цитадели...",
      en: "🏰 Chapter III: The Carved Year\n\nYou approach the citadel..."
    },
    question: {
      me: "📅 Koja godina je urezana iznad vrata Citadele?",
      ru: "📅 Какой год высечен над входом в Цитадель?",
      en: "📅 What year is carved above the Citadel gate?"
    },
    answer: ["1836"],
    success: {
      me: "📅 Tačno. Vremena još ima...",
      ru: "📅 Верно. Время ещё есть...",
      en: "📅 Correct. There is still time..."
    },
    retryMessage: {
      me: "📜 Pogledaj iznad glavnog ulaza. Godina je tu.",
      ru: "📜 Посмотри над входом. Там есть дата.",
      en: "📜 Look above the main entrance. The year is there."
    }
  },
  {
    story: {
      me: "🌊 Završno Poglavlje: Pogled sa Kamenog Zida\n\nNa kraju staze — zid koji gleda ka moru...",
      ru: "🌊 Финал: Вид с каменной стены\n\nВ конце пути — стена у моря...",
      en: "🌊 Final Chapter: View from the Stone Wall\n\nAt the end of the path — a stone wall facing the sea..."
    },
    question: {
      me: "📸 Pošalji fotografiju ostrva sa tačke pored zida!",
      ru: "📸 Пришли фото острова у стены!",
      en: "📸 Send a photo of the island from the stone wall!"
    },
    answer: "photo",
    success: {
      me: "📸 Savršeno. Svetionik ti je namignuo...\nAli more nikad ne ispriča sve.",
      ru: "📸 Великолепно. Маяк тебе подмигнул...\nНо море никогда не рассказывает всё.",
      en: "📸 Perfect. The lighthouse winked at you...\nBut the sea never tells the whole story."
    },
    retryMessage: {
      me: "📷 Pošalji fotografiju sa pravim pogledom — ostrvo mora da se vidi.",
      ru: "📷 Пришли фото с нужным видом — остров должен быть виден.",
      en: "📷 Send the photo from the correct angle — the island must be visible."
    }
  }
];

/**
 * Auto-detect user language code from Telegram context
 * @param {import('telegraf').Context} ctx
 * @returns {'ru' | 'me' | 'en'}
 */
function getLang(ctx) {
  const lang = ctx?.from?.language_code?.toLowerCase() || 'en';
  if (/^ru/.test(lang)) return 'ru';
  if (/^(sr|me|bs|hr)/.test(lang)) return 'me';
  return 'en';
}

module.exports = {
  steps,
  getLang
};