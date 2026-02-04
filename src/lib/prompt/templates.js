import { DEFAULT_PROMPT_CONFIG } from "./defaults";
import { I18N as t, langWord } from "../i18n";

export function buildPrompt(type, vars, cfg) {
  // 1. Lesson Plan Generation
  if (type === "lesson_plan") {
    const c = cfg?.lesson_plan || DEFAULT_PROMPT_CONFIG.lesson_plan;
    const pack = t[vars.lang] || t.RU;
    const secMap = pack?.doc?.sections || t.RU.doc.sections;

    const sections = (c.sections || [])
      .map((key) => `- ${secMap[key] || key}`)
      .join("\n");

    return [
      `Role: Professional Methodologist.`,
      `Task: Create a lesson plan strictly in language: ${langWord(vars.lang)}.`,
      ``,
      `Lesson Data:`,
      `- Subject: ${vars.subject}`,
      `- Topic: ${vars.topic}`,
      `- Grade: ${vars.grade}`,
      `- Duration: ${vars.duration} minutes`,
      vars.details ? `- Details: ${vars.details}` : null,
      ``,
      `Configuration:`,
      `- Detail Level: ${c.detailLevel}`,
      `- Structure (follow order):\n${sections}`,
      ``,
      `Instructions:`,
      `- Be specific, avoid fluff.`,
      `- Use Markdown (bold for headers).`,
    ].filter(Boolean).join("\n");
  }

  // 2. Quiz Generation (Strict Format & Unique Answers)
  if (type === "tests") {
    const c = cfg?.tests || DEFAULT_PROMPT_CONFIG.tests;
    const totalQ = c.total || 10;

    return [
      `Role: Professional Quiz Generator.`,
      `Task: Create a multiple-choice quiz strictly in language: ${langWord(vars.lang)}.`,
      ``,
      `Input Data:`,
      `- Subject: ${vars.subject}`,
      `- Topic: ${vars.topic}`,
      `- Grade: ${vars.grade}`,
      `- Question Count: ${totalQ}`,
      `- Difficulty: ${c.difficulty}`,
      vars.details ? `- Context: ${vars.details}` : null,
      ``,
      `CRITICAL OUTPUT RULES (STRICT MARKDOWN):`,
      `1. No introduction or conclusion. Start directly with questions.`,
      `2. Mark the correct answer IMMEDIATELY within the options using [x].`,
      `3. Use this EXACT format:`,
      ``,
      `## Question Text Here?`,
      `- [ ] Wrong Option`,
      `- [x] Correct Option`,
      `- [ ] Wrong Option`,
      ``,
      `4. Total questions must be exactly: ${totalQ}.`,
      `5. CRITICAL: All options within a single question must be UNIQUE. No duplicates allowed.`,
      `6. For math questions, ensure there is only one correct answer.`,
    ].filter(Boolean).join("\n");
  }

  return "";
}