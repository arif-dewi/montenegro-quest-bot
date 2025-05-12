// steps.js

const steps = [
  {
    story: {
      me: "🏰 Poglavlje I: Vratima sve počinje\n\nKamen pod tvojim nogama već pamti hiljade koraka. Ali sada — ti si taj koji dolazi ne slučajno. Vjetar nosi miris mora i nešto... zaboravljeno.\n\nPred tobom su Sjeverna Vrata Starog grada. Bez pompe, bez čuvara. Samo ti i stari zidovi.\n\n\"Ako si spreman, uđi.\"",
      ru: "🏰 Глава I: Всё начинается с Врат\n\nКамень под ногами хранит тысячи шагов. Но сейчас — твой шаг имеет значение. Ветер приносит запах моря и... чего-то забытого.\n\nПеред тобой — Cеверные Врата Старого города. Ни стражи, ни толпы. Только ты и древние стены.\n\n\"Если готов — входи.\"",
      en: "🏰 Chapter I: It Begins at the Gate\n\nThe stone beneath your feet has felt a thousand footsteps. But now — it's yours that matter. The sea breeze brings something... forgotten.\n\nAhead lie the Nothern Gates of the Old Town. No guards. No banners. Just you and the walls.\n\n\"If you're ready, step in.\""
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
      me: "🔔 Poglavlje II: Tri Zvona\n\nNa trgu čeka crkva. Njena fasada crveno-bijela, kao zastava zaboravljenog carstva.\n\nGledaj gore. Zvona tiho vise. Kao da broje vrijeme koje je prošlo. Ili ono koje dolazi...",
      ru: "🔔 Глава II: Три колокола\n\nНа площади — церковь. Красно-белый фасад, как знамя забытой империи.\n\nСмотри вверх. Колокола молчат. Они считают прошедшее время. Или грядущее...",
      en: "🔔 Chapter II: The Three Bells\n\nIn the square, the church waits. Its red-white façade — like a flag of a forgotten realm.\n\nLook up. The bells hang still. Counting time gone by — or time to come..."
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
      me: "🏰 Poglavlje III: Kamen sa Godinom\n\nKrećeš ka tvrđavi. Njena vrata su zatvorena, ali iznad njih urezano: 'ERBAUT IM JAHRE...'\n\nGodina stoji jasno. Kao da govori: 'Još nije kasno.'",
      ru: "🏰 Глава III: Камень с годом\n\nТы идёшь к цитадели. Врата закрыты, но над ними высечено: 'ERBAUT IM JAHRE...'\n\nГод указан ясно. Как будто намекает: 'Ещё не поздно.'",
      en: "🏰 Chapter III: The Carved Year\n\nYou approach the citadel. The doors are shut, but above them is carved: 'ERBAUT IM JAHRE...'\n\nThe year is clear. As if saying: 'It’s not too late.'"
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
      me: "🌊 Završno Poglavlje: Pogled sa Kamenog Zida\n\nNa kraju staze — zid koji gleda ka moru. Ostrvo lebdi u daljini, zeleno i usamljeno.\n\nOvde svetionik šapuće vetru. A tvoj zadatak — zabeleži trenutak.\n\nLegenda završava na fotografiji... ako znaš gde da staneš.",
      ru: "🌊 Финал: Вид с каменной стены\n\nВ конце пути — стена у моря. Остров одиноко покоится вдали.\n\nЗдесь маяк шепчет ветру. А тебе осталось лишь... запечатлеть мгновение.\n\nЛегенда завершается фотографией. Если ты знаешь, где встать.",
      en: "🌊 Final Chapter: View from the Stone Wall\n\nAt the end of the path — a stone wall facing the sea. The island floats in the distance, green and quiet.\n\nHere, the lighthouse whispers to the wind. And your task — capture the moment.\n\nThe legend ends with a photo. If you know where to stand."
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

function getLang(ctx) {
  const lang = ctx?.from?.language_code || 'en';
  if (/^ru/.test(lang)) return 'ru';
  if (/^sr|me|bs|hr/.test(lang)) return 'me';
  return 'en';
}

module.exports = { steps, getLang };