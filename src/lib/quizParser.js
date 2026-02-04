export const parseMarkdownQuiz = (markdown) => {
  if (!markdown) return [];

  const questions = [];
  // Split content by "## " headers (Markdown h2 indicates a new question)
  const blocks = markdown.split(/^## /m).filter(b => b.trim());

  blocks.forEach(block => {
    // First line of the block is the question text
    const lines = block.split('\n').filter(line => line.trim());
    if (lines.length < 2) return; 

    const questionText = lines[0].trim();
    const options = [];
    let correctIndex = 0;
    let currentOptionIndex = 0;

    // Iterate through lines to find options (starting with - or *)
    // Regex matches format: "- [ ] Answer" or "- [x] Answer"
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      const match = line.match(/^[-*]\s*\[([ xX])\]\s*(.+)$/);
      
      if (match) {
        const isCorrect = match[1].toLowerCase() === 'x';
        const text = match[2].trim();
        
        options.push(text);
        if (isCorrect) {
          correctIndex = currentOptionIndex;
        }
        currentOptionIndex++;
      }
    }

    // Only add valid questions with at least 2 options
    if (options.length >= 2) {
      questions.push({
        question: questionText,
        options: options,
        correctIndex: correctIndex
      });
    }
  });

  return questions;
};