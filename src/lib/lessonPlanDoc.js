// Сборка готового документа из JSON, который вернула модель.
// Вынесено из Dashboard: чистая функция, её удобно проверять отдельно.
import { I18N as t, tr } from "./i18n";

export function payloadToMarkdown(p, lang) {
  const sec = p?.sections || {};
  const sm = (t[lang] || t.RU)?.doc?.sections || t.RU.doc.sections;

  const lines = [];
  lines.push(`## ${tr(lang,"doc.lessonPlan","План урока")}`);
  lines.push(`**${tr(lang,"s","Предмет")}:** ${p?.meta?.subject || ""}`);
  lines.push(`**${tr(lang,"t","Тема")}:** ${p?.meta?.topic || ""}`);
  lines.push(`**Grade:** ${p?.meta?.grade ?? ""}  **Duration:** ${p?.meta?.duration ?? ""} min`);
  if (p?.meta?.details) lines.push(`**${tr(lang,"d","Детали")}:** ${p.meta.details}`);
  lines.push("");

  // Пустую секцию не печатаем вовсе: если учитель отключил её в настройках,
  // заголовок с прочерком выглядел бы как недоработка генерации
  const renderList = (title, arr) => {
    const a = Array.isArray(arr) ? arr.filter(x => String(x ?? "").trim() !== "") : [];
    if (!a.length) return;
    lines.push(`## ${title}`);
    for (const x of a) lines.push(`- ${String(x)}`);
    lines.push("");
  };

  renderList(sm.goals, sec.goals);
  renderList(sm.equipment, sec.equipment);
  renderList(sm.key_concepts, sec.key_concepts);

  // timeline как таблица markdown; колонку с минутами показываем, только если
  // они есть — при выключенном тайминге модель оставляет их пустыми
  const tl = Array.isArray(p?.timeline) ? p.timeline : [];
  if (tl.length) {
    const withMinutes = tl.some(r => String(r?.minutes ?? "").trim() !== "");
    lines.push(`## ${sm.timeline}`);
    lines.push(withMinutes
      ? `| Stage | Minutes | Teacher | Student | Assessment | Resources |`
      : `| Stage | Teacher | Student | Assessment | Resources |`);
    lines.push(withMinutes ? `|---|---|---|---|---|---|` : `|---|---|---|---|---|`);
    for (const r of tl) {
      const cells = [r.stage||"", ...(withMinutes ? [r.minutes||""] : []), r.teacher||"", r.student||"", r.assessment||"", r.resources||""];
      lines.push(`| ${cells.join(" | ")} |`);
    }
    lines.push("");
  }

  renderList(sm.tasks, sec.tasks);
  renderList(sm.differentiation, sec.differentiation);
  renderList(sm.assessment, sec.assessment);
  renderList(sm.homework, sec.homework);

  return lines.join("\n");
}
