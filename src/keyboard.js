const { Markup } = require('telegraf');

const messages = {
  startButton: {
    ru: '🌊 Начать квест',
    en: '🌊 Start the quest',
    me: '🌊 Počni potragu'
  },
  reset: {
    ru: '🔁 Сброс',
    en: '🔁 Reset',
    me: '🔁 Resetuj'
  },
  help: {
    ru: '❓ Помощь',
    en: '❓ Help',
    me: '❓ Pomoć'
  },
  test: {
    ru: '🧪 Тест грамоты',
    en: '🧪 Test Certificate',
    me: '🧪 Test Sertifikat'
  }
}

const keyboard = {
  /**
   * Returns the main keyboard based on language
   * @param {string} lang - Language code ('ru', 'en', 'me')
   */
  main: (lang) =>
    Markup.keyboard([
      [messages.reset[lang]],
      [messages.help[lang]],
    ]).resize(),

  start: (lang) =>
    Markup.keyboard([
      [messages.startButton[lang]],
      [messages.help[lang]],
    ]).resize(),

  lang: Markup.keyboard([
    ['🇲🇪 Crnogorski'],
    ['🇷🇺 Русский'],
    ['🇬🇧 English']
  ]).oneTime().resize(),

  feedback: Markup.keyboard([
    ['⭐️ 1', '⭐️ 2', '⭐️ 3'],
    ['⭐️ 4', '⭐️ 5']
  ]).oneTime().resize()
};

module.exports = { keyboard, keyboardButtons: messages };