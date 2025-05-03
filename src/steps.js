const steps = [
  {
    story: {
      me: "📜 *Poglavlje I: Zagonetno Pismo*\n\nIz daleke prošlosti, u tvoje ruke stiže pismo. Mastilo je razliveno, papir miriše na more.\n\n'...ako čitaš ovo, možda je već kasno... svetionik više ne ćuti... ja sam zaključao vrata, ali ključ je tvoj... prati lava.'\n\nStojiš pred južnim vratima Starog grada. Iznad luka — kameni lav. Njegove oči kao da čuvaju priču.",
      ru: "📜 *Глава I: Таинственное письмо*\n\nИз глубины веков тебе попадает письмо. Чернила размазаны, бумага пахнет солью.\n\n'...если ты это читаешь, возможно, уже поздно... маяк больше не молчит... я запер дверь, но ключ — у тебя... следуй за львом.'\n\nТы стоишь у южных ворот Старого города. Над аркой — каменный лев. Его взгляд хранит тайну.",
      en: "📜 *Chapter I: The Cryptic Letter*\n\nFrom a distant past, a letter finds your hands. The ink is smeared, the paper smells of sea salt.\n\n'...if you're reading this, it may already be too late... the lighthouse no longer sleeps... I sealed the door, but the key is yours... follow the lion.'\n\nYou stand at the southern gate of Old Town. Above the arch — a stone lion. Its eyes guard the story."
    },
    question: {
      me: "⏰ Koliko je sati na starom satu?",
      ru: "⏰ Сколько времени на старых часах?",
      en: "⏰ What time is on the old clock?"
    },
    answer: ["10:15", "10.15", "10[-:.\\s]?15", "10\\s15"]
  },
  {
    story: {
      me: "⛪ *Poglavlje II: Zidovi Pamte*\n\nU tišini hrama čuješ jeku davnih molitvi. Freska na zidu je ispucala, ali ispod nje — ugravirane riječi:\n\"Molili smo se, ali on nije čuo... izabrao je tišinu.\"",
      ru: "⛪ *Глава II: Стены помнят*\n\nВ тишине храма эхом звучат забытые молитвы. На стене под трещиной фрески — гравировка:\n\"Мы молились, но он не услышал... он выбрал молчание.\"",
      en: "⛪ *Chapter II: The Walls Remember*\n\nIn the chapel’s hush, whispers of prayers long gone linger. Beneath the cracked fresco, words are carved:\n\"We prayed, but he never heard... he chose silence.\""
    },
    question: {
      me: "🔤 Koja je prva riječ iznad mozaika?",
      ru: "🔤 Какое первое слово над мозаикой?",
      en: "🔤 What is the first word above the mosaic?"
    },
    answer: ["pomolimo"]
  },
  {
    story: {
      me: "⚓ *Poglavlje III: Sidro Tajni*\n\nPrilaziš starom sidru. Lanaca je manje nego što bi očekivao. Na kamenu — poruka:\n\"Ne pokušavaj zadržati ono što želi da ode.\"",
      ru: "⚓ *Глава III: Якорь Тайн*\n\nТы подходишь к старому якорю. Цепей меньше, чем ожидалось. На камне — надпись:\n\"Не пытайся удержать то, что хочет уйти.\"",
      en: "⚓ *Chapter III: The Anchor of Secrets*\n\nYou approach the old anchor. Fewer chains than expected. Etched on stone:\n\"Don’t try to hold on to what longs to leave.\""
    },
    question: {
      me: "🔗 Koliko lanaca drži sidro?",
      ru: "🔗 Сколько цепей держат якорь?",
      en: "🔗 How many chains hold the anchor?"
    },
    answer: ["3", "три", "tri"]
  },
  {
    story: {
      me: "🌌 *Završno Poglavlje: Svetionik se Budi*\n\nStojiš na ivici grada. Ostrvo ispred tebe spava, obavijeno maglom. Odjednom — bljesak. Svetionik... migne.\n\nLegenda je zaokružena. Ali svetlost postavlja pitanje: \"Zašto si došao baš ti?\"",
      ru: "🌌 *Последняя глава: Пробуждение маяка*\n\nТы стоишь на краю города. Остров впереди спит в тумане. Вдруг — вспышка. Маяк... мигнул.\n\nКруг замкнулся. Но огонь задаёт вопрос: \"Почему именно ты оказался здесь?\"",
      en: "🌌 *Final Chapter: The Lighthouse Awakens*\n\nYou stand at the city’s edge. The island lies silent in the mist. Suddenly — a flash. The lighthouse... flickers.\n\nThe legend closes its loop. But the light asks: \"Why were you the one to arrive?\""
    },
    question: {
      me: "📸 Pošalji fotografiju ostrva sa obale!",
      ru: "📸 Пришли фото острова с берега!",
      en: "📸 Send a photo of the island from the shore!"
    },
    answer: "photo"
  }
];

module.exports = { steps };
