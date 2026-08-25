// Каталог достижений — один на всё приложение.
//
// Раньше названия передавались строкой прямо в grantAchievement из трёх разных
// файлов, всегда по-русски: учитель с английским интерфейсом видел в тосте
// «Высший пилотаж». Теперь вызов передаёт только ключ, а подпись берётся отсюда
// по текущему языку.

export const ACHIEVEMENTS = {
  visit_profile: {
    reward: 100,
    RU: ["В профиле", "Посетить профиль"],
    KZ: ["Профильде", "Профильге кіру"],
    EN: ["Profile visit", "Open your profile"],
  },
  architect_10: {
    reward: 250,
    RU: ["Архитектор знаний", "10 планов уроков"],
    KZ: ["Білім сәулетшісі", "10 сабақ жоспары"],
    EN: ["Knowledge architect", "10 lesson plans"],
  },
  ai_report_master: {
    reward: 300,
    RU: ["Аналитик", "Собрать AI-отчёт по классу"],
    KZ: ["Талдаушы", "Сынып бойынша AI-есеп жасау"],
    EN: ["Analyst", "Build an AI class report"],
  },
  perfect_score: {
    reward: 150,
    RU: ["Высший пилотаж", "100% за тест"],
    KZ: ["Жоғары шеберлік", "Тестке 100%"],
    EN: ["Perfect run", "100% on a quiz"],
  },
  speedrunner: {
    reward: 200,
    RU: ["Сверхзвук", "Пройти тест меньше чем за минуту"],
    KZ: ["Дыбыстан жылдам", "Тестті бір минуттан аз уақытта аяқтау"],
    EN: ["Speedrunner", "Finish a quiz in under a minute"],
  },
  night_owl: {
    reward: 100,
    RU: ["Ночная смена", "Сгенерировать план ночью"],
    KZ: ["Түнгі ауысым", "Түнде жоспар жасау"],
    EN: ["Night shift", "Generate a plan after midnight"],
  },
  rich: {
    reward: 0,
    RU: ["Богач", "Накопить 500 монет"],
    KZ: ["Байлық", "500 монета жинау"],
    EN: ["Rich", "Save up 500 coins"],
  },
  math_whiz: {
    reward: 200,
    RU: ["Математический гений", "Побить личный рекорд в Битве Чисел"],
    KZ: ["Математика данышпаны", "Сандар шайқасында жеке рекордты жаңарту"],
    EN: ["Math whiz", "Beat your personal best in Math Battle"],
  },
  memory_master: {
    reward: 100,
    RU: ["Феноменальная память", "Собрать все пары без единой ошибки"],
    KZ: ["Керемет жады", "Барлық жұпты қатесіз құрастыру"],
    EN: ["Memory master", "Clear a board with zero mistakes"],
  },
  hangman_hero: {
    reward: 150,
    RU: ["Спаситель", "Выиграть 3 раунда виселицы подряд"],
    KZ: ["Құтқарушы", "Дарға асуды қатарынан 3 рет ұту"],
    EN: ["Hangman hero", "Win 3 rounds of Hangman in a row"],
  },
  word_sprint_ace: {
    reward: 150,
    RU: ["Скорострел", "Набрать высокую скорость и точность в Спринте слов"],
    KZ: ["Жылдамдатқыш", "Сөз спринтінде жоғары жылдамдық пен дәлдікке жету"],
    EN: ["Word sprint ace", "Hit a high WPM with strong accuracy"],
  },
  sorter_supreme: {
    reward: 150,
    RU: ["Верховный сортировщик", "Разложить всё по категориям без ошибок"],
    KZ: ["Ең үздік сұрыптаушы", "Барлығын қатесіз санаттарға бөлу"],
    EN: ["Sorter supreme", "Sort a full round with zero mistakes"],
  },
  trivia_champion: {
    reward: 250,
    RU: ["Чемпион викторины", "Первым финишировать в Гонке эрудитов"],
    KZ: ["Викторина чемпионы", "Білгірлер жарысында бірінші болып финишке жету"],
    EN: ["Trivia champion", "Finish first in a Trivia Race"],
  },
  streak_3: {
    reward: 100,
    RU: ["Разминка", "Заниматься 3 дня подряд"],
    KZ: ["Қыздыру", "Қатарынан 3 күн жаттығу"],
    EN: ["Warming up", "Complete daily challenges 3 days in a row"],
  },
  streak_7: {
    reward: 250,
    RU: ["Недельный марафон", "Заниматься 7 дней подряд"],
    KZ: ["Апталық марафон", "Қатарынан 7 күн жаттығу"],
    EN: ["Weekly streak", "Complete daily challenges 7 days in a row"],
  },
  streak_30: {
    reward: 500,
    RU: ["Железная дисциплина", "Заниматься 30 дней подряд"],
    KZ: ["Темірдей тәртіп", "Қатарынан 30 күн жаттығу"],
    EN: ["Iron discipline", "Complete daily challenges 30 days in a row"],
  },
};

/** Название и описание достижения на нужном языке. */
export function achievementText(key, lang = "RU") {
  const a = ACHIEVEMENTS[key];
  if (!a) return { title: key, desc: "" };
  const [title, desc] = a[lang] || a.RU;
  return { title, desc };
}

export function achievementReward(key) {
  return ACHIEVEMENTS[key]?.reward ?? 0;
}
