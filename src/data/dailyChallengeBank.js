// Банк для Daily Streak Challenge — короткие раунды по 5 смешанных вопросов.
// "Сегодняшний" раунд выбирается детерминированно по дню года (см.
// getDailyChallenge), поэтому все ученики в один день видят один и тот же
// раунд без похода на сервер за контентом. Ответы проверяются на клиенте —
// это не оценка (Test), а разминка, для которой уместна та же модель доверия,
// что у соло-режима Wordle/Hangman. Настоящая ставка — серия (streak) —
// подтверждается сервером отдельно, см. POST /api/streak/complete.

const CHALLENGES = [
  {
    RU: [
      { q: "Сколько будет 7 × 8?", options: ["54", "56", "64", "58"], correctIndex: 1 },
      { q: "Какая планета ближе всего к Солнцу?", options: ["Венера", "Земля", "Меркурий", "Марс"], correctIndex: 2 },
      { q: "Столица Казахстана?", options: ["Алматы", "Астана", "Шымкент", "Караганда"], correctIndex: 1 },
      { q: "Сколько сторон у шестиугольника?", options: ["5", "6", "7", "8"], correctIndex: 1 },
      { q: "Какой газ растения выделяют при фотосинтезе?", options: ["Азот", "Углекислый газ", "Кислород", "Водород"], correctIndex: 2 },
    ],
    KZ: [
      { q: "7 × 8 нешеге тең?", options: ["54", "56", "64", "58"], correctIndex: 1 },
      { q: "Күнге ең жақын планета қайсы?", options: ["Шолпан", "Жер", "Меркурий", "Марс"], correctIndex: 2 },
      { q: "Қазақстанның астанасы қайсы?", options: ["Алматы", "Астана", "Шымкент", "Қарағанды"], correctIndex: 1 },
      { q: "Алтыбұрыштың неше қабырғасы бар?", options: ["5", "6", "7", "8"], correctIndex: 1 },
      { q: "Өсімдіктер фотосинтез кезінде қай газды бөледі?", options: ["Азот", "Көмірқышқыл газы", "Оттегі", "Сутегі"], correctIndex: 2 },
    ],
    EN: [
      { q: "What is 7 × 8?", options: ["54", "56", "64", "58"], correctIndex: 1 },
      { q: "Which planet is closest to the Sun?", options: ["Venus", "Earth", "Mercury", "Mars"], correctIndex: 2 },
      { q: "What is the capital of Kazakhstan?", options: ["Almaty", "Astana", "Shymkent", "Karaganda"], correctIndex: 1 },
      { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correctIndex: 1 },
      { q: "Which gas do plants release during photosynthesis?", options: ["Nitrogen", "Carbon dioxide", "Oxygen", "Hydrogen"], correctIndex: 2 },
    ],
  },
  {
    RU: [
      { q: "Сколько будет 12 × 12?", options: ["124", "144", "142", "134"], correctIndex: 1 },
      { q: "Какой химический элемент обозначается 'O'?", options: ["Золото", "Кислород", "Осмий", "Олово"], correctIndex: 1 },
      { q: "Самая длинная река в мире?", options: ["Амазонка", "Нил", "Волга", "Иртыш"], correctIndex: 1 },
      { q: "Сколько костей в теле взрослого человека?", options: ["186", "206", "226", "246"], correctIndex: 1 },
      { q: "В каком году распался СССР?", options: ["1989", "1991", "1993", "1985"], correctIndex: 1 },
    ],
    KZ: [
      { q: "12 × 12 нешеге тең?", options: ["124", "144", "142", "134"], correctIndex: 1 },
      { q: "'O' қай химиялық элементті білдіреді?", options: ["Алтын", "Оттегі", "Осмий", "Қалайы"], correctIndex: 1 },
      { q: "Әлемдегі ең ұзын өзен?", options: ["Амазонка", "Нил", "Еділ", "Ертіс"], correctIndex: 1 },
      { q: "Ересек адам денесінде неше сүйек бар?", options: ["186", "206", "226", "246"], correctIndex: 1 },
      { q: "КСРО қай жылы ыдырады?", options: ["1989", "1991", "1993", "1985"], correctIndex: 1 },
    ],
    EN: [
      { q: "What is 12 × 12?", options: ["124", "144", "142", "134"], correctIndex: 1 },
      { q: "Which chemical element is symbol 'O'?", options: ["Gold", "Oxygen", "Osmium", "Tin"], correctIndex: 1 },
      { q: "What is the longest river in the world?", options: ["Amazon", "Nile", "Volga", "Irtysh"], correctIndex: 1 },
      { q: "How many bones does an adult human have?", options: ["186", "206", "226", "246"], correctIndex: 1 },
      { q: "In what year did the USSR dissolve?", options: ["1989", "1991", "1993", "1985"], correctIndex: 1 },
    ],
  },
  {
    RU: [
      { q: "Сколько будет 15 + 27?", options: ["42", "40", "44", "38"], correctIndex: 0 },
      { q: "Какой орган перекачивает кровь?", options: ["Печень", "Сердце", "Почка", "Лёгкое"], correctIndex: 1 },
      { q: "Самый большой океан на Земле?", options: ["Атлантический", "Индийский", "Тихий", "Северный Ледовитый"], correctIndex: 2 },
      { q: "Сколько будет 100 ÷ 4?", options: ["20", "25", "30", "24"], correctIndex: 1 },
      { q: "Кто написал 'Путь Абая'?", options: ["Абай Кунанбаев", "Мухтар Ауэзов", "Ильяс Есенберлин", "Олжас Сулейменов"], correctIndex: 1 },
    ],
    KZ: [
      { q: "15 + 27 нешеге тең?", options: ["42", "40", "44", "38"], correctIndex: 0 },
      { q: "Қай мүше қанды айдайды?", options: ["Бауыр", "Жүрек", "Бүйрек", "Өкпе"], correctIndex: 1 },
      { q: "Жердегі ең үлкен мұхит?", options: ["Атлант", "Үнді", "Тынық", "Солтүстік Мұзды"], correctIndex: 2 },
      { q: "100 ÷ 4 нешеге тең?", options: ["20", "25", "30", "24"], correctIndex: 1 },
      { q: "'Абай жолы' романын кім жазды?", options: ["Абай Құнанбаев", "Мұхтар Әуезов", "Ілияс Есенберлин", "Олжас Сүлейменов"], correctIndex: 1 },
    ],
    EN: [
      { q: "What is 15 + 27?", options: ["42", "40", "44", "38"], correctIndex: 0 },
      { q: "Which organ pumps blood?", options: ["Liver", "Heart", "Kidney", "Lung"], correctIndex: 1 },
      { q: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correctIndex: 2 },
      { q: "What is 100 ÷ 4?", options: ["20", "25", "30", "24"], correctIndex: 1 },
      { q: "Who wrote 'The Path of Abai'?", options: ["Abai Kunanbayev", "Mukhtar Auezov", "Ilyas Esenberlin", "Olzhas Suleimenov"], correctIndex: 1 },
    ],
  },
  {
    RU: [
      { q: "Сколько будет 9 × 6?", options: ["54", "56", "45", "63"], correctIndex: 0 },
      { q: "Какой газ необходим для дыхания человека?", options: ["Азот", "Кислород", "Гелий", "Метан"], correctIndex: 1 },
      { q: "Самая высокая гора в мире?", options: ["Килиманджаро", "Эверест", "Эльбрус", "Хан-Тенгри"], correctIndex: 1 },
      { q: "Сколько градусов в прямом угле?", options: ["45", "90", "180", "360"], correctIndex: 1 },
      { q: "Какой металл жидкий при комнатной температуре?", options: ["Железо", "Ртуть", "Алюминий", "Цинк"], correctIndex: 1 },
    ],
    KZ: [
      { q: "9 × 6 нешеге тең?", options: ["54", "56", "45", "63"], correctIndex: 0 },
      { q: "Адам тыныс алуы үшін қай газ қажет?", options: ["Азот", "Оттегі", "Гелий", "Метан"], correctIndex: 1 },
      { q: "Әлемдегі ең биік тау?", options: ["Килиманджаро", "Эверест", "Эльбрус", "Хан Тәңірі"], correctIndex: 1 },
      { q: "Тік бұрышта неше градус бар?", options: ["45", "90", "180", "360"], correctIndex: 1 },
      { q: "Бөлме температурасында қай металл сұйық күйде болады?", options: ["Темір", "Сынап", "Алюминий", "Мырыш"], correctIndex: 1 },
    ],
    EN: [
      { q: "What is 9 × 6?", options: ["54", "56", "45", "63"], correctIndex: 0 },
      { q: "Which gas do humans need to breathe?", options: ["Nitrogen", "Oxygen", "Helium", "Methane"], correctIndex: 1 },
      { q: "What is the tallest mountain in the world?", options: ["Kilimanjaro", "Everest", "Elbrus", "Khan Tengri"], correctIndex: 1 },
      { q: "How many degrees are in a right angle?", options: ["45", "90", "180", "360"], correctIndex: 1 },
      { q: "Which metal is liquid at room temperature?", options: ["Iron", "Mercury", "Aluminum", "Zinc"], correctIndex: 1 },
    ],
  },
  {
    RU: [
      { q: "Сколько будет 8² (восемь в квадрате)?", options: ["16", "56", "64", "72"], correctIndex: 2 },
      { q: "Сколько цветов в радуге?", options: ["5", "6", "7", "8"], correctIndex: 2 },
      { q: "Столица Франции?", options: ["Лион", "Марсель", "Париж", "Ницца"], correctIndex: 2 },
      { q: "Сколько будет 144 ÷ 12?", options: ["11", "12", "13", "14"], correctIndex: 1 },
      { q: "Какое озеро — самое глубокое в мире?", options: ["Балхаш", "Байкал", "Иссык-Куль", "Каспийское"], correctIndex: 1 },
    ],
    KZ: [
      { q: "8² (сегіздің квадраты) нешеге тең?", options: ["16", "56", "64", "72"], correctIndex: 2 },
      { q: "Кемпірқосақта неше түс бар?", options: ["5", "6", "7", "8"], correctIndex: 2 },
      { q: "Франция астанасы?", options: ["Лион", "Марсель", "Париж", "Ницца"], correctIndex: 2 },
      { q: "144 ÷ 12 нешеге тең?", options: ["11", "12", "13", "14"], correctIndex: 1 },
      { q: "Әлемдегі ең терең көл қайсы?", options: ["Балқаш", "Байкал", "Ыстықкөл", "Каспий"], correctIndex: 1 },
    ],
    EN: [
      { q: "What is 8² (eight squared)?", options: ["16", "56", "64", "72"], correctIndex: 2 },
      { q: "How many colors are in a rainbow?", options: ["5", "6", "7", "8"], correctIndex: 2 },
      { q: "What is the capital of France?", options: ["Lyon", "Marseille", "Paris", "Nice"], correctIndex: 2 },
      { q: "What is 144 ÷ 12?", options: ["11", "12", "13", "14"], correctIndex: 1 },
      { q: "Which lake is the deepest in the world?", options: ["Balkhash", "Baikal", "Issyk-Kul", "Caspian"], correctIndex: 1 },
    ],
  },
];

/** Раунд "на сегодня" — один и тот же для всех в течение дня, без похода на сервер. */
export function getDailyChallenge(lang = "RU", date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  const set = CHALLENGES[dayOfYear % CHALLENGES.length];
  return (set[lang] || set.RU).map((q, i) => ({ id: i, ...q }));
}
