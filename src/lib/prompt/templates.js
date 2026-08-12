import { DEFAULT_PROMPT_CONFIG } from "./defaults";
import { langWord } from "../i18n";

function escapeJsonString(s) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");
}

// Как настройки со страницы /prompts звучат для модели
const PLAN_STYLE = {
  strict:   `Formal and methodical, the way an inspection-ready plan reads.`,
  friendly: `Warm and conversational, as if explaining the lesson to a colleague.`,
  short:    `Terse. Short bullet points, no elaboration.`,
};

const PLAN_DETAIL = {
  low:    `Keep it brief: 1-2 short bullets per section, 6 timeline stages.`,
  medium: `Moderate depth: 2-3 bullets per section, 6-8 timeline stages.`,
  high:   `Thorough: 3-5 bullets per section, 8-10 timeline stages, concrete examples.`,
};

export function buildPrompt(type, vars, cfg) {
  // 1. Lesson Plan Generation
  if (type === "lesson_plan") {
    const c = { ...DEFAULT_PROMPT_CONFIG.lesson_plan, ...(cfg?.lesson_plan || {}) };

    const gradeInt = Number.isFinite(Number(vars.grade)) ? Number(vars.grade) : 0;
    const durationInt = Number.isFinite(Number(vars.duration)) ? Number(vars.duration) : 0;

    // Секции, которые учитель отключил, просим оставить пустыми —
    // Dashboard такие в готовый документ не выводит
    const skipped = [
      !c.includeDifferentiation && "differentiation",
      !c.includeAssessment && "assessment",
      !c.includeHomework && "homework",
    ].filter(Boolean);

    return [
      `You are a professional lesson planner (methodologist).`,
      `Generate a lesson plan strictly as VALID JSON.`,
      ``,
      `Language of ALL text inside JSON: ${langWord(vars.lang)}.`,
      `Tone: ${PLAN_STYLE[c.style] || PLAN_STYLE.strict}`,
      `Depth: ${PLAN_DETAIL[c.detailLevel] || PLAN_DETAIL.high}`,
      c.includeTiming
        ? `Timing: every timeline item MUST carry a minute range in "minutes", e.g. "0-5", and the ranges MUST add up to ${durationInt} minutes.`
        : `Timing: leave "minutes" as "" for every timeline item — the teacher does not want a per-minute breakdown.`,
      skipped.length
        ? `Leave these sections as empty arrays, the teacher turned them off: ${skipped.join(", ")}.`
        : null,
      ``,
      `INPUT (use these values exactly in meta):`,
      `- subject: ${vars.subject}`,
      `- topic: ${vars.topic}`,
      `- grade: ${gradeInt}`,
      `- duration: ${durationInt}`,
      vars.details ? `- details: ${vars.details}` : `- details:`,
      ``,
      `STRICT RULES:`,
      `1) Output ONLY JSON. No markdown, no code fences, no comments, no extra text.`,
      `2) JSON must start with "{" and end with "}".`,
      `3) meta.subject MUST equal the input subject.`,
      `4) meta.topic MUST equal the input topic.`,
      `5) meta.grade MUST equal the input grade (integer).`,
      `6) meta.duration MUST equal the input duration (integer).`,
      `7) timeline MUST contain ${c.detailLevel === "low" ? "6" : c.detailLevel === "medium" ? "6-8" : "8-10"} items.`,
      `8) Each timeline item MUST include: stage, minutes, teacher, student, assessment, resources.`,
      `9) teacher/student/assessment/resources MUST be arrays of strings (bullet points).`,
      `10) Do NOT use null. Use "" or [] instead.`,
      ``,
      `OUTPUT JSON SCHEMA (follow keys exactly):`,
      `{`,
      `  "schema": "lessonlab.kmj.v1",`,
      `  "lang": "${vars.lang}",`,
      `  "meta": {`,
      `    "subject": "${escapeJsonString(vars.subject)}",`,
      `    "topic": "${escapeJsonString(vars.topic)}",`,
      `    "grade": ${gradeInt},`,
      `    "duration": ${durationInt},`,
      `    "details": "${escapeJsonString(vars.details || "")}",`,
      `    "lesson_number": "",`,
      `    "unit": "",`,
      `    "date": "",`,
      `    "teacher_name": "",`,
      `    "present_count": "",`,
      `    "absent_count": ""`,
      `  },`,
      `  "sections": {`,
      `    "learning_objectives": [],`,
      `    "lesson_goal": [],`,
      `    "values": [],`,
      `    "goals": [],`,
      `    "equipment": [],`,
      `    "key_concepts": [],`,
      `    "tasks": [],`,
      `    "differentiation": [],`,
      `    "assessment": [],`,
      `    "homework": []`,
      `  },`,
      `  "timeline": [`,
      `    {`,
      `      "stage": "",`,
      `      "minutes": "0-0",`,
      `      "teacher": [],`,
      `      "student": [],`,
      `      "assessment": [],`,
      `      "resources": []`,
      `    }`,
      `  ]`,
      `}`,
      ``,
      skipped.length
        ? `IMPORTANT: Replace empty strings/arrays with real content, EXCEPT the sections listed as turned off. Keep the same structure.`
        : `IMPORTANT: Replace all empty strings/arrays with real content. Keep the same structure.`,
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