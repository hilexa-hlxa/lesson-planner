// Тарифы — один источник для лендинга и страницы /pricing.
//
// PRO запущен (см. backend/src/Plans.php — лимиты применяются по-настоящему
// на бэкенде, 402 при превышении). Оплата НЕ автоматизирована: платёжного
// провайдера нет, поэтому кнопка PRO — mailto, а не чекаут. Апгрейд делается
// вручную через admin-панель после оплаты вне сайта (перевод, наличные и т.д.
// — что подойдёт). Цифры здесь ДОЛЖНЫ совпадать с backend/src/Plans.php::LIMITS
// — если лимит меняется, править нужно оба места.

export const PRO_LAUNCHED = true;

export const PLANS = {
  RU: {
    sectionTag: "Тарифы",
    sectionTitle: "Бесплатно для начала, PRO — когда нужно больше",
    sectionSub: "15 генераций в месяц хватает, чтобы попробовать. Нужно больше — переходите на PRO.",

    free: {
      name: "Бесплатный",
      price: "0 ₸",
      period: "навсегда",
      note: "Без карты. Без пробного периода, который заканчивается.",
      cta: "Начать бесплатно",
      ctaAuthed: "Перейти в хаб",
      features: [
        "15 AI-генераций в месяц (планы, тесты, отчёты — всё вместе)",
        "AI-тесты с кодом доступа для класса",
        "Классы и списки учеников без ограничений",
        "Вордл и игры для урока",
        "Экспорт в DOCX",
        "Три языка: RU, KZ, EN",
      ],
      limits: "15 генераций считаются в календарный месяц и обнуляются 1-го числа. Не хватает — переходите на PRO.",
    },

    pro: {
      name: "PRO",
      badge: "",
      price: "$25",
      period: "в месяц",
      note: "Оплата вручную, без автосписаний — напишите нам, договоримся об оплате и включим PRO на вашем аккаунте.",
      cta: "Перейти на PRO",
      inherits: "Всё из бесплатного, плюс:",
      features: [
        "150 AI-генераций в месяц вместо 15",
        "Тот же набор инструментов — без урезаний",
        "Приоритет при высокой нагрузке",
      ],
      planned: "",
    },

    schoolsNote: "Нужны аккаунты для школы или свои условия? Напишите — обсудим.",
  },

  KZ: {
    sectionTag: "Тарифтер",
    sectionTitle: "Бастау үшін тегін, көбірек керек болса — PRO",
    sectionSub: "Айына 15 генерация — байқап көруге жеткілікті. Көбірек керек пе — PRO-ға өтіңіз.",

    free: {
      name: "Тегін",
      price: "0 ₸",
      period: "мәңгі",
      note: "Картасыз. Аяқталатын сынақ мерзімі жоқ.",
      cta: "Тегін бастау",
      ctaAuthed: "Хабқа өту",
      features: [
        "Айына 15 AI-генерация (жоспар, тест, есеп — бәрі бірге)",
        "Сынып үшін код арқылы кіретін AI тесттер",
        "Сыныптар мен оқушылар тізімі — шектеусіз",
        "Вордл және сабаққа арналған ойындар",
        "DOCX экспорты",
        "Үш тіл: RU, KZ, EN",
      ],
      limits: "15 генерация күнтізбелік ай бойынша есептеледі және айдың 1-інде нөлденеді. Жетпей жатса — PRO-ға өтіңіз.",
    },

    pro: {
      name: "PRO",
      badge: "",
      price: "$25",
      period: "айына",
      note: "Төлем қолмен, автосписание жоқ — жазыңыз, төлем туралы келісеміз де аккаунтыңызда PRO қосамыз.",
      cta: "PRO-ға өту",
      inherits: "Тегіндегінің бәрі, оған қоса:",
      features: [
        "Айына 150 AI-генерация (15-тің орнына)",
        "Сол құралдар жинағы — кесусіз",
        "Жүктеме көп кезде басымдық",
      ],
      planned: "",
    },

    schoolsNote: "Мектепке аккаунт немесе өз шарттарыңыз керек пе? Жазыңыз — талқылайық.",
  },

  EN: {
    sectionTag: "Plans",
    sectionTitle: "Free to start, PRO when you need more",
    sectionSub: "15 generations a month is enough to try it out. Need more? Move to PRO.",

    free: {
      name: "Free",
      price: "0 ₸",
      period: "forever",
      note: "No card. No trial that runs out.",
      cta: "Start for free",
      ctaAuthed: "Go to hub",
      features: [
        "15 AI generations a month (plans, quizzes, reports — combined)",
        "AI quizzes with an access code for the class",
        "Unlimited classes and student rosters",
        "Wordle and in-lesson games",
        "DOCX export",
        "Three languages: RU, KZ, EN",
      ],
      limits: "The 15 generations count per calendar month and reset on the 1st. Need more — move to PRO.",
    },

    pro: {
      name: "PRO",
      badge: "",
      price: "$25",
      period: "per month",
      note: "Billed manually, no auto-charges — email us, we'll sort out payment and switch your account to PRO.",
      cta: "Move to PRO",
      inherits: "Everything in Free, plus:",
      features: [
        "150 AI generations a month instead of 15",
        "Same toolset — nothing cut down",
        "Priority when load is high",
      ],
      planned: "",
    },

    schoolsNote: "Need school accounts or your own terms? Email us — let's talk.",
  },
};

export const plansFor = (lang) => PLANS[lang] || PLANS.RU;
