// Реестр "переходов" для командной палитры (Cmd/Ctrl+K). Раньше единственный
// способ найти один из 30+ маршрутов — листать карточки на ToolsPage/GamesPage
// вручную; при таком количестве инструментов это не масштабируется.
//
// Названия продублированы из ToolsPage.jsx/GamesPage.jsx/HubPage.jsx намеренно:
// там они живут внутри JSX конкретной карточки, откуда их не импортировать
// без более крупного рефакторинга тех страниц. Если добавляется новый
// инструмент — не забудь добавить и сюда.

import {
  BookOpen, FileQuestion, ClipboardList, Repeat, MessageCircle, FileText,
  Layers, Table, Languages, Shuffle, LayoutGrid, ClipboardCheck, Layers3,
  Play, LetterText, Zap, LifeBuoy, Brain, Keyboard, Flag,
  Home, GraduationCap, Gamepad2, Users, User, Settings2, CreditCard, Flame,
} from "lucide-react";

const L = (ru, kz, en) => ({ RU: ru, KZ: kz, EN: en });

// group: используется только для заголовков секций в самой палитре
const TOOLS = [
  { path: "/generate", icon: BookOpen, label: L("План урока", "Сабақ жоспары", "Lesson Plan") },
  { path: "/create-test", icon: FileQuestion, label: L("AI Тест", "AI Тест", "AI Test") },
  { path: "/lesson-summary", icon: ClipboardList, label: L("Итог урока", "Сабақ қорытындысы", "Lesson Summary") },
  { path: "/reteach-planner", icon: Repeat, label: L("Переповторение", "Қайта өту", "Reteach Planner") },
  { path: "/parent-message", icon: MessageCircle, label: L("Сообщение родителю", "Ата-анаға хабарлама", "Parent Message") },
  { path: "/worksheet-generator", icon: FileText, label: L("Рабочий лист", "Жұмыс парағы", "Worksheet") },
  { path: "/differentiated-worksheet", icon: Layers, label: L("Разноуровневый лист", "Деңгейлік парақ", "Differentiated Sheet") },
  { path: "/rubric-builder", icon: Table, label: L("Критерии оценивания", "Бағалау критерийлері", "Rubric Builder") },
  { path: "/translate-materials", icon: Languages, label: L("Перевод материала", "Материалды аудару", "Translate Material") },
  { path: "/random-grouping", icon: Shuffle, label: L("Случайные группы", "Кездейсоқ топтар", "Random Grouping") },
  { path: "/seating-chart", icon: LayoutGrid, label: L("Рассадка класса", "Сыныпты отырғызу", "Seating Chart") },
  { path: "/behavior-log", icon: ClipboardCheck, label: L("Журнал поведения", "Мінез-құлық журналы", "Behavior Log") },
  { path: "/flashcard-export", icon: Layers3, label: L("Карточки для повторения", "Қайталау карточкалары", "Flashcards") },
].map((item) => ({ ...item, group: "tools", requiresAuth: true }));

const GAMES = [
  { path: "/join-test", icon: Play, label: L("Войти в Тест", "Тестке кіру", "Join Quiz") },
  { path: "/wordle", icon: LetterText, label: L("Вордл", "Вордл", "Wordle") },
  { path: "/math-battle", icon: Zap, label: L("Битва Чисел", "Сандар шайқасы", "Math Battle") },
  { path: "/hangman", icon: LifeBuoy, label: L("Виселица", "Дарға асу", "Hangman") },
  { path: "/memory-match", icon: Brain, label: L("Игра на Память", "Жад ойыны", "Memory Match") },
  { path: "/word-sprint", icon: Keyboard, label: L("Спринт Слов", "Сөз спринті", "Word Sprint") },
  { path: "/sort-it-out", icon: LayoutGrid, label: L("Разложи по Полочкам", "Орнына қой", "Sort It Out") },
  { path: "/trivia-race", icon: Flag, label: L("Гонка Эрудитов", "Білгірлер жарысы", "Trivia Race") },
].map((item) => ({ ...item, group: "games", requiresAuth: item.path !== "/join-test" }));

const NAV = [
  { path: "/hub", icon: Home, label: L("Хаб", "Хаб", "Hub"), requiresAuth: true },
  { path: "/tools", icon: GraduationCap, label: L("Инструменты", "Құралдар", "Tools"), requiresAuth: true },
  { path: "/games", icon: Gamepad2, label: L("Игры", "Ойындар", "Games"), requiresAuth: true },
  { path: "/classes", icon: Users, label: L("Классы", "Сыныптар", "Classes"), requiresAuth: true },
  { path: "/daily-challenge", icon: Flame, label: L("Задание дня", "Күндізгі тапсырма", "Daily Challenge"), requiresAuth: true },
  { path: "/profile", icon: User, label: L("Профиль", "Профиль", "Profile"), requiresAuth: true },
  { path: "/prompts", icon: Settings2, label: L("Настройки генерации", "Генерация баптаулары", "Generation Settings"), requiresAuth: true },
  { path: "/pricing", icon: CreditCard, label: L("Тарифы", "Тарифтер", "Pricing"), requiresAuth: false },
].map((item) => ({ ...item, group: "nav" }));

const ALL_ITEMS = [...NAV, ...TOOLS, ...GAMES];

// lang — язык подписей в результатах. isAuthed — прячет пункты, доступные
// только под аккаунтом (см. Protected.jsx: без пользователя всё равно
// редиректнёт на "/", так что нет смысла их даже показывать в списке).
export function getCommandPaletteItems(lang, isAuthed) {
  return ALL_ITEMS
    .filter((item) => isAuthed || !item.requiresAuth)
    .map((item) => ({
      ...item,
      text: item.label[lang] || item.label.RU,
      // Ищем по всем трём языкам сразу — переключаться ради поиска не нужно
      searchable: `${item.label.RU} ${item.label.KZ} ${item.label.EN} ${item.path}`.toLowerCase(),
    }));
}
