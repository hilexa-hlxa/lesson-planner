// src/i18n.js
export const LANGS = ["KZ", "RU", "EN"];

export const LANG_LABEL = {
  RU: "русском",
  KZ: "казахском",
  EN: "английском",
};

export const I18N = {
  RU: {
    h: "ИСТОРИЯ", p: "ПАРАМЕТРЫ", r: "РЕЗУЛЬТАТ", s: "Предмет", t: "Тема", d: "Детали", g: "ГЕНЕРИРОВАТЬ",
    edit: "Изменить", del: "Удалить", exit: "ВЫХОД",
    lt: { hero: "Планируйте уроки эффективно", sub: "Профессиональная система автоматизации учебных планов нового поколения.", login: "Войти", signup: "Регистрация", join: "Начать работу" },
    hub: { title: "Выберите направление", tools: "Инструменты", games: "Игротека (Скоро)", go: "Открыть" },
    prof: { title: "Мой Профиль", mail: "Почта", stats: "Статистика", back: "Назад в Хаб", edit: "Редактировать", empty: "Пустое пространство", save: "Сохранить", cancel: "Отмена" },
    auth: {
      loginTitle: "С возвращением!",
      signupTitle: "Создать аккаунт",
      email: "ПОЧТА",
      pass: "ПАРОЛЬ",
      enter: "ВОЙТИ",
      switchL: "Нет аккаунта? Регистрация",
      switchS: "Уже есть аккаунт? Войти",

      firstName: "ИМЯ",
      lastName: "ФАМИЛИЯ",
      role: "РОЛЬ",
      roleTeacher: "Учитель",
      roleParent: "Родитель",
      roleStudent: "Ученик",
      signupEnter: "СОЗДАТЬ АККАУНТ"
    },
    menu: { hub: "Перейти в хаб", dashboard: "Перейти в Dashboard", logout: "Выйти" },

    // === НОВЫЕ ПЕРЕВОДЫ ДЛЯ ПАНЕЛИ ИНСТРУМЕНТОВ ===
    tools: {
        wheel: "Колесо",
        dice: "Кубик",
        noise: "Шум",
        timer: "Таймер",
        close: "Закрыть",
        noiseTitle: "Шумомер",
        noiseDesc: "Доступ к микрофону"
    },

    prompts: {
      back: "Назад",
      title: "Настройки промптов",
      subtitle: "Здесь настраиваются “глубокие” параметры генерации (стиль, детализация, блоки, ответы и т.д.).",
      lessonTitle: "Настройки плана урока",
      style: "Стиль",
      detail: "Уровень детализации",
      strict: "Строгий",
      friendly: "Дружелюбный",
      short: "Краткий",
      low: "Низкий",
      medium: "Средний",
      high: "Высокий",
      includeTiming: "Поминутное планирование",
      includeDifferentiation: "Дифференциация",
      includeAssessment: "Оценивание",
      includeHomework: "Домашнее задание",
      markdown: "Формат Markdown",
      testsTitle: "Настройки тестов",
      difficulty: "Сложность",
      total: "Количество вопросов",
      easy: "Лёгкая",
      hard: "Сложная",
      includeAnswers: "Показывать ответы",
      shuffle: "Перемешивать вопросы",
      reset: "Сбросить",
      save: "Сохранить",
    },

    doc: {
      lessonPlan: "План урока",
      test: "Тест",
      createPlan: "СОЗДАТЬ ПЛАН",
      createTest: "СОЗДАТЬ ТЕСТ",
      exportDocx: "ВЫГРУЗИТЬ DOCX",
      sections: {
        goals: "Цели урока",
        equipment: "Оборудование",
        key_concepts: "Ключевые понятия",
        timeline: "Ход урока по минутам",
        tasks: "Задания",
        differentiation: "Дифференциация",
        assessment: "Оценивание",
        homework: "Домашнее задание",
      },
    },
  },

  KZ: {
    h: "ТАРИХ", p: "ПАРАМЕТРЛЕР", r: "НӘТИЖЕ", s: "Пән", t: "Сабақ тақырыбы", d: "Мәліметтер", g: "ҚҰРАСТЫРУ",
    edit: "Өзгерту", del: "Өшіру", exit: "ШЫҒУ",
    lt: { hero: "Сабақты тиімді жоспарлаңыз", sub: "Оқу жоспарларын автоматты төрде құрастыруға арналған кәсіби жүйе.", login: "Кіру", signup: "Тіркелу", join: "Жұмысты бастау" },
    hub: { title: "Бағытты таңдаңыз", tools: "Құралдар", games: "Ойындар (Жақында)", go: "Ашу" },
    prof: { title: "Менің Профилім", mail: "Пошта", stats: "Статистика", back: "Хабқа қайту", edit: "Өңдеу", empty: "Бос орын", save: "Сақтау", cancel: "Бас тарту" },
    auth: {
      loginTitle: "Қош келдіңіз!",
      signupTitle: "Тіркелу",
      email: "ПОШТА",
      pass: "ҚҰПИЯ СӨЗ",
      enter: "КІРУ",
      switchL: "Тіркелмегенсіз бе? Тіркелу",
      switchS: "Аккаунтыңыз бар ма? Кіру",

      firstName: "АТЫ",
      lastName: "ТЕГІ",
      role: "РОЛЬ",
      roleTeacher: "Мұғалім",
      roleParent: "Ата-ана",
      roleStudent: "Оқушы",
      signupEnter: "ТІРКЕЛУ"
    },
    menu: { hub: "Хабқа өту", dashboard: "Dashboard-қа өту", logout: "Шығу" },

    // === ЖАҢА АУДАРМАЛАР (ҚҰРАЛДАР) ===
    tools: {
        wheel: "Дөңгелек",
        dice: "Сүйек",
        noise: "Шу",
        timer: "Таймер",
        close: "Жабу",
        noiseTitle: "Шу өлшегіш",
        noiseDesc: "Микрофонға рұқсат"
    },

    prompts: {
      back: "Артқа",
      title: "Промпт баптаулары",
      subtitle: "Мұнда генерацияның “терең” параметрлері бапталады (стиль, егжей-тегжей, блоктар, жауаптар және т.б.).",
      lessonTitle: "Сабақ жоспарының баптаулары",
      style: "Стиль",
      detail: "Егжей-тегжей деңгейі",
      strict: "Қатаң",
      friendly: "Достық",
      short: "Қысқа",
      low: "Төмен",
      medium: "Орташа",
      high: "Жоғары",
      includeTiming: "Минуттық жоспарлау",
      includeDifferentiation: "Дифференциация",
      includeAssessment: "Бағалау",
      includeHomework: "Үй тапсырмасы",
      markdown: "Markdown форматы",
      testsTitle: "Тест баптаулары",
      difficulty: "Қиындық деңгейі",
      total: "Сұрақтар саны",
      easy: "Оңай",
      hard: "Қиын",
      includeAnswers: "Жауаптарды көрсету",
      shuffle: "Сұрақтарды араластыру",
      reset: "Қалпына келтіру",
      save: "Сақтау",
    },

    doc: {
      lessonPlan: "Сабақ жоспары",
      test: "Тест",
      createPlan: "ЖОСПАР ҚҰРУ",
      createTest: "ТЕСТ ҚҰРУ",
      exportDocx: "DOCX ЖҮКТЕУ",
      sections: {
        goals: "Сабақтың мақсаты",
        equipment: "Қажетті құралдар",
        key_concepts: "Негізгі ұғымдар",
        timeline: "Сабақ барысы (минутпен)",
        tasks: "Тапсырмалар",
        differentiation: "Дифференциация",
        assessment: "Бағалау",
        homework: "Үй тапсырмасы",
      },
    },
  },

  EN: {
    h: "HISTORY", p: "PARAMETERS", r: "RESULT", s: "Subject", t: "Topic", d: "Details", g: "GENERATE",
    edit: "Edit", del: "Delete", exit: "EXIT",
    lt: { hero: "Plan Lessons Effectively", sub: "Professional next-generation automated lesson planning system.", login: "Sign In", signup: "Sign Up", join: "Get Started" },
    hub: { title: "Choose Direction", tools: "Tools", games: "Games (Soon)", go: "Open" },
    prof: { title: "My Profile", mail: "Email", stats: "Statistics", back: "Back to Hub", edit: "Edit Profile", empty: "Empty Space", save: "Save", cancel: "Cancel" },
    auth: {
      loginTitle: "Welcome back!",
      signupTitle: "Create Account",
      email: "EMAIL",
      pass: "PASSWORD",
      enter: "ENTER",
      switchL: "Don't have an account? Sign Up",
      switchS: "Already have an account? Log In",

      firstName: "FIRST NAME",
      lastName: "LAST NAME",
      role: "ROLE",
      roleTeacher: "Teacher",
      roleParent: "Parent",
      roleStudent: "Student",
      signupEnter: "CREATE ACCOUNT"
    },
    menu: { hub: "Go to Hub", dashboard: "Go to Dashboard", logout: "Log out" },

    // === NEW TRANSLATIONS (TOOLS) ===
    tools: {
        wheel: "Wheel",
        dice: "Dice",
        noise: "Noise",
        timer: "Timer",
        close: "Close",
        noiseTitle: "Noise Meter",
        noiseDesc: "Access to microphone"
    },

    prompts: {
      back: "Back",
      title: "Prompt Settings",
      subtitle: "Configure advanced generation parameters (style, detail level, structure, answers, etc.).",
      lessonTitle: "Lesson Plan Settings",
      style: "Style",
      detail: "Detail level",
      strict: "Strict",
      friendly: "Friendly",
      short: "Short",
      low: "Low",
      medium: "Medium",
      high: "High",
      includeTiming: "Minute-by-minute planning",
      includeDifferentiation: "Differentiation",
      includeAssessment: "Assessment",
      includeHomework: "Homework",
      markdown: "Markdown format",
      testsTitle: "Test Settings",
      difficulty: "Difficulty",
      total: "Number of questions",
      easy: "Easy",
      hard: "Hard",
      includeAnswers: "Show answers",
      shuffle: "Shuffle questions",
      reset: "Reset",
      save: "Save",
    },

    doc: {
      lessonPlan: "Lesson plan",
      test: "Test",
      createPlan: "CREATE PLAN",
      createTest: "CREATE TEST",
      exportDocx: "EXPORT DOCX",
      sections: {
        goals: "Lesson objectives",
        equipment: "Equipment",
        key_concepts: "Key concepts",
        timeline: "Minute-by-minute plan",
        tasks: "Tasks",
        differentiation: "Differentiation",
        assessment: "Assessment",
        homework: "Homework",
      },
    },
  },
};

// Безопасный доступ к переводам: tr(lang, "prompts.title")
export function tr(lang, path, fallback = "") {
  const pack = I18N[lang] || I18N.RU;
  const parts = String(path || "").split(".");
  let cur = pack;
  for (const p of parts) {
    cur = cur?.[p];
    if (cur == null) return fallback;
  }
  return typeof cur === "string" ? cur : fallback;
}

export function langWord(lang) {
  return LANG_LABEL[lang] || LANG_LABEL.RU;
}