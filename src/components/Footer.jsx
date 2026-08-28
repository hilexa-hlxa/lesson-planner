import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Mail, Send, Instagram, Link2 } from "lucide-react";
import { CONTACT_EMAIL, SOCIALS } from "../siteConfig";

// Иконка под каждую соцсеть; для незнакомого ключа — нейтральная ссылка
const SOCIAL_ICONS = { telegram: Send, instagram: Instagram };

const T = {
  RU: {
    tagline: "AI-платформа для учителей Казахстана.",
    platform: "Платформа",
    hub: "Хаб", tools: "Инструменты", games: "Игры", classes: "Классы",
    account: "Аккаунт",
    profile: "Профиль", joinTest: "Войти в тест",
    company: "О сервисе",
    pricing: "Тарифы", privacy: "Конфиденциальность", terms: "Условия", contact: "Связаться",
    rights: "© 2026 LESSON.LAB — Все права защищены",
    made: "Сделано для учителей Казахстана",
  },
  KZ: {
    tagline: "Қазақстан мұғалімдеріне арналған AI-платформа.",
    platform: "Платформа",
    hub: "Хаб", tools: "Құралдар", games: "Ойындар", classes: "Сыныптар",
    account: "Аккаунт",
    profile: "Профиль", joinTest: "Тестке кіру",
    company: "Сервис туралы",
    pricing: "Тарифтер", privacy: "Құпиялылық", terms: "Шарттар", contact: "Байланыс",
    rights: "© 2026 LESSON.LAB — Барлық құқықтар қорғалған",
    made: "Қазақстан мұғалімдері үшін жасалған",
  },
  EN: {
    tagline: "AI platform for teachers in Kazakhstan.",
    platform: "Platform",
    hub: "Hub", tools: "Tools", games: "Games", classes: "Classes",
    account: "Account",
    profile: "Profile", joinTest: "Join a quiz",
    company: "About",
    pricing: "Pricing", privacy: "Privacy", terms: "Terms", contact: "Contact",
    rights: "© 2026 LESSON.LAB — All rights reserved",
    made: "Made for Kazakhstan teachers",
  },
};

export default function Footer({ lang = "RU" }) {
  const t = T[lang] || T.RU;
  const socials = SOCIALS.filter(s => s.href);

  // Раньше здесь было "opacity-50 hover:opacity-100": на белом фоне это
  // рендерится как rgb(127,127,127) — контраст ~4:1, ниже AA-порога 4.5:1
  // для обычного текста (11px bold сюда не дотягивает до "крупного текста").
  // Прозрачность всегда размывает цвет к фону, поэтому вместо неё — сплошные
  // оттенки slate/zinc, уже проверенные в остальном приложении.
  const linkCls = "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors";

  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">

          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 font-black text-lg italic tracking-tighter text-emerald-600">
              <GraduationCap size={22} /> LESSON.LAB
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
              {t.tagline}
            </p>

            {socials.length > 0 && (
              <div className="flex gap-2 mt-2">
                {socials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.key] || Link2;
                  return (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="p-2 rounded-xl border-2 border-black/10 dark:border-white/10 hover:border-emerald-600 hover:text-emerald-600 transition-colors"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 text-[11px] font-black uppercase tracking-widest">
            <div className="flex flex-col gap-3">
              <span className="text-slate-600 dark:text-zinc-400 mb-1">{t.platform}</span>
              <Link to="/hub" className={linkCls}>{t.hub}</Link>
              <Link to="/tools" className={linkCls}>{t.tools}</Link>
              <Link to="/games" className={linkCls}>{t.games}</Link>
              <Link to="/classes" className={linkCls}>{t.classes}</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-slate-600 dark:text-zinc-400 mb-1">{t.account}</span>
              <Link to="/profile" className={linkCls}>{t.profile}</Link>
              <Link to="/join-test" className={linkCls}>{t.joinTest}</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-slate-600 dark:text-zinc-400 mb-1">{t.company}</span>
              <Link to="/pricing" className={linkCls}>{t.pricing}</Link>
              <Link to="/privacy" className={linkCls}>{t.privacy}</Link>
              <Link to="/terms" className={linkCls}>{t.terms}</Link>
              <a href={`mailto:${CONTACT_EMAIL}`} className={`${linkCls} flex items-center gap-1.5`}>
                <Mail size={12} /> {t.contact}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] text-center sm:text-left">
          <span>{t.rights}</span>
          <span>{t.made}</span>
        </div>
      </div>
    </footer>
  );
}
