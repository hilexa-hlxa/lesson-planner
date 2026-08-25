// Короткие фразы для печати в Word Sprint — набор захардкожен, а не тянется
// из word_bank: там только отдельные слова для Wordle/Hangman, а спринту
// нужны связные предложения, чтобы измерять реальную скорость печати, а не
// скорость нажатия одной клавиши.

export const SPRINT_SENTENCES = {
  RU: [
    "Быстрая печать помогает успевать за мыслью на уроке.",
    "Учитель задал домашнее задание по трём предметам.",
    "Сегодня на перемене мы играли в новую игру.",
    "Хороший конспект экономит время перед экзаменом.",
    "Библиотека открыта с девяти утра до шести вечера.",
    "Каждый ученик выбрал свою тему для проекта.",
    "На уроке химии мы провели простой опыт.",
    "Точность важнее скорости, если торопиться некуда.",
    "Учебный год пролетел быстрее, чем мы ожидали.",
    "Практика каждый день даёт заметный результат уже через неделю.",
  ],
  KZ: [
    "Жылдам теру сабақта ойыңды үлгертуге көмектеседі.",
    "Мұғалім үш пән бойынша үй тапсырмасын берді.",
    "Бүгін үзілісте біз жаңа ойын ойнадық.",
    "Жақсы конспект емтихан алдында уақыт үнемдейді.",
    "Кітапхана таңғы тоғыздан кешкі алтыға дейін ашық.",
    "Әр оқушы жобасына өз тақырыбын таңдады.",
    "Химия сабағында біз қарапайым тәжірибе жасадық.",
    "Асығатын жер жоқ болса, дәлдік жылдамдықтан маңызды.",
    "Оқу жылы біз күткеннен де тез өтті.",
    "Күнделікті жаттығу бір аптадан кейін-ақ нәтиже береді.",
  ],
  EN: [
    "Fast typing helps you keep up with the lesson.",
    "The teacher assigned homework in three subjects today.",
    "We played a new game during recess this morning.",
    "A good set of notes saves time before the exam.",
    "The library is open from nine to six on weekdays.",
    "Every student picked their own topic for the project.",
    "We ran a simple experiment in chemistry class.",
    "Accuracy matters more than speed when there's no rush.",
    "The school year went by faster than we expected.",
    "Daily practice shows a real result within just one week.",
  ],
};

export function getSprintSentence(lang = "RU", index = 0) {
  const list = SPRINT_SENTENCES[lang] || SPRINT_SENTENCES.RU;
  return list[index % list.length];
}
