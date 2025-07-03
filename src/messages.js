/**
 * Localized message templates for all supported languages.
 * Language codes: 'en' (English), 'ru' (Russian), 'me' (Montenegrin)
 */
const messages = {
  welcome: {
    me: "🗝️ Dobrodošao u avanturu 'Tajna Budvanskog Svetionika'!\n\nLegenda te poziva... Hoćeš li krenuti putem zagonetki, starih simbola i morske svetlosti?",
    ru: "🗝️ Добро пожаловать в квест 'Тайна Будванского Маяка'!\n\nЛегенда зовёт... Готов пройти путь загадок, древних символов и морского света?",
    en: "🗝️ Welcome to the quest 'The Secret of the Budva Lighthouse'!\n\nA legend calls... Will you follow the path of riddles, ancient signs, and the light of the sea?"
  },

  chooseLang: {
    me: "🌍 Odaberi jezik da započneš potragu:",
    ru: "🌍 Пожалуйста, выбери язык для начала:",
    en: "🌍 Please choose your language to begin:"
  },

  help: {
    me: `📜 Interaktivna potraga vodi te kroz mističnu Budvu.\n\nPrati znakove, rješavaj zagonetke i otkrivaj stvarne lokacije.\n\n🧭 Treba ti:\n• Da budeš u Budvi (ili koristiš Google Maps)\n• Pažljivo čitanje\n• Odgovori ili fotografije\n\n🏁 Na kraju te čeka digitalni sertifikat i osvrt svetionika.`,
    ru: `📜 Этот квест — погружение в таинственную Будву.\n\nСледуй за подсказками, решай загадки, исследуй реальные места.\n\n🧭 Что нужно:\n• Быть в Будве (или использовать Google Maps)\n• Читать внимательно\n• Отвечать или присылать фото\n\n🏁 В финале — цифровой сертификат и свет маяка.`,
    en: `📜 This interactive quest will guide you through mystical Budva.\n\nFollow clues, solve puzzles, and explore real locations.\n\n🧭 You’ll need:\n• To be in Budva (or use Google Maps)\n• Careful reading\n• Answers or photos\n\n🏁 At the end — a digital certificate and the lighthouse’s light.`
  },

  correct: {
    me: "✅ Tačno! Sledeća stranica tvoje priče:",
    ru: "✅ Верно! Следующая страница легенды:",
    en: "✅ Correct! The next page of your story unfolds:"
  },

  wrong: {
    me: "❌ Nešto ne štima... Pogledaj još jednom i pokušaj ponovo.",
    ru: "❌ Что-то не так... Присмотрись и попробуй снова.",
    en: "❌ Not quite right... Look again and try once more."
  },

  finished: {
    me: "🎉 Čestitamo! Legenda te pamti kao onog koji je stigao do kraja.",
    ru: "🎉 Поздравляем! Легенда запомнит тебя как того, кто дошёл до конца.",
    en: "🎉 Congratulations! The legend will remember you as the one who reached the end."
  },

  thanks_quest: {
    me: "🙏 Hvala ti na istrajnosti! Svetionik više ne ćuti.",
    ru: "🙏 Спасибо за настойчивость! Маяк больше не молчит.",
    en: "🙏 Thank you for your perseverance! The lighthouse no longer sleeps."
  },

  feedback_intro: {
    me: "⭐ Kako ti se svidjela potraga? Ocijeni je od 1 do 5:",
    ru: "⭐ Как тебе квест? Поставь оценку от 1 до 5:",
    en: "⭐ How did you like the quest? Rate it from 1 to 5:"
  },

  thanks_feedback: {
    me: "🙏 Hvala ti! Ako želiš, možeš ostaviti i komentar.",
    ru: "🙏 Спасибо! Если хочешь, можешь оставить комментарий.",
    en: "🙏 Thank you! You can leave a comment if you'd like."
  },

  end_feedback: {
    me: "❤️ Hvala na tvojoj poruci! Sledeća potraga te već posmatra iz magle...",
    ru: "❤️ Спасибо за отзыв! Следующее приключение уже смотрит на тебя из тумана...",
    en: "❤️ Thanks for your message! The next quest already watches you from the mist..."
  },

  certificate_caption: {
    me: "završio/la si potragu sa čašću i dušom pustolova!",
    ru: "ты завершил(а) квест с честью и душой искателя!",
    en: "you’ve completed the quest with honor and the heart of a seeker!"
  },

  cert_fail: {
    me: "⚠️ Nismo uspjeli generisati tvoj sertifikat. Pokušaj ponovo kasnije.",
    ru: "⚠️ Не удалось создать сертификат. Попробуй позже.",
    en: "⚠️ Failed to generate your certificate. Try again later."
  },

  send_photo_prompt: {
    me: "📷 Pošalji fotografiju! Ona je ključ završetka.",
    ru: "📷 Пришли фотографию! Это ключ к финалу.",
    en: "📷 Send a photo! It’s the final key."
  },

  reset: {
    me: "🔄 Tvoj napredak je obrisan. 🌊 Počni ispočetka ako želiš ponovo proći put.",
    ru: "🔄 Прогресс сброшен. 🌊 Начни заново, если хочешь пройти путь снова.",
    en: "🔄 Your progress was reset. 🌊 Begin again if you wish to walk the path once more."
  },

  language_not_recognized: {
    me: "⚠️ Jezik nije prepoznat. Pokušaj ponovo:",
    ru: "⚠️ Язык не распознан. Попробуй снова:",
    en: "⚠️ Language not recognized. Try again:"
  },

  invalid_rating: {
    me: "⚠️ Molimo te da izabereš ocjenu od 1 do 5:",
    ru: "⚠️ Пожалуйста, выбери оценку от 1 до 5:",
    en: "⚠️ Please select a rating from 1 to 5:"
  },

  privacy: {
    me: "🔒 Privatnost je važna. Bot ne čuva lične podatke osim jezika i stanja kvestova. Sve informacije su lokalne i nisu dostupne trećim stranama.",
    ru: "🔒 Конфиденциальность важна. Бот не хранит личные данные, кроме языка и состояния квестов. Все данные локальны и недоступны третьим лицам.",
    en: "🔒 Privacy matters. The bot does not store personal data except for language and quest state. All information is local and not shared with third parties."
  }
};

module.exports = { messages };