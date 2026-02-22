export const parseMarkdownQuiz = (markdown) => {
  if (!markdown) return [];

  const questions = [];
  const lines = markdown.split('\n');
  let currentQ = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // 1. Detect Question (Matches "1. Question", "## Question", "**1. Question**")
    // Regex looks for: Optional **, Optional ##, Number+Dot, Text
    if (/^(##\s|\*\*|)\d+\.|^##\s/.test(trimmed)) {
      if (currentQ && currentQ.options.length >= 2) {
        questions.push(currentQ);
      }
      
      // Clean up the string to get just text
      const text = trimmed.replace(/^(##\s|\*\*|)\d+\.\s*/, '').replace(/\**$/, '').replace(/^##\s/, '');
      
      currentQ = {
        question: text,
        options: [],
        correctIndex: 0
      };
    } 
    // 2. Detect Options (Matches "- [ ]", "- [x]", "a)", "b)", "- Answer")
    else if (currentQ) {
      // Check for Checkbox format "- [x] Answer"
      const checkboxMatch = trimmed.match(/^[-*]\s*\[([ xX])\]\s*(.+)$/);
      
      // Check for Simple List format "- Answer" or "a) Answer"
      const simpleMatch = trimmed.match(/^([-*]|[a-d]\))\s+(.+)$/);

      if (checkboxMatch) {
        const isCorrect = checkboxMatch[1].toLowerCase() === 'x';
        currentQ.options.push(checkboxMatch[2].trim());
        if (isCorrect) currentQ.correctIndex = currentQ.options.length - 1;
      } 
      else if (simpleMatch) {
        const text = simpleMatch[2].trim();
        // Check if text contains a "correct" marker like (Correct) or ✅
        const isCorrect = /✅|\(correct\)/i.test(text);
        const cleanText = text.replace(/✅|\(correct\)/gi, '').trim();
        
        currentQ.options.push(cleanText);
        if (isCorrect) currentQ.correctIndex = currentQ.options.length - 1;
      }
    }
  });

  // Push the last question found
  if (currentQ && currentQ.options.length >= 2) {
    questions.push(currentQ);
  }

  return questions;
};