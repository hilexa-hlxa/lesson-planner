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
