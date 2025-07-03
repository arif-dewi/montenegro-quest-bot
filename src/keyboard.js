const { Markup } = require('telegraf');

// Localized button labels
const labels = {
  start: {
    ru: '🌊 Начать квест',
    en: '🌊 Start the quest',
    me: '🌊 Počni potragu',
  },
  reset: {
    ru: '🔁 Сброс',
    en: '🔁 Reset',
    me: '🔁 Resetuj',
  },
  help: {
    ru: '❓ Помощь',
    en: '❓ Help',
    me: '❓ Pomoć',
  },
  test: {
    ru: '🧪 Тест грамоты',
    en: '🧪 Test Certificate',
    me: '🧪 Test Sertifikat',
  },
};

// Keyboard markup builders
const keyboard = {
  /**
   * Main in-quest keyboard: Reset + Help
   */
  main: (lang) =>
    Markup.keyboard([
      [labels.reset[lang]],
      [labels.help[lang]],
    ]).resize(),

  /**
   * Start screen keyboard: Start + Help
   */
  start: (lang) =>
    Markup.keyboard([
      [labels.start[lang]],
      [labels.help[lang]],
    ]).resize(),

  /**
   * Language selector (one-time keyboard)
   */
  lang: Markup.keyboard([
    ['🇲🇪 Crnogorski'],
    ['🇷🇺 Русский'],
    ['🇬🇧 English'],
  ])
    .oneTime()
    .resize(),

  /**
   * Star rating keyboard (feedback)
   */
  feedback: Markup.keyboard([
    ['⭐️ 1', '⭐️ 2', '⭐️ 3'],
    ['⭐️ 4', '⭐️ 5'],
  ])
    .oneTime()
    .resize(),
};

// Export buttons separately for "hears" matching
module.exports = {
  keyboard,
  keyboardButtons: labels,
};