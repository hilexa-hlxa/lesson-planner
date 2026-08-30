// Единое сообщение "лимит генераций исчерпан" — используется во всех 9
// страниц, где вызывается api.generateStream. Не дублируем текст в T каждой
// страницы: один источник проще держать в курсе актуальных цифр тарифа
// (см. src/lib/plans.js, backend/src/Plans.php — цифры должны совпадать
// во всех трёх местах).
const MESSAGE = {
  RU: (limit) => `Лимит генераций на этот месяц исчерпан (${limit} на бесплатном тарифе). Перейдите на PRO — 150 в месяц: /pricing`,
  KZ: (limit) => `Осы айға генерация лимиті таусылды (тегін тарифте ${limit}). PRO-ға өтіңіз — айына 150: /pricing`,
  EN: (limit) => `You've used this month's generation limit (${limit} on the free plan). Upgrade to PRO for 150/month: /pricing`,
};

// Возвращает готовое сообщение, если ошибка — именно превышение квоты
// (err.code === 'quota_exceeded', см. backend/public/index.php), иначе null
// — тогда вызывающий код показывает свой обычный текст ошибки.
export function quotaMessage(lang, err) {
  if (!err || err.code !== "quota_exceeded") return null;
  const build = MESSAGE[lang] || MESSAGE.RU;
  return build(err.limit ?? 15);
}

// Локальный usage-стейт (App.jsx) обновляется из GET /api/me раз в 5 минут
// (см. meCached в apiCache.js) — после успешной генерации счётчик там ещё
// старый. Увеличиваем его оптимистично, как коины в ProfilePage.jsx: если
// разойдёмся на единицу, следующий /api/me всё равно исправит.
export function bumpUsage(setUsage) {
  setUsage((prev) => {
    if (!prev) return prev;
    const used = prev.used + 1;
    return { ...prev, used, remaining: Math.max(0, prev.limit - used) };
  });
}

// При 402 quota_exceeded сервер уже прислал точные цифры (см.
// backend/public/index.php) — синхронизируем usage сразу этим ответом,
// а не ждём следующего /api/me.
export function usageFromQuotaError(err) {
  if (!err || err.code !== "quota_exceeded") return null;
  return { plan: err.plan, limit: err.limit, used: err.used, remaining: 0 };
}
