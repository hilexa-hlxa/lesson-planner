// Курируемые колоды по предметам — общий источник контента для Memory Match
// (пары термин/определение) и Sort It Out (разложить термины по категориям).
//
// Контент захардкожен, а не генерируется ИИ: в приложении нет структурированной
// программы предметов (CONTEXT.md — только свободный текст subject/topic у
// генераций), а для мини-игр важнее стабильность и мгновенный старт, чем
// разнообразие раунда. Казахский текст — по школьной терминологии; при
// расхождении с учебником конкретной школы стоит поправить здесь же.

export const SUBJECTS = ["biology", "chemistry", "math", "history", "geography"];

export const SUBJECT_LABELS = {
  RU: { biology: "Биология", chemistry: "Химия", math: "Математика", history: "История", geography: "География" },
  KZ: { biology: "Биология", chemistry: "Химия", math: "Математика", history: "Тарих", geography: "География" },
  EN: { biology: "Biology", chemistry: "Chemistry", math: "Math", history: "History", geography: "Geography" },
};

export const SUBJECT_DECKS = {
  biology: {
    categories: {
      RU: ["Клетка", "Системы организма", "Экология"],
      KZ: ["Жасуша", "Ағза жүйелері", "Экология"],
      EN: ["Cell", "Body systems", "Ecology"],
    },
    terms: [
      { categoryIndex: 0, RU: ["Ядро", "Хранит ДНК клетки"], KZ: ["Ядро", "Жасушаның ДНҚ-сын сақтайды"], EN: ["Nucleus", "Stores the cell's DNA"] },
      { categoryIndex: 0, RU: ["Митохондрия", "Вырабатывает энергию клетки"], KZ: ["Митохондрия", "Жасушаға энергия өндіреді"], EN: ["Mitochondria", "Produces energy for the cell"] },
      { categoryIndex: 0, RU: ["Мембрана", "Отделяет клетку от внешней среды"], KZ: ["Мембрана", "Жасушаны сыртқы ортадан бөледі"], EN: ["Membrane", "Separates the cell from its surroundings"] },
      { categoryIndex: 1, RU: ["Сердце", "Перекачивает кровь по телу"], KZ: ["Жүрек", "Қанды дене бойынша айдайды"], EN: ["Heart", "Pumps blood through the body"] },
      { categoryIndex: 1, RU: ["Лёгкие", "Насыщают кровь кислородом"], KZ: ["Өкпе", "Қанды оттегімен қанықтырады"], EN: ["Lungs", "Oxygenate the blood"] },
      { categoryIndex: 1, RU: ["Нейрон", "Передаёт нервные импульсы"], KZ: ["Нейрон", "Жүйке импульстарын өткізеді"], EN: ["Neuron", "Transmits nerve impulses"] },
      { categoryIndex: 2, RU: ["Фотосинтез", "Растения превращают свет в энергию"], KZ: ["Фотосинтез", "Өсімдіктер жарықты энергияға айналдырады"], EN: ["Photosynthesis", "Plants convert light into energy"] },
      { categoryIndex: 2, RU: ["Экосистема", "Сообщество живых организмов и среды"], KZ: ["Экожүйе", "Тірі ағзалар мен ортаның бірлестігі"], EN: ["Ecosystem", "A community of organisms and their environment"] },
    ],
  },
  chemistry: {
    categories: {
      RU: ["Частицы", "Реакции", "Вещества"],
      KZ: ["Бөлшектер", "Реакциялар", "Заттар"],
      EN: ["Particles", "Reactions", "Substances"],
    },
    terms: [
      { categoryIndex: 0, RU: ["Атом", "Наименьшая частица химического элемента"], KZ: ["Атом", "Химиялық элементтің ең кіші бөлшегі"], EN: ["Atom", "The smallest unit of a chemical element"] },
      { categoryIndex: 0, RU: ["Протон", "Положительно заряженная частица ядра"], KZ: ["Протон", "Ядроның оң зарядталған бөлшегі"], EN: ["Proton", "Positively charged particle in the nucleus"] },
      { categoryIndex: 0, RU: ["Электрон", "Отрицательно заряженная частица атома"], KZ: ["Электрон", "Атомның теріс зарядталған бөлшегі"], EN: ["Electron", "Negatively charged particle of an atom"] },
      { categoryIndex: 1, RU: ["Катализатор", "Ускоряет реакцию, не расходуясь"], KZ: ["Катализатор", "Реакцияны жеделдетеді, өзі жұмсалмайды"], EN: ["Catalyst", "Speeds up a reaction without being consumed"] },
      { categoryIndex: 1, RU: ["Окисление", "Потеря электронов веществом"], KZ: ["Тотығу", "Зат электрондарын жоғалтады"], EN: ["Oxidation", "Loss of electrons by a substance"] },
      { categoryIndex: 1, RU: ["Нейтрализация", "Реакция кислоты и основания"], KZ: ["Бейтараптау", "Қышқыл мен негіздің реакциясы"], EN: ["Neutralization", "Reaction between an acid and a base"] },
      { categoryIndex: 2, RU: ["Кислота", "Вещество, отдающее протон"], KZ: ["Қышқыл", "Протон беретін зат"], EN: ["Acid", "A substance that donates a proton"] },
      { categoryIndex: 2, RU: ["Щёлочь", "Вещество, принимающее протон"], KZ: ["Сілті", "Протонды қабылдайтын зат"], EN: ["Base", "A substance that accepts a proton"] },
    ],
  },
  math: {
    categories: {
      RU: ["Геометрия", "Алгебра", "Статистика"],
      KZ: ["Геометрия", "Алгебра", "Статистика"],
      EN: ["Geometry", "Algebra", "Statistics"],
    },
    terms: [
      { categoryIndex: 0, RU: ["Периметр", "Сумма длин всех сторон фигуры"], KZ: ["Периметр", "Фигураның барлық қабырғалар ұзындығының қосындысы"], EN: ["Perimeter", "The sum of all side lengths of a shape"] },
      { categoryIndex: 0, RU: ["Гипотенуза", "Самая длинная сторона прямоугольного треугольника"], KZ: ["Гипотенуза", "Тікбұрышты үшбұрыштың ең ұзын қабырғасы"], EN: ["Hypotenuse", "The longest side of a right triangle"] },
      { categoryIndex: 0, RU: ["Радиус", "Расстояние от центра круга до его края"], KZ: ["Радиус", "Шеңбердің центрінен шетіне дейінгі қашықтық"], EN: ["Radius", "Distance from a circle's center to its edge"] },
      { categoryIndex: 1, RU: ["Уравнение", "Равенство с неизвестной величиной"], KZ: ["Теңдеу", "Белгісізі бар теңдік"], EN: ["Equation", "A statement of equality with an unknown"] },
      { categoryIndex: 1, RU: ["Коэффициент", "Числовой множитель перед переменной"], KZ: ["Коэффициент", "Айнымалының алдындағы сандық көбейткіш"], EN: ["Coefficient", "A numerical factor in front of a variable"] },
      { categoryIndex: 1, RU: ["Функция", "Правило, сопоставляющее каждому x одно y"], KZ: ["Функция", "Әр x-ке бір ғана y сәйкестендіретін ереже"], EN: ["Function", "A rule mapping each x to exactly one y"] },
      { categoryIndex: 2, RU: ["Среднее", "Сумма значений, делённая на их количество"], KZ: ["Орташа мән", "Мәндер қосындысының олардың санына қатынасы"], EN: ["Mean", "Sum of values divided by their count"] },
      { categoryIndex: 2, RU: ["Медиана", "Значение посередине упорядоченного ряда"], KZ: ["Медиана", "Реттелген қатардың ортаңғы мәні"], EN: ["Median", "The middle value of an ordered data set"] },
    ],
  },
  history: {
    categories: {
      RU: ["Древний мир", "Средние века", "Новое время"],
      KZ: ["Ежелгі дүние", "Орта ғасырлар", "Жаңа заман"],
      EN: ["Ancient world", "Middle Ages", "Modern era"],
    },
    terms: [
      { categoryIndex: 0, RU: ["Пирамида", "Гробница древнеегипетских фараонов"], KZ: ["Пирамида", "Ежелгі Мысыр перғауындарының қабірі"], EN: ["Pyramid", "Tomb of the ancient Egyptian pharaohs"] },
      { categoryIndex: 0, RU: ["Демократия", "Власть народа в Древних Афинах"], KZ: ["Демократия", "Ежелгі Афиныдағы халық билігі"], EN: ["Democracy", "Rule by the people, born in ancient Athens"] },
      { categoryIndex: 0, RU: ["Шёлковый путь", "Торговые пути между Востоком и Западом"], KZ: ["Жібек жолы", "Шығыс пен Батыс арасындағы сауда жолдары"], EN: ["Silk Road", "Trade routes linking East and West"] },
      { categoryIndex: 1, RU: ["Феодализм", "Система землевладения через вассальные связи"], KZ: ["Феодализм", "Вассалдық қатынастар арқылы жер иелену жүйесі"], EN: ["Feudalism", "A land-holding system built on vassal ties"] },
      { categoryIndex: 1, RU: ["Крестовые походы", "Военные походы в Святую землю"], KZ: ["Крест жорықтары", "Қасиетті жерге жасалған әскери жорықтар"], EN: ["Crusades", "Military expeditions to the Holy Land"] },
      { categoryIndex: 1, RU: ["Ханство", "Государство под властью хана"], KZ: ["Хандық", "Хан билейтін мемлекет"], EN: ["Khanate", "A state ruled by a khan"] },
      { categoryIndex: 2, RU: ["Индустриализация", "Переход к машинному производству"], KZ: ["Индустрияландыру", "Машиналық өндіріске көшу"], EN: ["Industrialization", "The shift to machine-based manufacturing"] },
      { categoryIndex: 2, RU: ["Независимость", "Казахстан обрёл её в 1991 году"], KZ: ["Тәуелсіздік", "Қазақстан оны 1991 жылы алды"], EN: ["Independence", "Kazakhstan gained it in 1991"] },
    ],
  },
  geography: {
    categories: {
      RU: ["Рельеф", "Климат", "Вода"],
      KZ: ["Бедер", "Климат", "Су"],
      EN: ["Landforms", "Climate", "Water"],
    },
    terms: [
      { categoryIndex: 0, RU: ["Плато", "Возвышенная равнина с плоской вершиной"], KZ: ["Үстірт", "Жазық төбесі бар биік жазық"], EN: ["Plateau", "An elevated flat-topped area"] },
      { categoryIndex: 0, RU: ["Хребет", "Цепь связанных горных вершин"], KZ: ["Жотасы", "Байланысқан тау шыңдарының тізбегі"], EN: ["Mountain range", "A connected chain of mountain peaks"] },
      { categoryIndex: 0, RU: ["Степь", "Равнина с травянистой растительностью"], KZ: ["Дала", "Шөптесін өсімдігі бар жазық"], EN: ["Steppe", "A grassy plain with few trees"] },
      { categoryIndex: 1, RU: ["Муссон", "Сезонный ветер, приносящий дожди"], KZ: ["Муссон", "Жаңбыр әкелетін маусымдық жел"], EN: ["Monsoon", "A seasonal wind bringing heavy rain"] },
      { categoryIndex: 1, RU: ["Аридный", "Засушливый климат с малым количеством осадков"], KZ: ["Арид", "Жауын-шашыны аз құрғақшылық климат"], EN: ["Arid", "A dry climate with little rainfall"] },
      { categoryIndex: 1, RU: ["Континентальный", "Климат с резкими перепадами температур"], KZ: ["Континенттік", "Температура ауытқуы күшті климат"], EN: ["Continental", "A climate with sharp temperature swings"] },
      { categoryIndex: 2, RU: ["Дельта", "Устье реки, разветвлённое на рукава"], KZ: ["Атырау", "Тармақтарға бөлінген өзен сағасы"], EN: ["Delta", "A river mouth split into branching channels"] },
      { categoryIndex: 2, RU: ["Ледник", "Многолетняя масса движущегося льда"], KZ: ["Мұздық", "Көп жылдық қозғалатын мұз массасы"], EN: ["Glacier", "A long-lasting mass of moving ice"] },
    ],
  },
};

/** Пары термин/определение на нужном языке — источник карточек для Memory Match. */
export function getDeckPairs(subject, lang = "RU") {
  const deck = SUBJECT_DECKS[subject];
  if (!deck) return [];
  return deck.terms.map((t, i) => {
    const [term, definition] = t[lang] || t.RU;
    return { id: i, term, definition };
  });
}

/** Термины + категории на нужном языке — источник раунда для Sort It Out. */
export function getDeckSortRound(subject, lang = "RU") {
  const deck = SUBJECT_DECKS[subject];
  if (!deck) return { categories: [], items: [] };
  const categories = deck.categories[lang] || deck.categories.RU;
  const items = deck.terms.map((t, i) => {
    const [term] = t[lang] || t.RU;
    return { id: i, term, categoryIndex: t.categoryIndex };
  });
  return { categories, items };
}
