// Тарифы — один источник для лендинга и страницы /pricing.
//
// ВАЖНО про честность формулировок: сегодня в продукте нет ни квот, ни лимитов
// на классы — всё перечисленное во «Бесплатном» работает без ограничений. Поэтому
// колонка PRO описана как БУДУЩЕЕ («скоро»), без цены и без намёка, что бесплатный
// план уже чем-то урезан. Когда лимиты появятся в коде, правки нужны здесь и в
// текстах /pricing и /terms одновременно.

export const PRO_LAUNCHED = false;

export const PLANS = {
  RU: {
    sectionTag: "Тарифы",
    sectionTitle: "Что входит сейчас и что появится",
    sectionSub: "Всё, чем можно пользоваться сегодня, — бесплатно. Платный тариф появится позже и ничего из этого не заберёт.",

    free: {
      name: "Бесплатный",
      price: "0 ₸",
      period: "навсегда для того, что есть сейчас",
      note: "Без карты. Без пробного периода, который заканчивается.",
      cta: "Начать бесплатно",
      ctaAuthed: "Перейти в хаб",
      features: [
        "Планы уроков — без ограничения по количеству",
        "AI-тесты с кодом доступа для класса",
        "Итог урока и AI-отчёт по классу",
        "Классы и списки учеников",
        "Вордл и игры для урока",
        "Экспорт в DOCX",
        "Три языка: RU, KZ, EN",
      ],
      limits: "Скорость генерации зависит от квоты AI-провайдера: в час пик запрос может выполняться дольше.",
    },

    pro: {
      name: "PRO",
      badge: "Скоро",
      price: "—",
      period: "цена будет объявлена заранее",
      note: "Пока не запущен. Всё, что сейчас бесплатно, останется бесплатным.",
      cta: "Сообщить о запуске",
      inherits: "Всё из бесплатного, плюс:",
      features: [
        "Повышенные квоты генерации в часы пик",
        "Больше классов и учеников в классе",
        "Аккаунты для всей школы и общий доступ для методиста",
        "Обучение коллектива и приоритетная поддержка",
      ],
      planned: "Это план развития, а не действующее предложение — сроки и состав могут измениться.",
    },

    schoolsNote: "Нужны аккаунты для школы уже сейчас? Напишите — сделаем бесплатно.",
  },

  KZ: {
    sectionTag: "Тарифтер",
    sectionTitle: "Қазір не бар және не қосылады",
    sectionSub: "Бүгін қолжетімнің бәрі — тегін. Ақылы тариф кейін шығады және бұның ешқайсысын алып қоймайды.",

    free: {
      name: "Тегін",
      price: "0 ₸",
      period: "қазір бар нәрсеге — мәңгі",
      note: "Картасыз. Аяқталатын сынақ мерзімі жоқ.",
      cta: "Тегін бастау",
      ctaAuthed: "Хабқа өту",
      features: [
        "Сабақ жоспарлары — саны шектелмейді",
        "Сынып үшін код арқылы кіретін AI тесттер",
        "Сабақ қорытындысы және сынып бойынша AI есеп",
        "Сыныптар мен оқушылар тізімі",
        "Вордл және сабаққа арналған ойындар",
        "DOCX экспорты",
        "Үш тіл: RU, KZ, EN",
      ],
      limits: "Генерация жылдамдығы AI провайдерінің квотасына байланысты: жүктеме көп кезде ұзағырақ орындалуы мүмкін.",
    },

    pro: {
      name: "PRO",
      badge: "Жақында",
      price: "—",
      period: "баға алдын ала жарияланады",
      note: "Әзірге іске қосылған жоқ. Қазір тегін нәрсенің бәрі тегін болып қалады.",
      cta: "Іске қосылғанда хабарлау",
      inherits: "Тегіндегінің бәрі, оған қоса:",
      features: [
        "Жүктеме көп кезде жоғары генерация квотасы",
        "Көбірек сынып және сыныптағы оқушы",
        "Бүкіл мектепке аккаунт және әдіскерге ортақ қолжетімділік",
        "Ұжымды оқыту және басым қолдау",
      ],
      planned: "Бұл — даму жоспары, қолданыстағы ұсыныс емес: мерзімі мен құрамы өзгеруі мүмкін.",
    },

    schoolsNote: "Мектепке аккаунт қазір керек пе? Жазыңыз — тегін жасаймыз.",
  },

  EN: {
    sectionTag: "Plans",
    sectionTitle: "What you get now, and what's coming",
    sectionSub: "Everything you can use today is free. A paid plan comes later and takes none of it away.",

    free: {
      name: "Free",
      price: "0 ₸",
      period: "forever, for what exists today",
      note: "No card. No trial that runs out.",
      cta: "Start for free",
      ctaAuthed: "Go to hub",
      features: [
        "Unlimited lesson plans",
        "AI quizzes with an access code for the class",
        "Lesson summary and AI class report",
        "Classes and student rosters",
        "Wordle and in-lesson games",
        "DOCX export",
        "Three languages: RU, KZ, EN",
      ],
      limits: "Generation speed depends on the AI provider's quota — at peak times a request may take longer.",
    },

    pro: {
      name: "PRO",
      badge: "Coming soon",
      price: "—",
      period: "pricing announced in advance",
      note: "Not launched yet. Everything free today stays free.",
      cta: "Tell me when it launches",
      inherits: "Everything in Free, plus:",
      features: [
        "Higher generation quotas at peak times",
        "More classes, and more students per class",
        "Accounts for a whole school and shared access for a lead teacher",
        "Staff training and priority support",
      ],
      planned: "This is a roadmap, not an offer — timing and contents may change.",
    },

    schoolsNote: "Need school accounts today? Email us — we'll sort it out, free.",
  },
};

export const plansFor = (lang) => PLANS[lang] || PLANS.RU;
