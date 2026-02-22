export const DEFAULT_PROMPT_CONFIG = {
  lesson_plan: {
    style: "strict",          // strict | friendly | short
    includeTiming: true,
    includeDifferentiation: true,
    includeAssessment: true,
    includeHomework: true,
    detailLevel: "high",      // low | medium | high
    markdown: true,
    sections: [
      "goals",
      "equipment",
      "key_concepts",
      "timeline",
      "tasks",
      "differentiation",
      "assessment",
      "homework",
    ],
  },

  tests: {
    difficulty: "medium",     // easy | medium | hard
    total: 10,
    mcq: { count: 6, options: 4 },
    short: { count: 2 },
    matching: { count: 2 },
    includeAnswers: true,
    markdown: true,
    shuffle: false,
  },
};
