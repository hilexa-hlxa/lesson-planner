import React from "react";
import StaticPage, { Section, Bullets } from "../components/StaticPage";
import { CONTACT_EMAIL } from "../siteConfig";

const T = {
  RU: {
    title: "Политика конфиденциальности",
    subtitle: "Коротко и без юридического тумана: какие данные мы собираем, зачем и что вы можете с ними сделать.",
    updated: "Обновлено: 12 августа 2026",
    s1: "Какие данные мы собираем",
    s1items: [
      "Данные аккаунта: имя, фамилия, email, роль (учитель / ученик / родитель) и хеш пароля. Пароль в открытом виде не хранится.",
      "Контент, который вы создаёте: планы уроков, тесты, итоги уроков, названия классов и коды доступа.",
      "Результаты тестов учеников: имя, введённое при входе в тест, ответы и баллы.",
      "Технические данные сессии: cookie авторизации, необходимая для входа в аккаунт.",
    ],
    s2: "Зачем это нужно",
    s2body: "Данные используются только для работы сервиса: показать вашу историю генераций, собрать результаты класса и не заставлять вас логиниться заново. Мы не продаём данные, не передаём их рекламодателям и не используем для профилирования.",
    s3: "Обработка ИИ",
    s3body: "Когда вы генерируете план урока, тест или итог урока, текст запроса отправляется в Google Gemini API для обработки. Не вставляйте в поля персональные данные учеников (полные ФИО, медицинские сведения, домашние адреса) — для тестов и отчётов достаточно имени или инициалов.",
    s4: "Данные учеников",
    s4body: "Ученик заходит в тест по коду и вводит только имя — регистрация не требуется, email и телефон не запрашиваются. Учитель, создавший тест, видит имя, ответы и баллы своего класса. Другие учителя доступа к этим данным не имеют.",
    s5: "Cookie",
    s5body: "Используется одна техническая cookie — сессия авторизации. Аналитических и рекламных трекеров нет.",
    s6: "Хранение и удаление",
    s6body: "Данные хранятся в защищённой облачной базе. Вы можете удалить любой план или тест прямо в интерфейсе. Чтобы полностью удалить аккаунт со всем содержимым, напишите нам — мы удалим данные в течение 30 дней.",
    s7: "Ваши права",
    s7items: [
      "Запросить копию своих данных.",
      "Исправить неточные данные в профиле.",
      "Удалить аккаунт и связанный с ним контент.",
    ],
    s8: "Контакты",
    s8body: "Вопросы по данным и запросы на удаление:",
  },
  KZ: {
    title: "Құпиялылық саясаты",
    subtitle: "Қысқаша әрі түсінікті: қандай деректерді жинаймыз, не үшін және сіз олармен не істей аласыз.",
    updated: "Жаңартылды: 2026 жылғы 12 тамыз",
    s1: "Қандай деректерді жинаймыз",
    s1items: [
      "Аккаунт деректері: аты, тегі, email, рөлі (мұғалім / оқушы / ата-ана) және құпия сөздің хэші. Құпия сөз ашық түрде сақталмайды.",
      "Сіз жасаған мазмұн: сабақ жоспарлары, тесттер, сабақ қорытындылары, сынып атаулары мен кодтары.",
      "Оқушылардың тест нәтижелері: тестке кірген кезде енгізілген аты, жауаптары және ұпайлары.",
      "Сессияның техникалық деректері: кіру үшін қажетті авторизация cookie файлы.",
    ],
    s2: "Не үшін қажет",
    s2body: "Деректер тек сервистің жұмысы үшін қолданылады: генерация тарихын көрсету, сынып нәтижелерін жинау және сізді қайта кіргізбеу. Біз деректерді сатпаймыз, жарнама берушілерге бермейміз және профильдеу үшін пайдаланбаймыз.",
    s3: "ЖИ өңдеуі",
    s3body: "Сіз сабақ жоспарын, тест немесе қорытынды жасағанда сұраныс мәтіні өңдеу үшін Google Gemini API-ге жіберіледі. Өрістерге оқушылардың дербес деректерін (толық аты-жөні, медициналық мәліметтер, үй мекенжайы) енгізбеңіз — тесттер мен есептер үшін аты немесе аты-жөнінің әріптері жеткілікті.",
    s4: "Оқушы деректері",
    s4body: "Оқушы тестке код арқылы кіріп, тек атын енгізеді — тіркелу қажет емес, email мен телефон сұралмайды. Тестті жасаған мұғалім өз сыныбының атын, жауаптары мен ұпайларын көреді. Басқа мұғалімдердің бұл деректерге қолжетімділігі жоқ.",
    s5: "Cookie",
    s5body: "Бір ғана техникалық cookie — авторизация сессиясы қолданылады. Аналитикалық және жарнамалық трекерлер жоқ.",
    s6: "Сақтау және жою",
    s6body: "Деректер қорғалған бұлтты дерекқорда сақталады. Кез келген жоспарды немесе тестті интерфейсте өзіңіз жоя аласыз. Аккаунтты толық жою үшін бізге жазыңыз — деректерді 30 күн ішінде жоямыз.",
    s7: "Сіздің құқықтарыңыз",
    s7items: [
      "Өз деректеріңіздің көшірмесін сұрау.",
      "Профильдегі дұрыс емес деректерді түзету.",
      "Аккаунтты және оған байланысты мазмұнды жою.",
    ],
    s8: "Байланыс",
    s8body: "Деректер бойынша сұрақтар мен жою өтініштері:",
  },
  EN: {
    title: "Privacy Policy",
    subtitle: "Short and free of legal fog: what we collect, why, and what you can do about it.",
    updated: "Updated: 12 August 2026",
    s1: "What we collect",
    s1items: [
      "Account data: first name, last name, email, role (teacher / student / parent) and a password hash. Plain passwords are never stored.",
      "Content you create: lesson plans, quizzes, lesson summaries, class names and access codes.",
      "Student quiz results: the name typed when joining a quiz, the answers and the score.",
      "Session technicals: one authentication cookie, required to keep you signed in.",
    ],
    s2: "Why we need it",
    s2body: "Data is used only to run the service: show your generation history, collect class results, and keep you signed in. We do not sell data, do not share it with advertisers, and do not use it for profiling.",
    s3: "AI processing",
    s3body: "When you generate a lesson plan, quiz or summary, the prompt text is sent to the Google Gemini API for processing. Do not paste student personal data (full legal names, medical details, home addresses) into the fields — a first name or initials is enough for quizzes and reports.",
    s4: "Student data",
    s4body: "A student joins a quiz with a code and types only a name — no registration, no email, no phone number. The teacher who created the quiz sees the names, answers and scores of their own class. Other teachers have no access to that data.",
    s5: "Cookies",
    s5body: "One technical cookie is used — the authentication session. There are no analytics or advertising trackers.",
    s6: "Storage and deletion",
    s6body: "Data is stored in a secure cloud database. You can delete any plan or quiz directly in the interface. To delete your account and everything in it, email us — we will remove the data within 30 days.",
    s7: "Your rights",
    s7items: [
      "Request a copy of your data.",
      "Correct inaccurate data in your profile.",
      "Delete your account and its content.",
    ],
    s8: "Contact",
    s8body: "Data questions and deletion requests:",
  },
};

export default function PrivacyPage({ lang = "RU", ...rest }) {
  const t = T[lang] || T.RU;

  return (
    <StaticPage lang={lang} {...rest} title={t.title} subtitle={t.subtitle} updated={t.updated}>
      <Section title={t.s1}><Bullets items={t.s1items} /></Section>
      <Section title={t.s2}><p>{t.s2body}</p></Section>
      <Section title={t.s3}><p>{t.s3body}</p></Section>
      <Section title={t.s4}><p>{t.s4body}</p></Section>
      <Section title={t.s5}><p>{t.s5body}</p></Section>
      <Section title={t.s6}><p>{t.s6body}</p></Section>
      <Section title={t.s7}><Bullets items={t.s7items} /></Section>
      <Section title={t.s8}>
        <p>
          {t.s8body}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-black text-emerald-600 hover:underline">{CONTACT_EMAIL}</a>
        </p>
      </Section>
    </StaticPage>
  );
}
